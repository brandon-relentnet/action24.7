"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavbarItem({ href, label, onClick }) {
    const pathname = usePathname();
    const isActive = pathname === href ||
        (href !== '/' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`relative font-light tracking-wider hover:text-gray-600 transition-colors duration-300 group`}
        >
            <span className={`${isActive ? 'text-black' : ''}`}>{label}</span>
            <span className={`absolute -bottom-1 left-0 w-full h-px bg-black transform transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
        </Link>
    );
}