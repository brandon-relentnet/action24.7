import NavbarItem from "./NavbarItem";

export default function Navbar() {
    return (
        <nav className='fixed h-16 flex items-center justify-center space-x-4 top-0 left-0 w-full bg-zinc-900 text-white'>
            <NavbarItem href='/' label='Home' />
            <NavbarItem href='/catalog' label='Shop' />
            <NavbarItem href='/cart' label='Cart' />
        </nav>
    );
}