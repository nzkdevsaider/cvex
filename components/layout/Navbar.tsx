import Link from "next/link";

export function Navbar() {
  return (
    <header className="navbar bg-base-300/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-base-300 min-h-16 h-16 px-4 sm:px-6">
      <div className="navbar-start">
        {/* Logo */}
        <Link
          href="/files"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="badge badge-neutral font-bold px-2 py-3 text-sm">
            CVeX
          </span>
        </Link>
      </div>

      <div className="navbar-end">
        {/* Nav links */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/files" className="link link-hover opacity-70">
            Mis CVs
          </Link>
        </nav>
      </div>
    </header>
  );
}
