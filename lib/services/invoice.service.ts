import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer';
import React from 'react';

// ─── Brand tokens ──────────────────────────────────────────────────────────
const RED = '#DC2626'; // Devireen primary red
const RED50 = '#FEF2F2'; // light red tint
const DARK = '#111827'; // near-black for headings
const INK = '#374151'; // body text
const MUTED = '#6B7280'; // secondary/muted text
const RULE = '#E5E7EB'; // divider lines
const BG = '#F9FAFB'; // card backgrounds

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
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: `2px solid ${RED}`,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'column',
  },
  logo: {
    height: 36,
    objectFit: 'contain',
    objectPositionX: 0,
    marginBottom: 6,
  },
  companyName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 3,
  },
  companyMeta: {
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.55,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceLabel: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    color: RED,
    letterSpacing: 3,
  },
  invoiceNumber: {
    fontSize: 9.5,
    color: MUTED,
    marginTop: 5,
  },
  invoiceDate: {
    fontSize: 9.5,
    color: MUTED,
    marginTop: 2,
  },

  // ── Fulfillment badge ─────────────────────────────────────────────────────
  fulfillmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED50,
    border: `1px solid ${RED}`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  fulfillmentBadgeText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: RED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Info grid ─────────────────────────────────────────────────────────────
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 22,
  },
  infoCard: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 5,
    padding: 12,
    border: `1px solid ${RULE}`,
  },
  infoCardTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 7,
    borderBottom: `1px solid ${RULE}`,
    paddingBottom: 5,
  },
  infoLine: {
    fontSize: 9.5,
    color: DARK,
    marginBottom: 2.5,
    lineHeight: 1.5,
  },
  infoLineMuted: {
    fontSize: 8.5,
    color: MUTED,
    marginBottom: 2,
    lineHeight: 1.4,
  },

  // ── Items table ───────────────────────────────────────────────────────────
  table: {
    marginTop: 4,
    marginBottom: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: DARK,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${RULE}`,
  },
  tableRowAlt: {
    backgroundColor: BG,
  },
  tableCell: {
    fontSize: 9.5,
    color: INK,
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  tableCellSku: {
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
  },

  // ── Column widths ─────────────────────────────────────────────────────────
  colProduct: { flex: 4 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },

  // ── Totals ────────────────────────────────────────────────────────────────
  totalsSection: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  totalsBox: {
    width: 260,
    marginTop: 8,
    border: `1px solid ${RULE}`,
    borderRadius: 5,
    overflow: 'hidden',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderBottom: `1px solid ${RULE}`,
  },
  totalLabel: {
    fontSize: 9.5,
    color: MUTED,
  },
  totalValue: {
    fontSize: 9.5,
    color: DARK,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: RED,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  wholesaleRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderBottom: `1px solid ${RULE}`,
    backgroundColor: RED50,
  },
  wholesaleLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: RED,
  },

  // ── Payment box ───────────────────────────────────────────────────────────
  paymentBox: {
    marginTop: 24,
    backgroundColor: BG,
    borderRadius: 5,
    padding: 14,
    borderLeft: `3px solid ${RED}`,
    border: `1px solid ${RULE}`,
  },
  paymentTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: RED,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentLine: {
    fontSize: 9,
    color: INK,
    marginBottom: 3,
    lineHeight: 1.5,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 52,
    right: 52,
    borderTop: `1px solid ${RULE}`,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLogoSmall: {
    height: 14,
    objectFit: 'contain',
  },
  footerText: {
    fontSize: 8,
    color: MUTED,
  },
  footerBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmt(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Invoice Document ──────────────────────────────────────────────────────

interface InvoiceDocumentProps {
  order: any;
  settings: any;
}

function InvoiceDocument({ order, settings }: InvoiceDocumentProps) {
  const enableVat = settings?.enable_vat !== false;
  const subtotal = enableVat ? order.total_amount / 1.16 : order.total_amount;
  const vatAmount = enableVat ? order.total_amount - subtotal : 0;
  const isDelivery = order.fulfillment_type === 'DELIVERY';
  const isWholesale = order.pricing_model === 'WHOLESALE';

  const companyName = settings?.company_name || 'Devireen Enterprise';
  const companyAddress = settings?.physical_address || 'Nairobi, Kenya';
  const companyEmail = settings?.email || '';
  const companyPhone = Array.isArray(settings?.phone_numbers)
    ? settings.phone_numbers[0]
    : settings?.phone_numbers || '';
  const vatRate = settings?.vat_rate || '16%';
  const kraPin = settings?.kra_pin || '';
  const logoUrl = settings?.logo_url || null;

  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return React.createElement(
    Document,
    { title: `Invoice ${order.invoice_number}`, author: companyName },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      // ── Header ──────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.header },

        // Left: logo + company info
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
              src: 'public/images/devireen-logo.png',
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
          // Company meta — always shown
          React.createElement(
            Text,
            { style: styles.companyMeta },
            [
              companyAddress,
              companyPhone ? `Phone: ${companyPhone}` : null,
              companyEmail ? `Email: ${companyEmail}` : null,
              kraPin ? `KRA PIN: ${kraPin}` : null,
            ]
              .filter(Boolean)
              .join('\n')
          )
        ),

        // Right: INVOICE label + number + date
        React.createElement(
          View,
          { style: styles.headerRight },
          React.createElement(Text, { style: styles.invoiceLabel }, 'INVOICE'),
          React.createElement(
            Text,
            { style: styles.invoiceNumber },
            order.invoice_number || 'INV-DRAFT'
          ),
          React.createElement(Text, { style: styles.invoiceDate }, invoiceDate)
        )
      ),

      // ── Fulfillment badge ────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.fulfillmentBadge },
        React.createElement(
          Text,
          { style: styles.fulfillmentBadgeText },
          isDelivery ? 'Delivery Order' : 'Pickup Order'
        )
      ),

      // ── Info grid ────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.infoGrid },

        // Bill To
        React.createElement(
          View,
          { style: styles.infoCard },
          React.createElement(Text, { style: styles.infoCardTitle }, 'Bill To'),
          React.createElement(
            Text,
            { style: [styles.infoLine, styles.tableCellBold] },
            order.customer_name || ''
          ),
          order.customer_email
            ? React.createElement(
                Text,
                { style: styles.infoLine },
                order.customer_email
              )
            : null,
          order.customer_phone
            ? React.createElement(
                Text,
                { style: styles.infoLine },
                order.customer_phone
              )
            : null
        ),

        // Fulfillment Details
        React.createElement(
          View,
          { style: styles.infoCard },
          React.createElement(
            Text,
            { style: styles.infoCardTitle },
            isDelivery ? 'Delivery Details' : 'Pickup Details'
          ),
          isDelivery
            ? React.createElement(
                React.Fragment,
                null,
                order.delivery_address
                  ? React.createElement(
                      Text,
                      { style: styles.infoLine },
                      order.delivery_address
                    )
                  : null,
                order.county
                  ? React.createElement(
                      Text,
                      { style: styles.infoLineMuted },
                      `County: ${order.county}`
                    )
                  : null,
                order.courier_service
                  ? React.createElement(
                      Text,
                      { style: styles.infoLineMuted },
                      `Courier: ${order.courier_service}`
                    )
                  : null,
                order.delivery_notes
                  ? React.createElement(
                      Text,
                      { style: styles.infoLineMuted },
                      `Notes: ${order.delivery_notes}`
                    )
                  : null
              )
            : React.createElement(
                Text,
                { style: styles.infoLine },
                'Customer will collect from our premises.'
              )
        )
      ),

      // ── Items table ──────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.table },

        // Table header row
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(
            Text,
            { style: [styles.tableHeaderCell, styles.colProduct] },
            'Product'
          ),
          React.createElement(
            Text,
            { style: [styles.tableHeaderCell, styles.colQty] },
            'Qty'
          ),
          React.createElement(
            Text,
            { style: [styles.tableHeaderCell, styles.colPrice] },
            'Unit Price'
          ),
          React.createElement(
            Text,
            { style: [styles.tableHeaderCell, styles.colTotal] },
            'Total'
          )
        ),

        // Data rows
        ...(order.items || []).map((item: any, idx: number) =>
          React.createElement(
            View,
            {
              key: String(idx),
              style: [styles.tableRow, idx % 2 !== 0 ? styles.tableRowAlt : {}],
            },
            // Product name + SKU
            React.createElement(
              View,
              { style: styles.colProduct },
              React.createElement(
                Text,
                { style: [styles.tableCell, styles.tableCellBold] },
                item.products?.name || 'Product'
              ),
              React.createElement(
                Text,
                { style: styles.tableCellSku },
                `SKU: ${item.products?.sku || 'N/A'}`
              )
            ),
            React.createElement(
              Text,
              { style: [styles.tableCell, styles.colQty] },
              String(item.quantity)
            ),
            React.createElement(
              Text,
              { style: [styles.tableCell, styles.colPrice] },
              fmt(item.unit_price)
            ),
            React.createElement(
              Text,
              {
                style: [
                  styles.tableCell,
                  styles.colTotal,
                  styles.tableCellBold,
                ],
              },
              fmt(item.quantity * item.unit_price)
            )
          )
        )
      ),

      // ── Totals ───────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.totalsSection },
        React.createElement(
          View,
          { style: styles.totalsBox },
          React.createElement(
            View,
            { style: styles.totalRow },
            React.createElement(
              Text,
              { style: styles.totalLabel },
              'Subtotal (excl. VAT)'
            ),
            React.createElement(
              Text,
              { style: styles.totalValue },
              fmt(subtotal)
            )
          ),
          enableVat
            ? React.createElement(
                View,
                { style: styles.totalRow },
                React.createElement(
                  Text,
                  { style: styles.totalLabel },
                  `VAT (${vatRate})`
                ),
                React.createElement(
                  Text,
                  { style: styles.totalValue },
                  fmt(vatAmount)
                )
              )
            : null,
          isWholesale
            ? React.createElement(
                View,
                { style: styles.wholesaleRow },
                React.createElement(
                  Text,
                  { style: styles.wholesaleLabel },
                  'Wholesale pricing applied'
                )
              )
            : null,
          React.createElement(
            View,
            { style: styles.grandTotalRow },
            React.createElement(
              Text,
              { style: styles.grandTotalLabel },
              'GRAND TOTAL'
            ),
            React.createElement(
              Text,
              { style: styles.grandTotalValue },
              fmt(order.total_amount)
            )
          )
        )
      ),

      // ── Payment Instructions ─────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.paymentBox },
        React.createElement(
          Text,
          { style: styles.paymentTitle },
          'Payment Instructions'
        ),
        React.createElement(
          Text,
          { style: styles.paymentLine },
          'Please quote your invoice number when making payment.'
        ),
        kraPin
          ? React.createElement(
              Text,
              { style: styles.paymentLine },
              `M-Pesa Paybill: ${kraPin}  |  Account No.: ${order.invoice_number}`
            )
          : null,
        companyEmail || companyPhone
          ? React.createElement(
              Text,
              { style: styles.paymentLine },
              `Enquiries: ${companyEmail || companyPhone}`
            )
          : null
      ),

      // ── Footer ───────────────────────────────────────────────────────────
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
            `${companyName} — Thank you for your business!`
          )
        ),
        React.createElement(
          Text,
          { style: styles.footerBold },
          order.invoice_number || ''
        )
      )
    )
  );
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Generates a professional PDF invoice as Uint8Array.
 *
 * @param order    - Full order object with items and customer info
 * @param settings - Company settings for branding/contact info
 * @returns A Uint8Array containing the PDF binary data
 */
export async function generateInvoicePDF(
  order: any,
  settings: any
): Promise<Uint8Array> {
  const doc = React.createElement(InvoiceDocument, { order, settings });
  const buffer = await renderToBuffer(doc as any);
  return new Uint8Array(buffer);
}
