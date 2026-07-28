import Image from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ContactForm } from "./ContactForm";
import { MapPin, Phone, Mail, Clock, ShoppingCart, HeadphonesIcon, CreditCard, Building2 } from "lucide-react";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Devireen Enterprise for support or inquiries.",
};

const departments = [
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    name: "Sales",
    description: "Product inquiries, quotes, and new accounts",
    email: "sales@devireen.co.ke",
    phone: "+254 708 037929",
  },
  {
    icon: <HeadphonesIcon className="h-5 w-5" />,
    name: "Support",
    description: "Order tracking, returns, and issues",
    email: "support@devireen.co.ke",
    phone: "+254 708 037929",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    name: "Accounts",
    description: "Invoicing, payments, and statements",
    email: "accounts@devireen.co.ke",
    phone: "+254 708 037929",
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    name: "Procurement",
    description: "Bulk orders and corporate accounts",
    email: "procurement@devireen.co.ke",
    phone: "+254 708 037929",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden min-h-[300px] md:min-h-[360px] flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80"
          alt="Modern corporate office"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-dark-overlay-strong" />
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-20">
          <AnimatedSection animation="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white max-w-3xl leading-tight">
              Get in touch
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              We&apos;re here to help with your procurement needs. Reach out to the right department below.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Department Cards ─── */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {departments.map((dept, i) => (
              <AnimatedSection key={dept.name} animation="fade-up" delay={i * 80}>
                <div className="bg-surface border border-border-subtle rounded-xl p-5 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
                    {dept.icon}
                  </div>
                  <h3 className="font-bold text-text-main mb-1">{dept.name}</h3>
                  <p className="text-xs text-text-muted mb-4">{dept.description}</p>
                  <div className="space-y-2 text-xs text-text-muted">
                    <a href={`mailto:${dept.email}`} className="flex items-center gap-2 hover:text-primary-600 transition-colors cursor-pointer">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span>{dept.email}</span>
                    </a>
                    <a href={`tel:${dept.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-primary-600 transition-colors cursor-pointer">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{dept.phone}</span>
                    </a>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact Form + Info ─── */}
      <section className="py-12 md:py-20 bg-surface border-y border-border-subtle">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left — Info + Map */}
            <AnimatedSection animation="slide-right">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-6">
                  Visit our office
                </h2>
                <p className="text-text-muted mb-8 leading-relaxed">
                  Whether you need a custom quote, have a question about our products, or need support with an existing order, our team is ready to assist you.
                </p>

                {/* Contact Details */}
                <div className="space-y-5 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-2.5 rounded-lg text-primary-600 shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-main text-sm">Office Address</h4>
                      <p className="text-sm text-text-muted">Nairobi CBD, Kenya</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-2.5 rounded-lg text-primary-600 shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-main text-sm">Phone</h4>
                      <p className="text-sm text-text-muted">+254 708 037929</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-2.5 rounded-lg text-primary-600 shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-main text-sm">Email</h4>
                      <p className="text-sm text-text-muted">sales@devireen.co.ke</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-2.5 rounded-lg text-primary-600 shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-main text-sm">Business Hours</h4>
                      <div className="text-sm text-text-muted space-y-0.5">
                        <p>Mon – Fri: 8:00 AM – 6:00 PM</p>
                        <p>Saturday: 9:00 AM – 2:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <a
                  href="https://www.google.com/maps/place/Devireen+Enterprise./@-1.28181,36.825743,17z/data=!3m1!4b1!4m6!3m5!1s0x182f118fa27150b5:0xe0fb2ec5aa188109!8m2!3d-1.2818154!4d36.8283179!16s%2Fg%2F11nth4f4zs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-[16/9] rounded-xl overflow-hidden border border-border-subtle bg-background hover:opacity-90 transition-opacity"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=600&q=80"
                    alt="Nairobi office location map placeholder"
                    fill
                    className="object-cover opacity-60"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-surface/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium text-text-main shadow-md flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      Nairobi CBD, Kenya
                    </div>
                  </div>
                </a>
              </div>
            </AnimatedSection>

            {/* Right — Form */}
            <AnimatedSection animation="fade-up" delay={200}>
              <ContactForm />
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
