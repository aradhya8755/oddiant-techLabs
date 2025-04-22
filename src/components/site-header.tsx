"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isAuthPage = pathname?.startsWith("/auth")

  if (isAuthPage) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl text-blue-600">
            Oddiant TechLabs
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="block md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              pathname === "/" ? "text-blue-600" : "text-foreground/60"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              pathname === "/about" ? "text-blue-600" : "text-foreground/60"
            }`}
          >
            About
          </Link>
          <Link
            href="/courses"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              pathname === "/courses" ? "text-blue-600" : "text-foreground/60"
            }`}
          >
            Courses
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              pathname === "/contact" ? "text-blue-600" : "text-foreground/60"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Register</Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
            <nav className="container grid gap-6 p-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/courses"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-4 mt-4">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
