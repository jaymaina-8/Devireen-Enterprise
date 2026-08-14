import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';
import { generateQuotePDF } from '@/lib/services/quote.service';
import { AppError } from '@/lib/errors/AppError';
import { logger } from '@/lib/logger';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const ip = await getClientIp();
    const rateLimitResult = await rateLimit(ip, 'PDF_GENERATION');

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
            ),
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      );
    }

    const { quoteId } = await params;

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch quote with relations
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(
        '*, customers(company_name, contact_email, contact_phone, type), items:quote_items(*)'
      )
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Fetch settings
    const settings = await SettingsRepository.getSettings();

    // Generate PDF
    const pdfBuffer = await generateQuotePDF(quote, settings);

    const quoteNumber =
      quote.quote_number || quoteId.substring(0, 8).toUpperCase();
    const filename = `Quotation-${quoteNumber}.pdf`;

    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.byteLength),
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      if (error.statusCode >= 500) {
        logger.error('Quote generation AppError:', error);
      } else {
        logger.warn('Quote generation AppError:', error);
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    logger.error('Quote generation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
