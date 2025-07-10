// components/Header.js
"use client";

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PhoneCall } from "lucide-react"
import { User } from "lucide-react"
import AuthModal from './Authmodal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 0)
    }

    window.addEventListener('scroll', handleScroll)
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const openAuthModal = () => {
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  const handleSignInClick = () => {
    setIsAuthModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAuthModalOpen(false)
  }

  // Determine header background based on scroll state and page
  const getHeaderBackground = () => {
    if (isHomePage) {
      return isScrolled 
        ? 'bg-white border-b border-solid border-b-[#293038]' 
        : 'bg-transparent border-b-transparent'
    }
    return 'bg-white border-b border-solid border-b-[#293038]'
  }

  // Determine text color based on scroll state and page
  const getTextColor = () => {
    if (isHomePage) {
      return isScrolled ? 'text-black' : 'text-white'
    }
    return 'text-black'
  }

  // Determine icon color based on scroll state and page
  const getIconColor = () => {
    if (isHomePage) {
      return isScrolled ? 'text-black' : 'text-white'
    }
    return 'text-black'
  }

  // Determine border color for sign-in button
  const getSignInBorder = () => {
    if (isHomePage) {
      return isScrolled 
        ? 'border-gray-700 hover:bg-gray-50' 
        : 'border-white'
    }
    return 'border-gray-700 hover:bg-gray-50'
  }

  // Determine mobile menu background
  const getMobileMenuBackground = () => {
    if (isHomePage) {
      return isScrolled 
        ? 'bg-white border-t border-[#293038]'
        : 'bg-black bg-opacity-90 border-t border-white border-opacity-20'
    }
    return 'bg-white border-t border-[#293038]'
  }

  // Determine mobile menu border color
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
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-3">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/carsawa.png"
                alt="Desty Events Logo"
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5">
            <Link href="/cars" className={`text-sm font-medium leading-normal hover:underline hover:font-bold transition-opacity ${getTextColor()}`}>
              Buy
            </Link>
            <Link href="/dealers" className={`text-sm font-medium leading-normal hover:underline hover:font-bold transition-opacity ${getTextColor()}`}>
              View Dealerships
            </Link>
            <Link href="/sell-a-car" className={`text-sm font-medium leading-normal hover:underline hover:font-bold transition-opacity ${getTextColor()}`}>
              Sell
            </Link>
           
            <Link href="/account" className={`text-sm font-medium leading-normal hover:underline hover:font-bold transition-opacity ${getTextColor()}`}>
              Account
            </Link>
           
          </nav>

          {/* Contact section - Hidden on mobile, visible on tablet and up */}
          <div className="hidden md:flex gap-2 items-center">
            <PhoneCall size={18} className={getIconColor()}/>
            <h2 className={`text-sm ${getTextColor()}`}>
              Call us at +254791001601
            </h2>
          </div>

          {/* Sign in button - Always visible, responsive design */}
          <div 
            className={`flex border rounded p-2 gap-2 items-center hover:bg-opacity-10 hover:bg-gray-500 transition-colors cursor-pointer ${getSignInBorder()}`}
            onClick={handleSignInClick}
          >
            <User size={18} className={getIconColor()}/>
            <h2 className={`text-sm sm:block ${getTextColor()}`}>
              Sign In
            </h2>
          </div>

          {/* Mobile Menu Button - Only visible on mobile */}
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
              <Link 
                href="/cars" 
                className={`text-sm font-medium leading-normal hover:opacity-80 transition-opacity py-2 ${getTextColor()}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Buy
              </Link>
              <Link 
                href="/sell-a-car" 
                className={`text-sm font-medium leading-normal hover:opacity-80 transition-opacity py-2 ${getTextColor()}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sell
              </Link>
             
              <Link 
                href="/account" 
                className={`text-sm font-medium leading-normal hover:opacity-80 transition-opacity py-2 ${getTextColor()}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Account
              </Link>
            
              {/* Mobile-only contact info */}
              <div className={`border-t pt-4 mt-4 sm:hidden ${getMobileBorderColor()}`}>
                <div className="flex items-center gap-2 py-2">
                  <PhoneCall size={18} className={getIconColor()}/>
                  <span className={`text-sm ${getTextColor()}`}>
                    +254791001601
                  </span>
                </div>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  )
}

export default Header