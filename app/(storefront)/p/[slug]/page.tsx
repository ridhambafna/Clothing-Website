"use client";

import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Props { params: Promise<{ slug: string }>; }

const KNOWN_TITLES: Record<string, string> = {
  "about-us": "About Us",
  "contact-us": "Contact Us",
  "faq": "Frequently Asked Questions",
  "shipping-returns": "Shipping & Returns",
  "size-guide": "Size Guide",
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
  "cookie-policy": "Cookie Policy",
  "accessibility": "Accessibility",
  "sustainability": "Sustainability",
  "careers": "Careers",
  "press": "Press",
};

const PLACEHOLDER_HTML: Record<string, string> = {
  "about-us": `
    <p>Millazo is a premium fabrics house specialising in shirting, kurta, and natural-fibre weaves. Italian-inspired craftsmanship, hand-finished in our workshops, and made for the modern wardrobe.</p>
    <p>For collaborations and wholesale enquiries, write to us at <a href="mailto:hello@millazo.com">hello@millazo.com</a>.</p>
  `,
  "contact-us": `
    <p>We'd love to hear from you.</p>
    <ul>
      <li><strong>Email:</strong> <a href="mailto:hello@millazo.com">hello@millazo.com</a></li>
      <li><strong>WhatsApp:</strong> +91-9876543210</li>
      <li><strong>Address:</strong> Mumbai, India</li>
    </ul>
  `,
  "faq": `
    <h2>What fabrics do you offer?</h2>
    <p>Premium shirting cotton, kurta cloth, linen blends, and silk weaves — all from trusted Italian and Indian mills.</p>
    <h2>Do you offer custom tailoring?</h2>
    <p>Yes — select &quot;Custom Fit&quot; on any product page and our team will reach out to take your measurements.</p>
    <h2>What is the return policy?</h2>
    <p>30 days for unstitched fabric in original packaging.</p>
  `,
  "shipping-returns": `
    <p>Complimentary delivery across India in 2–4 business days. International shipping available on request.</p>
    <p>Returns accepted within 30 days for unworn pieces in original packaging.</p>
  `,
  "size-guide": `
    <p>Our garment sizes follow standard Indian fits. For bespoke measurements, choose <strong>Custom Fit</strong> on any product page.</p>
  `,
  "privacy-policy": `
    <p>We respect your privacy. We collect only the information necessary to fulfil your orders and improve your experience.</p>
    <p>For any privacy enquiries, contact <a href="mailto:hello@millazo.com">hello@millazo.com</a>.</p>
  `,
  "terms-of-service": `
    <p>By using millazo.com you agree to these terms.</p>
    <p>All content, designs, and imagery are the property of Millazo. Unauthorised use is prohibited.</p>
  `,
  "cookie-policy": `
    <p>We use essential cookies to keep your session active. We do not use tracking or advertising cookies.</p>
  `,
  "accessibility": `
    <p>We are committed to making millazo.com accessible to all visitors. If you encounter any accessibility issue, please reach out at <a href="mailto:hello@millazo.com">hello@millazo.com</a>.</p>
  `,
  "sustainability": `
    <p>Our fabrics are sourced from mills with verified labour standards and water-recycling practices.</p>
  `,
  "careers": `
    <p>We're a small, design-led team. Drop your CV at <a href="mailto:careers@millazo.com">careers@millazo.com</a>.</p>
  `,
  "press": `
    <p>For press enquiries, please contact <a href="mailto:press@millazo.com">press@millazo.com</a>.</p>
  `,
};

export default function FooterPagePublic({ params }: Props) {
  const { slug } = use(params);
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/footer-pages", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => {
        const found = data.find((p) => p.slug === slug);
        setPage(found || null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="py-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  // If the admin has authored this page, use that. Otherwise fall back to a built-in placeholder
  // so the route never 404s for any known footer slug.
  const title = page?.title || KNOWN_TITLES[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const content = page?.content || PLACEHOLDER_HTML[slug] || `<p>This page is being prepared. Please check back soon.</p>`;

  return (
    <article className="max-w-3xl mx-auto px-8 py-20">
      <h1 className="font-heading text-4xl uppercase tracking-[0.15em] text-[#222] mb-3">{title}</h1>
      <div className="h-px w-16 bg-[#C5A572] mb-10" />
      <div className="prose prose-neutral max-w-none text-[#222] leading-loose"
        dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
