"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
        isScrolled ? "bg-black/90 backdrop-blur-sm" : "bg-transparent"
      } transition-all duration-300`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="relative">
            <div style={{ width: "180px", height: "40px", position: "relative" }}>
              <Image
                src="/images/logos/oddiant-preview.png"
                alt="Oddiant Techlabs"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white hover:text-gray-300 transition-border hover:border-b-white hover:border-b-2 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/company"
              className="text-white hover:text-gray-300 transition-border hover:border-b-white hover:border-b-2 font-medium transition-colors"
            >
              Company
            </Link>
            <Link
              href="/solutions"
              className="text-white hover:text-gray-300 transition-border hover:border-b-white hover:border-b-2 font-medium transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-gray-300 transition-border hover:border-b-white hover:border-b-2 font-medium transition-colors"
            >
              Contact Us
            </Link>

            {/* User and Employee buttons */}
            <Link href="/auth/user">
              <Button
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white hover:text-black"
              >
                User
              </Button>
            </Link>
            <Link href="/auth/employee">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Employee</Button>
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-black text-white">
              <div className="flex flex-col space-y-6 mt-10">
                <Link
                  href="/"
                  className="text-xl font-medium hover:text-gray-300 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/company"
                  className="text-xl font-medium hover:text-gray-300 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Company
                </Link>
                <Link
                  href="/solutions"
                  className="text-xl font-medium hover:text-gray-300 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Solutions
                </Link>
                <Link
                  href="/contact"
                  className="text-xl font-medium hover:text-gray-300 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Contact Us
                </Link>

                <div className="pt-4 flex flex-col space-y-4">
                  <Link href="/auth/user" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent text-white border-white hover:bg-white hover:text-black"
                    >
                      User
                    </Button>
                  </Link>
                  <Link href="/auth/employee" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Employee</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
