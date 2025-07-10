"use client";

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PhoneCall, User } from "lucide-react"
import AuthModal from './Authmodal'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  pathname: string
  textColor: string
  onClick?: () => void
}

const NavLink = ({
  href,
  children,
  pathname,
  textColor,
  onClick
}: NavLinkProps) => {
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`
        relative text-sm font-medium leading-normal
        after:content-[''] after:absolute after:left-0 after:bottom-0
        after:h-[2px] ${isActive ? 'after:w-full' : 'after:w-0'}
        after:bg-current hover:after:w-full
        after:transition-all after:duration-300
        ${textColor}
      `}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 0)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSignInClick = () => {
    setIsAuthModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAuthModalOpen(false)
  }

  const getHeaderBackground = () => {
    if (isHomePage) {
      return isScrolled
        ? 'bg-white border-b border-solid border-b-[#293038]'
        : 'bg-transparent border-b-transparent'
    }
    return 'bg-white border-b border-solid border-b-[#293038]'
  }

  const getTextColor = () => {
    if (isHomePage) {
      return isScrolled ? 'text-black' : 'text-white'
    }
    return 'text-black'
  }

  const getIconColor = () => {
    if (isHomePage) {
      return isScrolled ? 'text-black' : 'text-white'
    }
    return 'text-black'
  }

  const getSignInBorder = () => {
    if (isHomePage) {
      return isScrolled
        ? 'border-gray-700 hover:bg-gray-50'
        : 'border-white'
    }
    return 'border-gray-700 hover:bg-gray-50'
  }

  const getMobileMenuBackground = () => {
    if (isHomePage) {
      return isScrolled
        ? 'bg-white border-t border-[#293038]'
        : 'bg-black bg-opacity-90 border-t border-white border-opacity-20'
    }
    return 'bg-white border-t border-[#293038]'
  }

  const getMobileBorderColor = () => {
    if (isHomePage) {
      return isScrolled
        ? 'border-gray-200'
        : 'border-white border-opacity-20'
    }
    return 'border-gray-200'
  }

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${getHeaderBackground()}`}>
        <div className="
          grid grid-cols-3
          items-center
          px-4 sm:px-6 md:px-12 py-3
        ">
          {/* Left: Logo */}
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <Image
                  src="/carsawa.png"
                  alt="Carsawa Logo"
                  fill
                  className="object-contain rounded-md"
                  sizes="(max-width: 640px) 40px, 48px"
                  priority
                />
              </div>
              <h2 className={`text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] ${getTextColor()}`}>
                Carsawa
              </h2>
            </Link>
          </div>

          {/* Center: Nav */}
          <div className="hidden lg:flex justify-center gap-5">
            <NavLink href="/cars" pathname={pathname} textColor={getTextColor()}>
              Buy
            </NavLink>
            <NavLink href="/dealers" pathname={pathname} textColor={getTextColor()}>
              View Dealerships
            </NavLink>
            <NavLink href="/sell-a-car" pathname={pathname} textColor={getTextColor()}>
              Sell
            </NavLink>
            <NavLink href="/account" pathname={pathname} textColor={getTextColor()}>
              Account
            </NavLink>
          </div>

          {/* Right: Sign In + Phone */}
          <div className="hidden lg:flex justify-end items-center gap-5">
            <div
              className={`flex border rounded p-2 gap-2 items-center hover:bg-opacity-5 hover:bg-[#a2d462] transition-colors cursor-pointer ${getSignInBorder()}`}
              onClick={handleSignInClick}
            >
              <User size={18} className={getIconColor()} />
              <h2 className={`text-sm sm:block ${getTextColor()}`}>
                Sign In
              </h2>
            </div>

            <div className="hidden md:flex gap-2 items-center">
              <PhoneCall size={18} className={getIconColor()} />
              <h2 className={`text-sm ${getTextColor()}`}>
                +254791001601
              </h2>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`lg:hidden p-2 rounded-md transition-colors ${
              isHomePage
                ? (isScrolled ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white hover:bg-opacity-10')
                : 'text-black hover:bg-gray-100'
            }`}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className={`lg:hidden px-4 py-4 ${getMobileMenuBackground()}`}>
            <div className="flex flex-col space-y-4">
              <NavLink
                href="/cars"
                pathname={pathname}
                textColor={getTextColor()}
                onClick={() => setIsMenuOpen(false)}
              >
                Buy
              </NavLink>
              <NavLink
                href="/sell-a-car"
                pathname={pathname}
                textColor={getTextColor()}
                onClick={() => setIsMenuOpen(false)}
              >
                Sell
              </NavLink>
              <NavLink
                href="/account"
                pathname={pathname}
                textColor={getTextColor()}
                onClick={() => setIsMenuOpen(false)}
              >
                Account
              </NavLink>

              <div className={`border-t pt-4 mt-4 sm:hidden ${getMobileBorderColor()}`}>
                <div className="flex items-center gap-2 py-2">
                  <PhoneCall size={18} className={getIconColor()} />
                  <span className={`text-sm ${getTextColor()}`}>
                    +254791001601
                  </span>
                </div>
              </div>
            </div>
          </nav>
        )}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}

export default Header
