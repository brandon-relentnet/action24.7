"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function NavDropdown({ label, mainLink, items = [], loading = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const pathname = usePathname();

    const isActive = pathname === mainLink ||
        (mainLink !== '/' && pathname.startsWith(mainLink));

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative group z-50" ref={dropdownRef}>
            {/* Main dropdown trigger */}
            <div className="flex items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <Link
                    href={mainLink}
                    className={`relative font-light tracking-wider hover:text-gray-600 transition-colors duration-300 group mr-1`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className={`${isActive ? 'text-black' : ''}`}>{label}</span>
                    <span className={`absolute -bottom-1 left-0 w-full h-px bg-black transform transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </Link>

                {/* Dropdown indicator */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown menu */}
            <div
                className={`absolute top-full left-0 mt-2 py-2 w-48 bg-white shadow-lg rounded-sm border border-gray-100 transition-all duration-300 ${isOpen ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'
                    }`}
            >
                {loading ? (
                    <div className="px-4 py-2 text-sm text-gray-400">Loading...</div>
                ) : items.length > 0 ? (
                    <>
                        <Link
                            href={mainLink}
                            className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150"
                            onClick={() => setIsOpen(false)}
                        >
                            All Items
                        </Link>

                        <div className="my-1 border-t border-gray-100"></div>

                        {items.map(item => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </>
                ) : (
                    <div className="px-4 py-2 text-sm text-gray-400">No categories found</div>
                )}
            </div>
        </div>
    );
}