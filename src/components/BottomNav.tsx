"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, Settings } from "lucide-react";

const items = [
  { href: "/",         label: "בית",    Icon: Home     },
  { href: "/saved",    label: "שמורות", Icon: Bookmark },
  { href: "/settings", label: "הגדרות", Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex items-center px-2"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "var(--shadow-nav)",
        height: "calc(68px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 relative transition-all duration-200"
            style={{ color: active ? "var(--color-primary)" : "var(--color-text-muted)" }}
          >
            {/* Active background pill */}
            {active && (
              <span
                className="absolute inset-x-3 top-1 bottom-1 rounded-2xl animate-scale-in"
                style={{ background: "var(--color-primary-light)" }}
              />
            )}
            <span className="relative flex items-center justify-center">
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.6}
                style={{ color: active ? "var(--color-primary)" : "var(--color-text-muted)" }}
              />
            </span>
            <span
              className="relative text-xs font-semibold tracking-tight"
              style={{ color: active ? "var(--color-primary)" : "var(--color-text-muted)", fontSize: 11 }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
