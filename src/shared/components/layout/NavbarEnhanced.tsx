// src/shared/components/layout/NavbarEnhanced.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet";

export default function NavbarEnhanced() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = 0; // يمكن ربطه بالـ store

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <Image
            src="/logo.png"
            alt="Exaado"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            Exaado
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="/shop">المتجر</NavLink>
          <NavLink href="/academy">الأكاديمية</NavLink>
          <NavLink href="/profile">حسابي</NavLink>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications" aria-label="الإشعارات">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="القائمة">
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <MobileNavLink
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  المتجر
                </MobileNavLink>
                <MobileNavLink
                  href="/academy"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  الأكاديمية
                </MobileNavLink>
                <MobileNavLink
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  حسابي
                </MobileNavLink>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-gray-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-lg font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
    >
      {children}
    </Link>
  );
}
