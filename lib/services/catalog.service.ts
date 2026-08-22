import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import React from 'react';
import fs from 'fs';
import path from 'path';

// Helper to load logo as base64 for reliable PDF generation across environments
let logoBase64 = '';
try {
  const logoPath = path.join(
    process.cwd(),
    'public',
    'images',
    'devireen-logo.png'
  );
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} catch (e) {
  console.warn('Could not load devireen-logo.png for PDF:', e);
}

// ─── Brand tokens ──────────────────────────────────────────────────────────
const RED = '#DC2626';
const RED50 = '#FEF2F2';
const DARK = '#111827';
const INK = '#374151';
const MUTED = '#6B7280';
const RULE = '#E5E7EB';
const BG = '#F9FAFB';
const GREEN = '#059669';

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: INK,
    paddingTop: 44,
    paddingBottom: 64,
    paddingHorizontal: 52,
    backgroundColor: '#ffffff',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 18,
    borderBottom: `2px solid ${RED}`,
  },
  headerLeft: { flex: 1, flexDirection: 'column' },
  logo: {
    height: 36,
    objectFit: 'contain',
    objectPositionX: 0,
    marginBottom: 6,
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 3,
  },
  companyMeta: {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.55,
  },
  headerRight: { alignItems: 'flex-end' },
  catalogLabel: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: RED,
    letterSpacing: 2,
  },
  catalogSubLabel: {
    fontSize: 8.5,
    color: MUTED,
    marginTop: 5,
  },

  // ── Intro banner ──────────────────────────────────────────────────────────
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: RED50,
    border: `1px solid ${RED}`,
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  introText: {
    fontSize: 9,
    color: RED,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.3,
  },
  introMeta: { fontSize: 8, color: MUTED },

  // ── Table ─────────────────────────────────────────────────────────────────
  table: { marginTop: 2 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: DARK,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${RULE}`,
  },
  tableRowAlt: { backgroundColor: BG },
  tableCell: { fontSize: 9.5, color: INK },
  tableCellBold: { fontFamily: 'Helvetica-Bold', color: DARK },
  tableCellSku: { fontSize: 7.5, color: MUTED, marginTop: 2 },
  tableCellRed: { fontFamily: 'Helvetica-Bold', color: RED },
  tableCellGreen: { fontFamily: 'Helvetica-Bold', color: GREEN },

  // Column widths
  colNo: { width: 22, textAlign: 'center' },
  colProduct: { flex: 4 },
  colPrice: { flex: 2, textAlign: 'right' },
  colWholesale: { flex: 2, textAlign: 'right' },
  colSavings: { flex: 1.5, textAlign: 'center' },

  // ── Summary box ───────────────────────────────────────────────────────────
  summaryBox: {
    marginTop: 18,
    backgroundColor: BG,
    border: `1px solid ${RULE}`,
    borderRadius: 5,
    padding: 12,
    flexDirection: 'row',
    gap: 20,
  },
  summaryItem: { flex: 1 },
  summaryLabel: {
    fontSize: 7.5,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  summaryValueRed: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: RED,
  },

  // ── Terms box ─────────────────────────────────────────────────────────────
  termsBox: {
    marginTop: 14,
    backgroundColor: RED50,
    border: `1px solid ${RULE}`,
    borderLeft: `3px solid ${RED}`,
    borderRadius: 4,
    padding: 10,
  },
  termsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: RED,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  termsLine: { fontSize: 8.5, color: INK, lineHeight: 1.6, marginBottom: 1.5 },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 52,
    right: 52,
    borderTop: `1px solid ${RULE}`,
    paddingTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerLogoSmall: { height: 13, objectFit: 'contain' },
  footerText: { fontSize: 8, color: MUTED },
  pageNumber: { fontSize: 8, color: MUTED },
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmt(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function savingsPct(retail: number, wholesale: number): string {
  const pct = Math.round(((retail - wholesale) / retail) * 100);
  return `${pct}%`;
}

// ─── Catalog Document ──────────────────────────────────────────────────────

interface CatalogDocumentProps {
  products: any[];
  settings: any;
}

function CatalogDocument({ products, settings }: CatalogDocumentProps) {
  const companyName = settings?.company_name || 'Devireen Enterprise';
  const companyAddress = settings?.physical_address || 'Nairobi, Kenya';
  const companyEmail = settings?.email || 'devireenenterprise@gmail.com';
  const companyPhone = Array.isArray(settings?.phone_numbers)
    ? settings.phone_numbers[0]
    : settings?.phone_numbers || '+254 708 037929';
  const logoUrl = settings?.logo_url || null;

  const catalogDate = new Date().toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
  });

  return React.createElement(
    Document,
    {
      title: `${companyName} — Wholesale Product Catalog`,
      author: companyName,
    },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      // ── Header ──
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          { style: styles.headerLeft },
          // Custom Styled Logo matching Navbar
          React.createElement(
            View,
            {
              style: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              },
            },
            React.createElement(Image, {
              src: logoBase64 || 'public/images/devireen-logo.png',
              style: { width: 36, height: 36, objectFit: 'contain' },
            }),
            React.createElement(View, {
              style: {
                width: 1.5,
                height: 32,
                backgroundColor: '#9CA3AF',
                marginHorizontal: 8,
              },
            }),
            React.createElement(
              View,
              { style: { flexDirection: 'column', justifyContent: 'center' } },
              React.createElement(
                Text,
                {
                  style: {
                    fontSize: 20,
                    color: '#D31B27',
                    fontFamily: 'Helvetica-Bold',
                  },
                },
                'DEVIREEN'
              ),
              React.createElement(
                View,
                {
                  style: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 3,
                  },
                },
                React.createElement(View, {
                  style: { height: 1.5, width: 10, backgroundColor: '#232B2F' },
                }),
                React.createElement(
                  Text,
                  {
                    style: {
                      fontSize: 7.5,
                      color: '#232B2F',
                      fontFamily: 'Helvetica-Bold',
                      marginHorizontal: 4,
                    },
                  },
                  'ENTERPRISE'
                ),
                React.createElement(View, {
                  style: { height: 1.5, width: 10, backgroundColor: '#232B2F' },
                })
              )
            )
          ),
          React.createElement(
            Text,
            { style: styles.companyMeta },
            [
              companyAddress,
              `Phone: ${companyPhone}`,
              companyEmail ? `Email: ${companyEmail}` : null,
            ]
              .filter(Boolean)
              .join('\n')
          )
        ),
        React.createElement(
          View,
          { style: styles.headerRight },
          React.createElement(Text, { style: styles.catalogLabel }, 'CATALOG'),
          React.createElement(
            Text,
            { style: styles.catalogSubLabel },
            `Wholesale Price List — ${catalogDate}`
          )
        )
      ),

      // ── Intro banner ──
      React.createElement(
        View,
        { style: styles.introRow },
        React.createElement(
          Text,
          { style: styles.introText },
          `B2B Wholesale Catalog — ${products.length} Products`
        ),
        React.createElement(
          Text,
          { style: styles.introMeta },
          'Min. order: 1 Dozen (12 pcs) per item  •  Prices inclusive of 16% VAT'
        )
      ),

      // ── Table ──
      React.createElement(
        View,
        { style: styles.table },

        // Header row
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(
            Text,
            { style: [styles.tableHeaderCell, styles.colNo] },
            '#'
          ),
          React.createElement(
            Text,
            { style: [styles.tableHeaderCell, styles.colProduct] },
            'Product'
          ),
          React.createElement(
            Text,
            { style: [styles.tableHeaderCell, styles.colPrice] },
            'Retail'
          ),
          React.createElement(
            Text,
            { style: [styles.tableHeaderCell, styles.colWholesale] },
            'Wholesale Price'
          ),
          React.createElement(
            Text,
            { style: [styles.tableHeaderCell, styles.colSavings] },
            'Save'
          )
        ),

        // Data rows
        ...products.map((product: any, idx: number) =>
          React.createElement(
            View,
            {
              key: product.id || String(idx),
              style: [styles.tableRow, idx % 2 !== 0 ? styles.tableRowAlt : {}],
              wrap: false,
            },
            React.createElement(
              Text,
              { style: [styles.tableCell, styles.colNo, { color: MUTED }] },
              String(idx + 1)
            ),
            React.createElement(
              View,
              { style: styles.colProduct },
              React.createElement(
                Text,
                { style: [styles.tableCell, styles.tableCellBold] },
                product.name || 'Product'
              ),
              React.createElement(
                Text,
                { style: styles.tableCellSku },
                `SKU: ${product.sku || 'N/A'}`
              )
            ),
            React.createElement(
              Text,
              { style: [styles.tableCell, styles.colPrice, { color: MUTED }] },
              product.price ? fmt(product.price) : '—'
            ),
            React.createElement(
              Text,
              {
                style: [
                  styles.tableCell,
                  styles.colWholesale,
                  styles.tableCellRed,
                ],
              },
              fmt(product.wholesale_price)
            ),
            React.createElement(
              Text,
              {
                style: [
                  styles.tableCell,
                  styles.colSavings,
                  styles.tableCellGreen,
                ],
              },
              product.price
                ? savingsPct(product.price, product.wholesale_price)
                : '—'
            )
          )
        )
      ),

      // ── Summary ──
      React.createElement(
        View,
        { style: styles.summaryBox },
        React.createElement(
          View,
          { style: styles.summaryItem },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            'Total Products'
          ),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            String(products.length)
          )
        ),
        React.createElement(
          View,
          { style: styles.summaryItem },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            'Min. Order'
          ),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            '1 Dozen (12 pcs)'
          )
        ),
        React.createElement(
          View,
          { style: styles.summaryItem },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            'Avg. Wholesale Savings'
          ),
          React.createElement(
            Text,
            { style: styles.summaryValueRed },
            'Up to 40%'
          )
        ),
        React.createElement(
          View,
          { style: styles.summaryItem },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            'Enquiries'
          ),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            companyPhone
          )
        )
      ),

      // ── Terms ──
      React.createElement(
        View,
        { style: styles.termsBox },
        React.createElement(
          Text,
          { style: styles.termsTitle },
          'Terms & Ordering'
        ),
        React.createElement(
          Text,
          { style: styles.termsLine },
          '• Wholesale prices apply to orders of 12 or more units per item (1 dozen minimum).'
        ),
        React.createElement(
          Text,
          { style: styles.termsLine },
          '• Payment via M-Pesa to +254 708 037929. Use your invoice number as the reference.'
        ),
        React.createElement(
          Text,
          { style: styles.termsLine },
          '• Delivery is completed the same day within Nairobi and surrounding counties, and the next day for other regions. Custom procurement available on request.'
        ),
        React.createElement(
          Text,
          { style: styles.termsLine },
          `• Enquiries: ${companyEmail}  |  ${companyPhone}`
        )
      ),

      // ── Footer (fixed, repeats on every page) ──
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(
          View,
          { style: styles.footerLeft },
          logoUrl
            ? React.createElement(Image, {
                src: logoUrl,
                style: styles.footerLogoSmall,
              })
            : null,
          React.createElement(
            Text,
            { style: styles.footerText },
            `${companyName} — Wholesale Price Catalog`
          )
        ),
        React.createElement(Text, {
          style: styles.pageNumber,
          render: ({
            pageNumber,
            totalPages,
          }: {
            pageNumber: number;
            totalPages: number;
          }) => `Page ${pageNumber} of ${totalPages}`,
        })
      )
    )
  );
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Generates a wholesale product catalog PDF.
 *
 * @param products - Array of products (must have wholesale_price)
 * @param settings - Company settings for branding
 * @returns Uint8Array containing the PDF binary
 */
export async function generateCatalogPDF(
  products: any[],
  settings: any
): Promise<Uint8Array> {
  const doc = React.createElement(CatalogDocument, { products, settings });
  const buffer = await renderToBuffer(doc as any);
  return new Uint8Array(buffer);
}
