import {
  Clock,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { CONTACT } from "@/lib/contact";
import { cn } from "@/lib/utils";

const CHANNELS: {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
  // Tailwind classes for the round icon
  color: string;
  external?: boolean;
}[] = [
  {
    label: "Website",
    value: CONTACT.website.replace(/^https?:\/\//, ""),
    href: CONTACT.website,
    icon: Globe,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    external: true,
  },
  {
    label: "WhatsApp",
    value: `+${CONTACT.whatsapp.replace(/^(\d{2})(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5 $6")}`,
    href: `https://wa.me/${CONTACT.whatsapp}`,
    icon: MessageCircle,
    color: "bg-[#25D366]",
    external: true,
  },
  {
    label: "Instagram",
    value: `@${CONTACT.instagram}`,
    href: `https://instagram.com/${CONTACT.instagram}`,
    icon: Instagram,
    color: "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600",
    external: true,
  },
  {
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    icon: Mail,
    color: "bg-gradient-to-br from-sky-500 to-blue-700",
  },
  {
    label: "Phone",
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone.replace(/\s/g, "")}`,
    icon: Phone,
    color: "bg-gradient-to-br from-violet-500 to-purple-700",
  },
  {
    label: "Address",
    value: CONTACT.address,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`,
    icon: MapPin,
    color: "bg-gradient-to-br from-amber-400 to-orange-600",
    external: true,
  },
];

// Compact contact details for the home page (its "Contact us" part)
export function ContactSection() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <h2 className="mr-auto text-[11px] font-semibold uppercase tracking-[0.18em]">
          Contact us
        </h2>
        <span>
          A question about your meters or your bill? We&apos;re here to help.
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {CONTACT.hours}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {CHANNELS.map(({ label, value, href, icon: Icon, color, external }) => (
          <li key={label} className="min-w-0">
            <a
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              title={`${label}: ${value}`}
              className="group flex items-center gap-2 rounded-xl border bg-background/70 px-2.5 py-2 transition-all hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md"
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform group-hover:scale-110",
                  color,
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </span>
                <span className="truncate text-xs font-semibold">{value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
