import { NextResponse } from 'next/server';
import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';
import { generateCatalogPDF } from '@/lib/services/catalog.service';
import { fetchProducts } from '@/actions/product.actions';

/**
 * GET /api/catalog
 *
 * Generates and streams a wholesale product catalog PDF containing all
 * products that have a wholesale_price set and are not DISCONTINUED.
 */
export async function GET() {
  try {
    // Fetch products and company settings in parallel
    const [{ data: products }, settings] = await Promise.all([
      fetchProducts({ context: 'wholesale' }),
      SettingsRepository.getSettings(),
    ]);

    // Only include products with wholesale pricing
    const wholesaleProducts = (products || []).filter(
      (p: any) => p.wholesale_price != null && p.stock_status !== 'DISCONTINUED'
    );

    if (wholesaleProducts.length === 0) {
      return NextResponse.json(
        { error: 'No wholesale products are currently available.' },
        { status: 404 }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = await generateCatalogPDF(wholesaleProducts, settings);

    const companyName = (settings?.company_name || 'Devireen').replace(
      /\s+/g,
      '-'
    );
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filename = `${companyName}-Wholesale-Catalog-${date}.pdf`;

    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.byteLength),
        // Cache for 1 hour — catalog changes infrequently
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('[/api/catalog] generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate catalog. Please try again.' },
      { status: 500 }
    );
  }
}
