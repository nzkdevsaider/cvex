import Image from "next/image";
import Link from "next/link";
import packageJson from "../../package.json";

export function Navbar() {
  return (
    <header className="navbar bg-base-300/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-base-300 min-h-16 h-16 px-4 sm:px-6">
      <div className="navbar-start">
        {/* Logo */}
        <Link
          href="/files"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:opacity-80 transition-all duration-200 hover:scale-[1.04]"
        >
          <Image
            src="/logo.png"
            alt="CVeX logo"
            width={42}
            height={42}
            className="rounded-sm"
          />
          <span className="text-xs badge badge-sm badge-accent">
            {packageJson.version}
          </span>
        </Link>
      </div>

      <div className="navbar-end">
        {/* Nav links */}
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/files"
            className="link link-hover opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            Mis CVs
          </Link>
          <Link
            href="/settings"
            className="link link-hover opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            Ajustes
          </Link>
        </nav>
      </div>
    </header>
  );
}
