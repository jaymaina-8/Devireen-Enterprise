import { SectionHeading } from '@/components/layout/SectionHeading';

export const metadata = {
  title: 'Terms of Service | Devireen Enterprise',
  description:
    'Read the Terms of Service for Devireen Enterprise. Guidelines, ordering terms, quotation validity, delivery policies, and commercial conditions.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl flex-1 px-4 py-8 md:py-16">
      <SectionHeading
        title="Terms of Service"
        subtitle="Commercial guidelines and conditions for purchasing from Devireen Enterprise."
      />
      <div className="prose prose-sm md:prose-base text-text-body mt-8 max-w-none space-y-6">
        <p className="text-text-muted italic">Last updated: August 11, 2026</p>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            1. Acceptance of Terms
          </h3>
          <p>
            By accessing or placing an order through the Devireen Enterprise
            website (
            <a
              href="https://www.devireenenterprise.com"
              className="text-primary-600 underline"
            >
              devireenenterprise.com
            </a>
            ), requesting product quotations, or issuing purchase orders, you
            agree to be bound by these Terms of Service. If you are acting on
            behalf of a school, corporation, hospital, government agency, or
            NGO, you represent that you have full authority to bind that entity
            to these conditions.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            2. Products &amp; Catalog Accuracy
          </h3>
          <p>
            Devireen Enterprise supplies stationery, office consumables, school
            supplies, printer cartridges, furniture, and educational materials.
            While we strive to maintain complete accuracy regarding product
            descriptions, specifications, SKUs, and imagery, slight variations
            in manufacturer packaging or branding may occur.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            3. Quotations, Pricing &amp; Orders
          </h3>
          <ul className="text-text-muted list-disc space-y-1 pl-6">
            <li>
              <strong>Quotation Validity:</strong> Quotations generated through
              our system or sales desk are valid for 14 calendar days from the
              date of issue unless specified otherwise in writing.
            </li>
            <li>
              <strong>Pricing Estimates:</strong> Web catalog prices represent
              standard retail and volume estimates. Final confirmed pricing will
              be reflected on formal itemized quotations and pro-forma invoices.
            </li>
            <li>
              <strong>Value Added Tax (VAT):</strong> Statutory VAT details will
              be clearly itemized on official invoices in accordance with Kenyan
              tax regulations.
            </li>
            <li>
              <strong>Order Confirmation:</strong> Orders become binding upon
              written quotation approval, issuance of an official Local Purchase
              Order (LPO), or receipt of initial deposit/payment.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">4. Payment Terms</h3>
          <p>
            We support multiple payment methods including bank transfer
            (EFT/RTGS), corporate cheques, M-PESA, and store payment. For
            accredited institutional accounts, payment terms are governed by the
            approved credit agreement or LPO terms. For standard orders, payment
            is due prior to order dispatch or upon store pickup.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            5. Delivery &amp; Store Pickup Policies
          </h3>
          <ul className="text-text-muted list-disc space-y-1 pl-6">
            <li>
              <strong>Nairobi Deliveries:</strong> Delivered within 1 to 2
              business days following order confirmation.
            </li>
            <li>
              <strong>Nationwide County Shipping:</strong> Dispatched via
              accredited courier and freight partners across all 47 counties in
              Kenya within 2 to 4 business days.
            </li>
            <li>
              <strong>Storefront Pickup:</strong> Customers may collect
              confirmed orders at our Nairobi CBD storefront during business
              hours.
            </li>
            <li>
              <strong>Inspection Upon Receipt:</strong> Customers or designated
              receiving officers must inspect packages upon delivery and notify
              us of any damages or discrepancies within 48 hours.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            6. Returns, Exchanges &amp; Replacements
          </h3>
          <p>
            If a product arrives damaged, defective, or incorrect relative to
            the invoice, Devireen Enterprise will replace the item or issue
            store credit provided notification is made within 48 hours of
            receipt and items remain in their original packaging. Custom-printed
            or specially ordered non-catalog items are non-refundable unless
            defective.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            7. Limitation of Liability &amp; Governing Law
          </h3>
          <p>
            Devireen Enterprise shall not be liable for indirect, consequential,
            or delay-related losses resulting from third-party logistics
            disruptions. These terms are governed by and construed in accordance
            with the Laws of the Republic of Kenya.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            8. Contact Information
          </h3>
          <p>
            For questions regarding these Terms of Service or commercial
            procurement arrangements, please contact us at:
          </p>
          <div className="bg-surface border-border-subtle space-y-1 rounded-xl border p-4 text-sm">
            <p className="text-text-main font-bold">
              Devireen Enterprise — Procurement Desk
            </p>
            <p className="text-text-muted">Nairobi CBD, Kenya</p>
            <p className="text-text-muted">Phone: +254 708 037929</p>
            <p className="text-text-muted">
              Email: sales@devireen.co.ke / support@devireen.co.ke
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
