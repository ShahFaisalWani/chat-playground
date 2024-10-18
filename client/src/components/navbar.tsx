'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";
import Image from "next/image";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { auth, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    logout();
    setIsExpanded(false);
  }

  return (
    <nav className="hidden md:flex h-[6rem] items-center">
      <div className="w-full flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-semibold flex gap-2 items-center">
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
          <h1 className="text-xl font-semibold">SHAHPHOON</h1>
        </Link>

        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="relative flex items-center space-x-4">
          {auth.logged_in ? (
            <>
              <a href="https://docs.opentyphoon.ai" className="border border-primary rounded-3xl px-4 py-2 text-text">
                Docs
              </a>

              <div className="flex gap-4 items-center cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="text-lg font-medium">
                  <span className="rounded-full bg-primary text-white font-bold text-center px-3 py-2 mr-2">{auth.username ? auth.username[0].toUpperCase() : ''}</span>
                  <span className="text-md text-text">{auth.username ? `${auth.username.substring(0, 20)}${auth.username.length > 20 ? '...' : ''}` : ''}</span>
                </div>
                <div className="p-1.5 bg-bg rounded-xl flex justify-center items-center">
                  {isExpanded ? <FaChevronUp size={15} className="group-hover:text-primary" /> : <FaChevronDown size={15} className="group-hover:text-primary" />}
                </div>
              </div>

              {isExpanded && (
                <div ref={dropdownRef} className="absolute top-[3rem] right-0 bg-gray shadow-lg p-4 rounded-lg z-10">
                  <button
                    onClick={handleLogout}
                    className="-btn border-gradient text-text font-medium px-8 h-10 flex justify-center items-center gap-2 rounded-xl"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {pathname !== '/login' && (
                <Link href="/login">
                  <button className="-btn border-gradient text-text font-medium px-8 h-10 flex justify-center items-center gap-2 rounded-xl">
                    Login
                  </button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
