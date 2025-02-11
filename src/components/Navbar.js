import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className='fixed top-0 left-0 w-full bg-gray-800 text-white p-4'>
            <ul>
                <li>
                    <Link href="/">Home</Link>
                </li>
                <li>
                    <Link href="/catalog">Catalog</Link>
                </li>
                <li>
                    <Link href="/cart">Cart</Link>
                </li>
            </ul>
        </nav>
    );
}