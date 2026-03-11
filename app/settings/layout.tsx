"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SETTINGS_ITEMS } from "@/lib/config";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="mt-1 text-sm opacity-60">
          Configura tu experiencia en CVeX.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-56 shrink-0">
          <nav className="flex flex-col gap-1">
            {SETTINGS_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-content font-medium"
                      : "hover:bg-base-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.title}
                  {item.isBeta && (
                    <span className="badge badge-neutral badge-sm">BETA</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
