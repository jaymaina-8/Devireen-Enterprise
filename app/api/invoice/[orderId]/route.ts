import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/lib/supabase/repositories/order.repository';
import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';
import { generateInvoicePDF } from '@/lib/services/invoice.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
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

    const invoiceNumber = order.invoice_number || orderId.substring(0, 8).toUpperCase();
    const filename = `Invoice-${invoiceNumber}.pdf`;

    // Use ArrayBuffer — universally valid as BodyInit across TS DOM lib versions
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
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice. Please try again.' },
      { status: 500 }
    );
  }
}
