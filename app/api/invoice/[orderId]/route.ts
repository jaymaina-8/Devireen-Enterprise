import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/lib/supabase/repositories/order.repository';
import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';
import { generateInvoicePDF } from '@/lib/services/invoice.service';
import { AppError } from '@/lib/errors/AppError';
import { logger } from '@/lib/logger';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { hasValidInvoiceAccessToken } from '@/lib/security/invoice-access';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function hasAdminAccess(): Promise<boolean> {
  try {
    await verifyAdminServerAction();
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
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

    const { orderId } = await params;

    if (!UUID_PATTERN.test(orderId)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 400 });
    }

    const isAdmin = await hasAdminAccess();
    if (!isAdmin) {
      const accessRecord = await OrderRepository.getInvoiceAccessHash(orderId);
      const token = request.nextUrl.searchParams.get('token');

      if (
        !hasValidInvoiceAccessToken(
          accessRecord?.invoice_access_token_hash,
          token
        )
      ) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
    }

    // Fetch order and settings in parallel
    const [order, settings] = await Promise.all([
      OrderRepository.getOrderById(orderId),
      SettingsRepository.getSettings(),
    ]);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(order, settings);

    const invoiceNumber =
      order.invoice_number || orderId.substring(0, 8).toUpperCase();
    const filename = `Invoice-${invoiceNumber}.pdf`;

    // Use ArrayBuffer — universally valid as BodyInit across TS DOM lib versions
    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.byteLength),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      if (error.statusCode >= 500) {
        logger.error('Invoice generation AppError:', error);
      } else {
        logger.warn('Invoice generation AppError:', error);
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    logger.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
