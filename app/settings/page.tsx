import Link from "next/link";
import { SETTINGS_ITEMS } from "@/lib/config";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-3">
      {SETTINGS_ITEMS.map((section) => (
        <Link key={section.href} href={section.href}>
          <div className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors">
            <div className="card-body flex-row items-center gap-4 py-4">
              <span className="text-3xl">{section.icon}</span>
              <div>
                <h2 className="font-semibold items-center flex flex-row gap-2">
                  {section.title}{" "}
                  {section.isBeta && (
                    <span className="badge badge-neutral badge-sm">BETA</span>
                  )}
                </h2>
                <p className="text-sm opacity-60">{section.description}</p>
              </div>
              <span className="ml-auto opacity-40">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
