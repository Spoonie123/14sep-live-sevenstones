"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabNav() {
  const pathname = usePathname();

  // Bepaal de sessie-base uit het huidige pad: /session/[id]/...
  const match = pathname?.match(/^\/session\/([^/]+)/);
  const base = match ? `/session/${match[1]}` : "";

  const tabs = [
    { name: "Persoonlijkheid", href: `${base}/personality` },
    { name: "Competenties", href: `${base}/competencies` },
    { name: "Conclusie & Advies", href: `${base}/conclusion` },
    { name: "Definitief", href: `${base}/definitief` }, // <-- juist pad
  ];

  return (
    <nav style={{ display: "flex", gap: 8 }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              textDecoration: "none",
              background: active ? "#003366" : "#eef2ff",
              color: active ? "#fff" : "#0f172a",
            }}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
