import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';
import { generateQuotePDF } from '@/lib/services/quote.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch quote with relations
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*, customers(company_name, contact_email, contact_phone, type), items:quote_items(*)')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Fetch settings
    const settings = await SettingsRepository.getSettings();

    // Generate PDF
    const pdfBuffer = await generateQuotePDF(quote, settings);

    const quoteNumber = quote.quote_number || quoteId.substring(0, 8).toUpperCase();
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
    console.error('Quote generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote. Please try again.' },
      { status: 500 }
    );
  }
}
