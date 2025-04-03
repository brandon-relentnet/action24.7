'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    // Team member data
    const teamMembers = [
        {
            name: "Shane VanBoening",
            image: "/images/shane-vanboening.jpg", // Updated to local image path
            role: "Professional Athlete",
            achievements: [
                "5x US Open Champion",
                "2022 World 9-ball Champion",
                "2023 World 8-ball Champion",
                "2024 Hall of Fame Inductee",
                "6x Player of the Year",
                "2010-2020 Billiards Digest Player of the Decade"
            ]
        },
        {
            name: "Sky Woodward", // Updated name from "Skyler" to "Sky"
            image: "/images/sky-woodward.jpg", // Updated to local image path
            role: "Professional Athlete",
            achievements: [
                "2019 Derby City Classic 9-ball Champion",
                "2019 Derby City Classic All Around Champion",
                "2018 and 2019 back-to-back Mosconi Cup MVP",
                "2019 U.S Open 8-ball Champion",
                "2024 Mosconi Cup Captain"
            ]
        },
        {
            name: "Billy Thorpe", // Updated from "Nick De Leon" to "Billy Thorpe"
            image: "/images/billy-thorpe.jpg", // Updated to local image path
            role: "Professional Athlete",
            achievements: [
                "2025 24th place in banks at Derby City Classic",
                "2025 24th in one pocket at Derby City Classic",
                "2022 Top 64 finish in first World Pool Championship"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white pt-22 pb-24">
            {/* Brand Story Section */}
            <section className="px-6 py-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-light tracking-wider uppercase mb-12">About Us</h1>

                    <div className="prose prose-lg mx-auto text-gray-700">
                        <p className="mb-6">
                            At Action 24/7 we are more than just a clothing brand. We're a movement dedicated to the art, precision, and culture of billiards. Born with a passion for the game, our apparel is designed for players who live and breathe the sport, both on and off the table.
                        </p>

                        <p className="mb-6">
                            We blend style, comfort, and performance to create high-quality clothing that reflects the confidence and skill of every player. We understand that the game of billiards demands precision, focus, and confidence—qualities we infuse into every piece of our collection. Whether you're shooting in a high-stakes match or just practicing with friends, our gear keeps you looking sharp and feeling comfortable.
                        </p>

                        <p className="mb-6">
                            Our designs are inspired by the spirit of competition and camaraderie that the game fosters, combining modern fashion trends with functional, durable materials that move with you.
                        </p>

                        <p className="mb-10">
                            Action 24/7 is where fashion meets billiards, and every shot feels like the winning shot. Join us in redefining billiards fashion. Wear the game. Live the game.
                        </p>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="px-6 py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-light tracking-wider text-center mb-16 uppercase">Meet Our Team</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="flex flex-col">
                                <div className="aspect-square overflow-hidden mb-6">
                                    {/* Switched to Next.js Image component for better performance */}
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={500}
                                        height={500}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <h3 className="text-xl font-light tracking-wider mb-2">{member.name}</h3>
                                <p className="text-gray-500 mb-4">{member.role}</p>

                                <ul className="space-y-2 mb-auto">
                                    {member.achievements.map((achievement, i) => (
                                        <li key={i} className="flex items-start mb-3">
                                            <span className="mr-2 text-sm">&#8212;</span>
                                            <span className="text-sm text-gray-700">{achievement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-16 text-gray-600">
                        <p>* New team members will be added upon request.</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="px-6 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-light tracking-wider mb-8 uppercase">Contact Us</h2>

                    <p className="text-gray-600 mb-8">
                        We'd love to hear from you. For inquiries, collaborations, or support, please reach out to us.
                    </p>

                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href="mailto:Action24.7@yahoo.com" className="text-black hover:underline underline-offset-4">
                                Action24.7@yahoo.com
                            </a>
                        </div>
                    </div>

                    <div className="mt-16">
                        <Link
                            href="/collection"
                            className="inline-block px-8 py-3 border border-black bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-white hover:text-black"
                        >
                            Shop Our Collection
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}