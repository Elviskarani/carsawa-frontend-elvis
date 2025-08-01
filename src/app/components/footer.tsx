import React from 'react';
import Link from 'next/link';
import { FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#272D3C] text-white py-8">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo section */}
          <div className="mb-6 md:mb-0">
            <Link href="/">
              <span className="text-xl font-bold" style={{ color: '#c1ff72' }}>CARSAWA</span>
            </Link>
            
            <div className="mt-6">
              <h3 className="mb-4">Stay up to date</h3>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white text-black p-2 w-full rounded-l"
                />
                <button 
                  className="rounded-r p-2" 
                  style={{ backgroundColor: '#c1ff72', color: '#1a1a1a' }}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="mb-4 font-bold" style={{ color: '#c1ff72' }}>Company</h3>
            <ul>
              <li className="mb-2"><Link href="/cars">Buy a Car</Link></li>
              <li className="mb-2"><Link href="/sell-a-car">Sell Your Car</Link></li>
              <li className="mb-2"><a href="https://wa.me/254716937165" target="_blank" rel="noopener noreferrer">
                Contact
              </a></li>
            </ul>
          </div>

        

          {/* Location info */}
          <div>
            <h3 className="mb-4 font-bold" style={{ color: '#c1ff72' }}>Location</h3>
            <div>
              <p className="mb-2">
                <a href="tel:0791001601" style={{ color: '#c1ff72' }}>0791001601</a>
              </p>
              
              <p className="mb-1">Nairobi <span style={{ color: '#c1ff72' }}>Now Open</span></p>
              <p><a href="https://wa.me/254716937165" target="_blank" rel="noopener noreferrer" style={{ color: '#c1ff72' }}>Contact Us</a></p>
            </div>
          </div>
        </div>

        {/* Bottom copyright and social links */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p>© Carsawa 2025 All rights reserved</p>
          <div className="flex items-center mt-4 md:mt-0">
            <p className="mr-2">Site powered by</p>
            <a href="#" className="font-medium" style={{ color: '#c1ff72' }}>Carsawa</a>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-400"><FaTwitter /></a>
            <a href="#" className="hover:text-gray-400"><FaYoutube /></a>
            <a href="https://www.instagram.com/carsawakenya/" className="hover:text-gray-400"><FaInstagram /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;