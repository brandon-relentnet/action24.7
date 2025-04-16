/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/qr1',
                destination: '/',
                permanent: true,
            },
        ];
    }
};

export default nextConfig;
