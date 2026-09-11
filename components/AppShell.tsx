import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Header used on every screen except the call itself, which goes full-bleed. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2 sm:gap-2.5">
            <Image
              src="/nexalfield-mark.png"
              alt="NexalField"
              width={127}
              height={107}
              priority
              className="h-6 w-auto shrink-0 sm:h-7"
            />
            <span className="text-[14px] font-semibold tracking-tight">
              NexalField{" "}
              <span className="font-normal text-ink-faint">Sales Assistant</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-[13px]">
            <Link
              href="/"
              className="hidden rounded-lg px-3 py-1.5 font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink sm:inline"
            >
              Prospects
            </Link>
            <Link
              href="/prospects/new"
              className="rounded-lg bg-ink px-3 py-1.5 font-medium text-white transition-colors hover:bg-black"
            >
              + Prepare new
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
