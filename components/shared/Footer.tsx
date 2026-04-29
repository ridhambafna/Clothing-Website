"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import { brandConfig } from "@/brand.config";

// Inline brand SVGs (lucide v1.11 lacks brand icons)
const IconWrap = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>{children}</svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <IconWrap className={className}><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2 0 1.8.2 2.3.4.6.2 1 .5 1.4 1 .5.4.8.8 1 1.4.2.5.4 1.1.4 2.3.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c0 1.2-.2 1.8-.4 2.3-.2.6-.5 1-1 1.4-.4.5-.8.8-1.4 1-.5.2-1.1.4-2.3.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2 0-1.8-.2-2.3-.4-.6-.2-1-.5-1.4-1-.5-.4-.8-.8-1-1.4-.2-.5-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c0-1.2.2-1.8.4-2.3.2-.6.5-1 1-1.4.4-.5.8-.8 1.4-1 .5-.2 1.1-.4 2.3-.4 1.2-.1 1.6-.1 4.8-.1zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1 0-1.7.2-2.1.3-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.1.4-.3 1-.3 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c0 1.1.2 1.7.3 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.1 1 .3 2.1.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1 0 1.7-.2 2.1-.3.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.1-.4.3-1 .3-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c0-1.1-.2-1.7-.3-2.1-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.1-1-.3-2.1-.3-1.2-.1-1.6-.1-4.7-.1zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.2-2.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></IconWrap>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <IconWrap className={className}><path d="M22 12a10 10 0 1 0-11.6 9.9V14.9H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></IconWrap>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <IconWrap className={className}><path d="M23.5 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.7 3.6 12 3.6 12 3.6s-4.7 0-8.2.3c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S0 9.2 0 11.1v1.7c0 1.9.2 3.9.2 3.9s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 8.3.3 8.3.3s4.7 0 8.2-.3c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.9v-1.7c0-1.9-.2-3.9-.2-3.9zM9.6 15.1V8.4l6.2 3.4-6.2 3.3z"/></IconWrap>
);
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <IconWrap className={className}><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5-1.3c1.4.8 3.1 1.3 4.9 1.3h.1c5.5 0 10-4.5 10-10S17.5 2 12 2zm5.9 14.2c-.3.7-1.4 1.4-2 1.5-.5.1-1.2.2-2-.1-.4-.2-1-.4-1.7-.7-3-1.3-4.9-4.4-5.1-4.6-.2-.2-1.2-1.6-1.2-3 0-1.5.8-2.2 1-2.5.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.5.3.6.9 2.2 1 2.4.1.2.1.3 0 .5-.1.2-.1.3-.3.5-.1.2-.2.3-.3.5-.1.2-.2.3 0 .5.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1.2-.2.7-.9.9-1.1.2-.3.4-.2.7-.1.3.1 1.7.8 2 .9.3.2.5.2.6.4.1.1.1.7-.2 1.3z"/></IconWrap>
);
const PinterestIcon = ({ className }: { className?: string }) => (
  <IconWrap className={className}><path d="M12 0C5.4 0 0 5.4 0 12c0 5 3.1 9.3 7.5 11-.1-.9-.2-2.4 0-3.4l1.4-5.9s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1 4.2-.3 1.2.6 2.3 1.9 2.3 2.2 0 3.9-2.4 3.9-5.7 0-3-2.1-5.1-5.2-5.1-3.5 0-5.6 2.6-5.6 5.4 0 1.1.4 2.2 1 2.8.1.1.1.2.1.3-.1.4-.3 1.2-.4 1.4-.1.2-.2.3-.5.2-1.6-.7-2.5-3-2.5-4.9 0-4 2.9-7.6 8.3-7.6 4.4 0 7.8 3.1 7.8 7.3 0 4.3-2.7 7.8-6.5 7.8-1.3 0-2.5-.7-2.9-1.5l-.8 3c-.3 1.1-1 2.4-1.5 3.3 1.1.3 2.3.5 3.5.5 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></IconWrap>
);

const SOCIALS = [
  { key: "instagram", icon: InstagramIcon, label: "Instagram" },
  { key: "facebook", icon: FacebookIcon, label: "Facebook" },
  { key: "whatsapp", icon: WhatsAppIcon, label: "WhatsApp" },
  { key: "youtube", icon: YoutubeIcon, label: "YouTube" },
  { key: "pinterest", icon: PinterestIcon, label: "Pinterest" },
] as const;

const CUSTOMER_CARE = [
  { flag: "fl_contact", label: "Contact Us", href: "/p/contact-us" },
  { flag: "fl_faq", label: "FAQ", href: "/p/faq" },
  { flag: "fl_shipping", label: "Shipping & Returns", href: "/p/shipping-returns" },
  { flag: "fl_sizeGuide", label: "Size Guide", href: "/p/size-guide" },
  { flag: "fl_orderStatus", label: "Order Status", href: "/account" },
] as const;

const OUR_COMPANY = [
  { flag: "fl_about", label: "About Us", href: "/p/about-us" },
  { flag: "fl_sustainability", label: "Sustainability", href: "/p/sustainability" },
  { flag: "fl_careers", label: "Careers", href: "/p/careers" },
  { flag: "fl_press", label: "Press", href: "/p/press" },
] as const;

const LEGAL = [
  { flag: "fl_privacy", label: "Privacy Policy", href: "/p/privacy-policy" },
  { flag: "fl_terms", label: "Terms of Service", href: "/p/terms-of-service" },
  { flag: "fl_cookies", label: "Cookie Policy", href: "/p/cookie-policy" },
  { flag: "fl_accessibility", label: "Accessibility", href: "/p/accessibility" },
] as const;

export default function Footer() {
  const { flags } = useApp();
  const [settings, setSettings] = useState<any>({});
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" }).then((r) => r.ok ? r.json() : {}).then(setSettings).catch(() => {});
    fetch("/api/footer-pages", { cache: "no-store" }).then((r) => r.ok ? r.json() : []).then((data: any[]) => {
      setPages(Array.isArray(data) ? data.filter((p) => p.showInFooter !== false) : []);
    }).catch(() => {});
  }, []);

  function socialUrl(key: string): string {
    const s = settings || {};
    if (key === "instagram") return s.instagram || brandConfig.social.instagram || "#";
    if (key === "facebook") return s.facebook || "#";
    if (key === "youtube") return s.youtube || "#";
    if (key === "pinterest") return s.pinterest || "#";
    if (key === "whatsapp") {
      const num = (s.whatsapp || brandConfig.whatsapp || "").toString().replace(/[^\d]/g, "");
      return num ? `https://wa.me/${num}` : "#";
    }
    return "#";
  }

  const visibleColumns = [
    flags.footerCustomerCare,
    flags.footerOurCompany,
    flags.footerLegal,
    flags.footerSocial,
  ].filter(Boolean).length;

  return (
    <footer className="mt-24 bg-[#0F0F0F] text-white pt-16 pb-10">
      <div className="mx-auto max-w-7xl px-8">
        {visibleColumns > 0 && (
          <div className={`grid grid-cols-2 gap-12 md:grid-cols-${Math.max(visibleColumns, 1)} mb-16`}>
            {flags.footerCustomerCare && (
              <Column title="Customer Care">
                {CUSTOMER_CARE.filter((l) => flags[l.flag as keyof typeof flags]).map((l) => (
                  <FootLink key={l.flag} href={l.href}>{l.label}</FootLink>
                ))}
              </Column>
            )}
            {flags.footerOurCompany && (
              <Column title="Our Company">
                {OUR_COMPANY.filter((l) => flags[l.flag as keyof typeof flags]).map((l) => (
                  <FootLink key={l.flag} href={l.href}>{l.label}</FootLink>
                ))}
              </Column>
            )}
            {flags.footerLegal && (
              <Column title="Legal">
                {LEGAL.filter((l) => flags[l.flag as keyof typeof flags]).map((l) => {
                  // Prefer the editable footer page if one matches
                  const editable = pages.find((p) => p.slug === l.flag.replace(/^fl_/, "").replace(/([A-Z])/g, "-$1").toLowerCase()
                    || p.slug === l.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  return <FootLink key={l.flag} href={editable ? `/p/${editable.slug}` : l.href}>{l.label}</FootLink>;
                })}
                {pages
                  .filter((p) => !["about-us", "about", "heritage", "sustainability", "careers", "press", "contact-us", "contact", "faq", "shipping-returns", "shipping", "size-guide", "order-status"].includes(p.slug))
                  .filter((p) => ["privacy", "privacy-policy", "terms", "terms-of-service", "cookies", "cookie-policy", "accessibility"].some(s => p.slug.includes(s)))
                  .map((p) => <FootLink key={p._id} href={`/p/${p.slug}`}>{p.title}</FootLink>)}
              </Column>
            )}
            {flags.footerSocial && (
              <Column title="Follow">
                <div className="flex flex-wrap gap-4 mt-1">
                  {SOCIALS.map((s) => {
                    const Icon = s.icon as any;
                    return (
                      <a key={s.key} href={socialUrl(s.key)} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                        className="w-10 h-10 flex items-center justify-center border border-white/20 text-white/70 hover:bg-[#C5A572] hover:text-white hover:border-[#C5A572] transition">
                        <Icon className="w-5 h-5 stroke-[1.5]" />
                      </a>
                    );
                  })}
                </div>
                {(settings?.email || brandConfig.email) && (
                  <a href={`mailto:${settings?.email || brandConfig.email}`} className="block mt-5 text-sm text-white/70 hover:text-[#C5A572] transition">
                    {settings?.email || brandConfig.email}
                  </a>
                )}
                <p className="text-sm text-white/60 mt-1">{settings?.address || brandConfig.address}</p>
              </Column>
            )}
          </div>
        )}

        <div className="border-t border-white/15 pt-8 flex flex-col items-center gap-2 md:flex-row md:justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            © {new Date().getFullYear()} {settings?.name || brandConfig.name}. All rights reserved.
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C5A572]">
            {settings?.tagline || brandConfig.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-6 text-xs uppercase tracking-[0.25em] text-[#C5A572]">{title}</h4>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-white/70 hover:text-[#C5A572] transition">{children}</Link>
    </li>
  );
}
