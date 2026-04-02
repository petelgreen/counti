"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Bookmark, Settings } from "lucide-react";

const items = [
  { href: "/",       label: "בית",      Icon: Home     },
  { href: "/history",label: "היסטוריה", Icon: History  },
  { href: "/saved",  label: "שמורות",   Icon: Bookmark },
  { href: "/settings",label: "הגדרות",  Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex items-center"
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        height: "calc(64px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors"
            style={{ color: active ? "var(--color-primary)" : "var(--color-text-muted)" }}
          >
            <Icon size={active ? 22 : 20} strokeWidth={active ? 2 : 1.5} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
