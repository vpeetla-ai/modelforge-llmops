"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Overview" },
  { href: "/taxonomy", label: "Taxonomy glassbox" },
];

export function PlatformNav() {
  const pathname = usePathname();

  return (
    <header className="platform-nav">
      <div className="platform-nav-inner">
        <Link href="/" className="platform-brand">
          ModelForge
        </Link>
        <nav className="platform-tabs" aria-label="Model Plane sections">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={pathname === t.href ? "platform-tab active" : "platform-tab"}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <a
          href="https://venkat-ai.com/model-plane"
          className="platform-ext"
          target="_blank"
          rel="noreferrer"
        >
          venkat-ai.com/model-plane ↗
        </a>
      </div>
    </header>
  );
}
