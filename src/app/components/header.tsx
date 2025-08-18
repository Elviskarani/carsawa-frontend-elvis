"use client";

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PhoneCall, User } from "lucide-react"
import AuthModal from './Authmodal'
import { TokenManager } from '../services/api'

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
      onClick={onClick}
      className={`text-sm font-medium leading-normal ${textColor}`}
    >
      <span
        className={`
          relative inline-block
          after:content-[''] after:absolute after:left-0 after:bottom-0
          after:h-[2px] after:bg-current after:w-full
          after:transition-transform after:duration-300
          ${isActive ? 'after:scale-x-100' : 'after:scale-x-0'}
          after:origin-left hover:after:scale-x-100
        `}
      >
        {children}
      </span>
    </Link>
  )
}


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 0)
    }

    // Check authentication status
    const checkAuthStatus = () => {
      setIsAuthenticated(TokenManager.isTokenValid())
    }

    // Check on mount
    checkAuthStatus()

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuthStatus()
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSignInClick = () => {
    if (isAuthenticated) {
      // If authenticated, redirect to account page
      window.location.href = '/account'
    } else {
      // If not authenticated, open auth modal
      setIsAuthModalOpen(true)
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setIsAuthModalOpen(false)
  }

  const handleCloseModal = () => {
    setIsAuthModalOpen(false)
  }

  const getHeaderBackground = () => {
    if (isHomePage) {
      // Only force white background when mobile menu is open OR scrolled
      if (isMenuOpen) {
        return 'bg-white border-b border-solid border-b-[#293038]'
      }
      return isScrolled
        ? 'bg-white border-b border-solid border-b-[#293038]'
        : 'bg-transparent border-b-transparent'
    }
    return 'bg-white border-b border-solid border-b-[#293038]'
  }

  const getTextColor = () => {
    if (isHomePage) {
      // Force black text only when mobile menu is open OR scrolled
      if (isMenuOpen) {
        return 'text-black'
      }
      return isScrolled ? 'text-black' : 'text-white'
    }
    return 'text-black'
  }

  const getIconColor = () => {
    if (isHomePage) {
      // Force black icons only when mobile menu is open OR scrolled
      if (isMenuOpen) {
        return 'text-black'
      }
      return isScrolled ? 'text-black' : 'text-white'
    }
    return 'text-black'
  }

  const getSignInBorder = () => {
    if (isHomePage) {
      if (isMenuOpen) {
        return 'border-gray-700 hover:bg-gray-50'
      }
      return isScrolled
        ? 'border-gray-700 hover:bg-gray-50'
        : 'border-white'
    }
    return 'border-gray-700 hover:bg-gray-50'
  }

  const getMobileMenuBackground = () => {
    // Always white background for mobile menu
    return 'bg-white border-t border-[#293038]'
  }

  const getMobileBorderColor = () => {
    // Always gray border for mobile menu
    return 'border-gray-200'
  }

  const getMobileMenuButtonStyle = () => {
    if (isHomePage) {
      // When menu is open, always use dark colors regardless of scroll
      return isMenuOpen
        ? 'text-black hover:bg-gray-100'
        : (isScrolled ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white hover:bg-opacity-10')
    }
    return 'text-black hover:bg-gray-100'
  }

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${getHeaderBackground()}`}>
        <div className="
          flex
          items-center
          px-4 sm:px-6 md:px-12 py-3
        ">
          {/* Left: Logo + Mobile Menu Button */}
          <div className="flex-1 flex justify-start items-center gap-3">
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
            </Link>
          </div>

          {/* Center: Nav - Desktop only */}
          <div className="hidden lg:flex justify-center gap-5 flex-1">
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
            <NavLink href="https://blog.carsawa.africa" pathname={pathname} textColor={getTextColor()}>
              blog
            </NavLink>
          </div>

      
          <div className="flex justify-end items-center gap-5 flex-1">
            {/* Sign In/User Icon - Both Desktop and Mobile */}
            <div
              className={`flex border rounded p-2 gap-2 items-center hover:bg-opacity-5 hover:bg-[#a2d462] transition-colors cursor-pointer ${getSignInBorder()}`}
              onClick={handleSignInClick}
            >
              <User size={18} className={getIconColor()} />
              {!isAuthenticated && (
                <h2 className={`text-sm hidden lg:block ${getTextColor()}`}>
                  Sign In
                </h2>
              )}
            </div>

            {/* Phone - Desktop only */}
            <div className="hidden md:flex gap-2 items-center">
              <PhoneCall size={18} className={getIconColor()} />
              <h2 className={`text-sm ${getTextColor()}`}>
                +254791001601
              </h2>
            </div>

            <button
              onClick={toggleMenu}
              className={`lg:hidden p-2 rounded-md transition-colors ${getMobileMenuButtonStyle()}`}
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
        </div>

     {isMenuOpen && (
  <nav
    className={`lg:hidden absolute top-[100%] right-2 w-30 rounded-md shadow-lg px-4 py-4 z-50 ${getMobileMenuBackground()}`}
  >
    <div className="flex flex-col space-y-4">
      <NavLink
        href="/cars"
        pathname={pathname}
        textColor="text-black"
        onClick={() => setIsMenuOpen(false)}
      >
        Buy
      </NavLink>
      <NavLink
        href="/sell-a-car"
        pathname={pathname}
        textColor="text-black"
        onClick={() => setIsMenuOpen(false)}
      >
        Sell
      </NavLink>
      <NavLink
        href="/account"
        pathname={pathname}
        textColor="text-black"
        onClick={() => setIsMenuOpen(false)}
      >
        Account
      </NavLink>
      <NavLink
        href="/dealers"
        pathname={pathname}
        textColor="text-black"
        onClick={() => setIsMenuOpen(false)}
      >
        Dealerships
      </NavLink>
      <NavLink
        href="https://blog.carsawa.africa"
        pathname={pathname}
        textColor="text-black"
        onClick={() => setIsMenuOpen(false)}
      >
        Blog
      </NavLink>

      <div className={`border-t pt-2  sm:hidden ${getMobileBorderColor()}`}>
        <a 
        href='tel:0791001601'
        className="flex items-center gap-2 py-2">
          <PhoneCall size={15} className="text-black" />
          <span className="text-sm text-black">Support </span>
        </a>
      </div>
    </div>
  </nav>
)}


      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}

export default Header