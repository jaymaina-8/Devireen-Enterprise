import { SectionHeading } from '@/components/layout/SectionHeading';

export const metadata = {
  title: 'Privacy Policy | Devireen Enterprise',
  description:
    'Read the Privacy Policy for Devireen Enterprise. Learn how we collect, use, and protect your personal and business data.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl flex-1 px-4 py-8 md:py-16">
      <SectionHeading
        title="Privacy Policy"
        subtitle="How Devireen Enterprise collects, uses, and protects your information."
      />
      <div className="prose prose-sm md:prose-base text-text-body mt-8 max-w-none space-y-6">
        <p className="text-text-muted italic">Last updated: August 11, 2026</p>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">1. Introduction</h3>
          <p>
            Devireen Enterprise (&quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;) is committed to protecting the privacy and security
            of your personal and business data. This Privacy Policy explains how
            we collect, use, disclose, and safeguard your information when you
            visit our website at{' '}
            <a
              href="https://www.devireenenterprise.com"
              className="text-primary-600 underline"
            >
              devireenenterprise.com
            </a>
            , request product quotations, or purchase stationery, office
            supplies, and school materials from us in Nairobi, Kenya.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            2. Information We Collect
          </h3>
          <p>
            We collect information that you voluntarily provide to us when using
            our services:
          </p>
          <ul className="text-text-muted list-disc space-y-1 pl-6">
            <li>
              <strong>Contact Details:</strong> Full name, phone number, email
              address, physical delivery address, and organization name.
            </li>
            <li>
              <strong>Quotation &amp; Order Data:</strong> Items requested,
              quantities, procurement preferences, Local Purchase Order (LPO)
              documents, and specialized business requests.
            </li>
            <li>
              <strong>Account &amp; Communication Records:</strong> Messages
              submitted via our contact forms, sales desk inquiries, and support
              correspondence.
            </li>
            <li>
              <strong>Technical Usage Data:</strong> IP address, browser type,
              device information, and site interaction metrics collected via
              standard web analytics.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            3. How We Use Your Information
          </h3>
          <p>
            We use the collected information for specific business and
            fulfillment purposes:
          </p>
          <ul className="text-text-muted list-disc space-y-1 pl-6">
            <li>
              Generating itemized volume quotations and official commercial
              invoices.
            </li>
            <li>
              Processing, packaging, and dispatching orders across Nairobi and
              all 47 counties in Kenya.
            </li>
            <li>
              Communicating regarding order status, quotation approvals, and
              delivery scheduling.
            </li>
            <li>
              Providing account management for corporate, school, hospital, and
              NGO clients.
            </li>
            <li>
              Ensuring website security, preventing fraud, and complying with
              statutory obligations in Kenya.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            4. Information Sharing &amp; Third Parties
          </h3>
          <p>
            We strictly do <strong>not sell, rent, or trade</strong> your
            personal or organizational data to third-party marketers. We only
            share information with necessary service partners under strict
            confidentiality:
          </p>
          <ul className="text-text-muted list-disc space-y-1 pl-6">
            <li>
              <strong>Fulfillment &amp; Courier Logistics:</strong> Trusted
              courier and freight companies in Kenya for delivery fulfillment.
            </li>
            <li>
              <strong>Financial &amp; Payment Processors:</strong> Accredited
              banking institutions and mobile payment services (e.g., M-PESA) to
              process transaction settlements.
            </li>
            <li>
              <strong>Legal Compliance:</strong> When required by Kenyan law or
              regulatory authorities to satisfy legal process or protect
              corporate rights.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            5. Data Protection &amp; Security
          </h3>
          <p>
            We implement technical safeguards, including encrypted SSL/HTTPS
            protocols, secure server infrastructure, and restricted database
            access control (Row Level Security), to protect your information
            against unauthorized access, loss, or alteration.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">
            6. Your Rights &amp; Data Control
          </h3>
          <p>
            You have the right to access, update, or request the deletion of
            your personal contact records stored with us. To exercise these
            rights or update your business communication preferences, please
            contact our privacy coordinator at{' '}
            <a
              href="mailto:support@devireen.co.ke"
              className="text-primary-600 underline"
            >
              support@devireen.co.ke
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-text-main text-xl font-bold">7. Contact Us</h3>
          <p>
            If you have questions or concerns about this Privacy Policy, please
            reach out to us at:
          </p>
          <div className="bg-surface border-border-subtle space-y-1 rounded-xl border p-4 text-sm">
            <p className="text-text-main font-bold">Devireen Enterprise</p>
            <p className="text-text-muted">Nairobi CBD, Kenya</p>
            <p className="text-text-muted">Phone: +254 708 037929</p>
            <p className="text-text-muted">Email: support@devireen.co.ke</p>
          </div>
        </section>
      </div>
    </div>
  );
}
