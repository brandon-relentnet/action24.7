'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Featured collections data
  const featuredCollections = [
    {
      title: "Competition Apparel",
      image: "https://images.unsplash.com/photo-1626078293858-0c33ce7b9984?ixlib=rb-4.0.3", // Person playing billiards
      link: "/collection/competition"
    },
    {
      title: "Premium Lifestyle",
      image: "https://images.unsplash.com/photo-1571786256017-aee7a0c009b6?ixlib=rb-4.0.3", // Billiards related
      link: "/collection/lifestyle"
    },
    {
      title: "Accessories",
      image: "https://images.unsplash.com/photo-1636155436327-ef2bfb0bd48b?ixlib=rb-4.0.3", // Billiards accessory
      link: "/collection/accessories"
    }
  ];

  // Hero slides data
  const heroSlides = [
    {
      title: "Precision in Motion",
      subtitle: "Spring Collection 2025",
      description: "High-performance apparel designed for champions. Crafted for those who live and breathe the game.",
      image: "https://images.unsplash.com/photo-1627199219038-e8263f729e3d?ixlib=rb-4.0.3", // Billiards related
      cta: "Shop Now",
      link: "/collection"
    },
    {
      title: "Confidence at the Table",
      subtitle: "Endorsed by Champions",
      description: "Worn by the world's top billiards players. Designed for focus, comfort, and precision.",
      image: "https://images.unsplash.com/photo-1615698378482-1311b35c7287?ixlib=rb-4.0.3", // Billiards related
      cta: "Explore",
      link: "/collection"
    },
    {
      title: "Wear the Game",
      subtitle: "Live the Game",
      description: "Where fashion meets billiards. Every shot feels like the winning shot.",
      image: "https://images.unsplash.com/photo-1580657130742-a1613256548e?ixlib=rb-4.0.3", // Billiards related
      cta: "Discover",
      link: "/collection"
    }
  ];

  // Auto-advance the slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Manual slide navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slider */}
      <div className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Slide Content */}
            <div className="relative h-full flex flex-col justify-center max-w-4xl mx-auto px-6 text-white">
              <div className="transform transition-transform duration-1000 delay-300">
                <h3 className="text-xl md:text-2xl font-light tracking-widest mb-2">
                  {slide.subtitle}
                </h3>
                <h2 className="text-4xl md:text-6xl font-light tracking-wide mb-6">
                  {slide.title}
                </h2>
                <p className="max-w-md text-lg font-light mb-8">
                  {slide.description}
                </p>
                <Link
                  href={slide.link}
                  className="inline-block px-8 py-3 border border-white bg-transparent text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-white hover:text-black"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 p-2 text-white hover:text-gray-200 transition-colors z-10"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 p-2 text-white hover:text-gray-200 transition-colors z-10"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-16 h-1 transition-all ${currentSlide === index ? 'bg-white' : 'bg-white/40'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Collections */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light tracking-wider text-center mb-16 uppercase">Shop By Category</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCollections.map((collection, index) => (
              <Link
                key={index}
                href={collection.link}
                className="group block"
              >
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <h3 className="text-2xl font-light tracking-wider text-center">
                      {collection.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light tracking-wider mb-8 uppercase">Our Mission</h2>

          <p className="text-gray-700 mb-6 leading-relaxed">
            At Action 24/7 we are more than just a clothing brand. We're a movement dedicated to the art, precision, and culture of billiards. Born with a passion for the game, our apparel is designed for players who live and breathe the sport, both on and off the table.
          </p>

          <p className="text-gray-700 mb-10 leading-relaxed">
            We blend style, comfort, and performance to create high-quality clothing that reflects the confidence and skill of every player. Join us in redefining billiards fashion.
          </p>

          <Link
            href="/about"
            className="inline-block px-8 py-3 border border-black bg-transparent text-black uppercase tracking-wider text-sm font-light transition-colors hover:bg-black hover:text-white"
          >
            About Us
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light tracking-wider mb-6 uppercase">Join Our Community</h2>
          <p className="text-gray-600 mb-8">Subscribe to receive updates on new collections, exclusive offers, and player highlights.</p>

          <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow p-3 border border-gray-200 focus:outline-none focus:border-black"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-gray-900"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-500">By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.</p>
        </div>
      </section>
    </div>
  );
}