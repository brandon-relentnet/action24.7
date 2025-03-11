"use client";

import NavbarItem from "./NavbarItem";
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <>
            <nav className='z-50 h-20 flex items-center w-full bg-white text-black border-b border-gray-100'>
                <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-8 flex justify-between items-center">
                    {/* Left Section - Logo */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="font-light tracking-widest text-lg uppercase">
                            ACTION 24/7
                        </Link>
                    </div>

                    {/* Middle Section - Navigation */}
                    <div className="hidden md:flex items-center justify-center space-x-12">
                        <NavbarItem href='/collection' label='Collection' />
                        <NavbarItem href='/about' label='About' />
                    </div>

                    {/* Right Section - Cart */}
                    <div className="flex-1 flex justify-end">
                        <Link href="/cart" className="flex items-center relative group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="absolute -bottom-1 left-0 w-full h-px bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button onClick={toggleMenu} className="ml-6 md:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-white z-40 transition-transform duration-500 ease-in-out transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-20 px-8 flex items-center justify-between border-b border-gray-100">
                    <Link href="/" className="font-light tracking-widest text-lg uppercase">
                        ACTION 24/7
                    </Link>
                    <button onClick={toggleMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col px-8 py-12 space-y-8">
                    <NavbarItem href='/collection' label='Collection' onClick={toggleMenu} />
                    <NavbarItem href='/about' label='About' onClick={toggleMenu} />
                    <NavbarItem href='/cart' label='Cart' onClick={toggleMenu} />
                </div>
            </div>
        </>
    );
}