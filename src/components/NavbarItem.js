"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavbarItem({ href, label }) {
    const pathname = usePathname();

    return (
        <Link
            href={href}
            className={`hover:text-fuchsia-400 ${pathname === `${href}` ? 'text-fuchsia-300 underline' : ''} transition duration-150`}
        >
            {label}
        </Link>
    );
}