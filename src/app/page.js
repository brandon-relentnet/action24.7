'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Online hosted images for all image needs
  const onlineImages = {
    // Hero slides - higher quality billiards related images
    heroSlide1: "https://images.unsplash.com/photo-1575553939928-d03b21323afe?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    heroSlide2: "https://images.unsplash.com/photo-1676333047876-0c5ee0716681?w=2000&auto=format&fit=crop&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fGJpbGxpYXJkc3xlbnwwfHwwfHx8MA%3D%3D",
    heroSlide3: "https://images.unsplash.com/photo-1693579873118-e5fae7fdcc31?w=2000&auto=format&fit=crop&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzB8fGJpbGxpYXJkc3xlbnwwfHwwfHx8MA%3D%3D",

    // Athletes - using local images
    shaneVanBoening: "/images/shane-vanboening.jpg",
    skyWoodward: "/images/sky-woodward.jpg",
    billyThorpe: "/images/billy-thorpe.jpg",

    // Category background
    categoryBg: "https://images.unsplash.com/photo-1609710219611-33446ea1f2bc?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.0.3"
  };

  // Hero slides data with online images
  const heroSlides = [
    {
      title: "Precision in Motion",
      subtitle: "Spring Collection 2025",
      description: "High-performance apparel endorsed by Shane VanBoening and Sky Woodward. Designed for those who demand excellence at every shot.",
      image: onlineImages.heroSlide1,
      cta: "Shop Now",
      link: "/collection"
    },
    {
      title: "Confidence at the Table",
      subtitle: "Endorsed by Champions",
      description: "Worn by the world's top professionals. Our gear helps you focus on what matters—winning the game.",
      image: onlineImages.heroSlide2,
      cta: "Explore",
      link: "/collection"
    },
    {
      title: "Wear the Game",
      subtitle: "Live the Game",
      description: "From tournaments to casual play, our collection embodies the spirit and precision of billiards in every stitch.",
      image: onlineImages.heroSlide3,
      cta: "Discover",
      link: "/collection"
    }
  ];

  // Featured athlete section
  const featuredAthletes = [
    {
      name: "Shane VanBoening",
      quote: "When I'm at the table, I need gear that moves with me and keeps me comfortable through long tournaments. Action 24/7 delivers exactly that.",
      image: onlineImages.shaneVanBoening,
      achievement: "2022 World 9-ball Champion"
    },
    {
      name: "Sky Woodward",
      quote: "I've worn a lot of brands, but nothing compares to the quality and style of Action 24/7. It's my go-to for competition and casual wear.",
      image: onlineImages.skyWoodward,
      achievement: "2024 Mosconi Cup Captain"
    },
    {
      name: "Billy Thorpe",
      quote: "Action 24/7 understands what players need. Their apparel helps me stay focused and perform at my best, every time.",
      image: onlineImages.billyThorpe,
      achievement: "Professional Pool Player"
    }
  ];

  // Luxury brand values - with minimal icons
  const brandValues = [
    {
      title: "Uncompromising Quality",
      description: "Meticulously crafted from premium materials selected for durability and comfort",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      title: "Distinctive Design",
      description: "Sophisticated aesthetics that reflect the elegance and precision of billiards",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    {
      title: "Performance Engineering",
      description: "Every piece optimized for freedom of movement and maximum comfort during play",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Champion Endorsed",
      description: "Tested and refined by the world's top professional billiards players",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  // Customer testimonials section
  const testimonials = [
    {
      name: "Michael Thompson",
      location: "Denver, CO",
      text: "The quality of Action 24/7 shirts is unmatched. I've worn them for three tournaments now and they've held up perfectly."
    },
    {
      name: "Sarah Kline",
      location: "Austin, TX",
      text: "Love the designs and comfort of these clothes. I get compliments every time I wear my Action 24/7 polo at league night."
    },
    {
      name: "James Blackwell",
      location: "Chicago, IL",
      text: "Finally, billiards apparel that doesn't look like bowling shirts. Modern, stylish, and perfect for competition."
    }
  ];

  // Category descriptions mapping
  const categoryDescriptions = {
    // Default descriptions for common category names
    'Competition Apparel': 'Performance wear designed for the serious player. Comfortable, stylish, and built to last.',
    'Premium Lifestyle': 'Casual elegance for everyday wear. Show your passion for the game on and off the table.',
    'Accessories': 'Complete your look with our premium accessories. Functional and fashionable.',
    'T-Shirts': 'Premium cotton tees featuring our signature designs. Perfect for casual wear.',
    'Hoodies': 'Stay warm and stylish with our premium hoodies. Comfortable for practice or everyday wear.',
    'Hats': 'Premium headwear with the Action 24/7 mark of quality. Perfect for on and off the table.',
    'Polos': 'Professional-grade polos designed for competition. Moisture-wicking fabric keeps you cool under pressure.',
  };

  // Get color scheme for a category
  const getCategoryStyle = () => {
    // Default luxury scheme
    return { bgColor: 'rgba(28, 28, 30, 0.92)', textColor: 'text-white', borderColor: 'border-gray-400' };
  };

  // Fetch categories from API
  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      try {
        const res = await fetch('/api/catalog');
        const data = await res.json();

        if (!isMounted) return;

        // Process and enhance the categories
        const enhancedCategories = (data.categories || []).map(category => {
          const name = category.categoryData?.name || 'Unnamed Category';
          const style = getCategoryStyle(name);

          return {
            id: category.id,
            name: name,
            description: categoryDescriptions[name] || 'Quality billiards apparel for the discerning player.',
            style: style,
            link: `/collection?category=${category.id}`
          };
        });

        // Limit to 3 categories for the feature section
        setCategories(enhancedCategories.slice(0, 3));
      } catch (err) {
        console.error('Error fetching categories:', err);

        if (!isMounted) return;

        // Fallback categories in case of API failure
        setCategories([
          {
            id: 'fallback1',
            name: 'Competition Apparel',
            description: 'Performance wear designed for the serious player. Comfortable, stylish, and built to last.',
            style: getCategoryStyle('Competition Apparel'),
            link: '/collection'
          },
          {
            id: 'fallback2',
            name: 'Premium Lifestyle',
            description: 'Casual elegance for everyday wear. Show your passion for the game on and off the table.',
            style: getCategoryStyle('Premium Lifestyle'),
            link: '/collection'
          },
          {
            id: 'fallback3',
            name: 'Accessories',
            description: 'Complete your look with our premium accessories. Functional and fashionable.',
            style: getCategoryStyle('Accessories'),
            link: '/collection'
          }
        ]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

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
      {/* Hero Slider - Luxury style with enhanced overlay and typography */}
      <div className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          >
            {/* Background Image with luxury gradient overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
            </div>

            {/* Slide Content - Refined typography and spacing */}
            <div className="relative h-full flex flex-col justify-center max-w-4xl mx-auto px-6">
              <div className="transform transition-transform duration-1000 delay-300">
                <h3 className="text-xl md:text-2xl font-extralight tracking-[0.25em] mb-3 text-white/80 uppercase">
                  {slide.subtitle}
                </h3>
                <h2 className="text-4xl md:text-6xl font-light tracking-wider mb-8 text-white">
                  {slide.title}
                </h2>
                <p className="max-w-md text-lg font-light mb-10 text-white/90 leading-relaxed">
                  {slide.description}
                </p>
                <Link
                  href={slide.link}
                  className="inline-block px-10 py-4 border border-white/80 bg-transparent text-white uppercase tracking-widest text-sm font-light transition-all duration-300 hover:bg-white hover:text-black"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows - More elegant styling */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators - More elegant styling */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-100' : 'bg-white/40 scale-75 hover:scale-90 hover:bg-white/60'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Brand Statement - Elegant centered design */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg font-light tracking-[0.25em] mb-6 uppercase text-gray-500">Elegance in Motion</h2>

          <h3 className="text-3xl font-light tracking-wide mb-10">
            Where Performance Meets Sophistication
          </h3>

          <div className="w-24 h-px bg-black/20 mx-auto mb-10"></div>

          <p className="text-gray-700 mb-6 leading-relaxed text-lg">
            At Action 24/7, we are more than just a clothing brand. We're a movement dedicated to the art, precision, and culture of billiards. Born with a passion for the game, our apparel is designed for players who live and breathe the sport, both on and off the table.
          </p>

          <p className="text-gray-700 mb-12 leading-relaxed text-lg">
            We blend style, comfort, and performance to create high-quality clothing that reflects the confidence and skill of every player. Join us in redefining billiards fashion.
          </p>

          <Link
            href="/about"
            className="inline-block px-10 py-4 border border-black bg-transparent text-black uppercase tracking-widest text-sm font-light transition-all duration-300 hover:bg-black hover:text-white"
          >
            Our Story
          </Link>
        </div>
      </section>

      {/* Featured Athletes Section - Refined styling */}
      <section className="py-36 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-lg font-light tracking-[0.25em] uppercase text-gray-500 mb-3">Excellence Personified</h2>
            <h3 className="text-3xl font-light tracking-wide">Trusted by Champions</h3>
            <div className="w-24 h-px bg-black/20 mx-auto mt-10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {featuredAthletes.map((athlete, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-36 h-36 mb-8 overflow-hidden rounded-full shadow-xl">
                  <img
                    src={athlete.image}
                    alt={athlete.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-light tracking-wider mb-3">{athlete.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{athlete.achievement}</p>
                <div className="w-12 h-px bg-black/20 mx-auto mb-6"></div>
                <p className="text-gray-700 italic leading-relaxed">"{athlete.quote}"</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-20">
            <Link
              href="/about"
              className="inline-block px-10 py-4 border border-black bg-transparent text-black uppercase tracking-widest text-sm font-light transition-all duration-300 hover:bg-black hover:text-white"
            >
              Meet Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Categories Section - Luxury styling */}
      <section className="py-36 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-lg font-light tracking-[0.25em] uppercase text-gray-500 mb-3">Curated Collections</h2>
            <h3 className="text-3xl font-light tracking-wide">Discover Our Range</h3>
            <div className="w-24 h-px bg-black/20 mx-auto mt-10"></div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-black font-light tracking-widest uppercase">
                Loading collections...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.link}
                  className="group block"
                >
                  <div className="relative overflow-hidden aspect-[3/4] shadow-xl">
                    <div
                      style={{
                        backgroundImage: `url(${onlineImages.categoryBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                    ></div>

                    {/* Luxury styled overlay with border accent */}
                    <div
                      className="absolute inset-0 transition-all duration-500 group-hover:backdrop-blur-sm"
                      style={{ backgroundColor: category.style.bgColor }}
                    >
                      <div className={`absolute inset-5 border ${category.style.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    </div>

                    {/* Content positioning for luxury feel */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
                      <div className={`transition-all duration-500 transform ${category.style.textColor} text-center`}>
                        <h3 className="text-xl font-light tracking-[0.15em] mb-4 uppercase">
                          {category.name}
                        </h3>
                        <div className="w-12 h-px bg-white/40 mx-auto mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                        <p className="text-sm max-w-xs mx-auto opacity-0 group-hover:opacity-90 transition-opacity duration-500 delay-150 font-extralight">
                          {category.description}
                        </p>
                        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                          <span className="inline-block text-xs tracking-widest uppercase border-b border-white/50 pb-1 font-light">
                            Explore Collection
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-20">
            <Link
              href="/collection"
              className="inline-block px-10 py-4 border border-black bg-black text-white uppercase tracking-widest text-sm font-light transition-all duration-300 hover:bg-white hover:text-black"
            >
              View All Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Values Section - Sophisticated minimal design */}
      <section className="py-36 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-lg font-light tracking-[0.25em] uppercase text-gray-500 mb-3">Our Philosophy</h2>
            <h3 className="text-3xl font-light tracking-wide">Crafted with Purpose</h3>
            <div className="w-24 h-px bg-black/20 mx-auto mt-10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            {brandValues.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-gray-700 mb-6 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-light tracking-wider mb-4">{value.title}</h3>
                <div className="w-10 h-px bg-black/20 mx-auto mb-6"></div>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Elegant styling */}
      <section className="py-36 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-lg font-light tracking-[0.25em] uppercase text-gray-500 mb-3">Client Testimonials</h2>
            <h3 className="text-3xl font-light tracking-wide">Voices of Approval</h3>
            <div className="w-24 h-px bg-black/20 mx-auto mt-10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-10 shadow-sm relative">
                {/* Quote mark in the background */}
                <div className="absolute top-6 left-6 text-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <div className="relative">
                  <p className="text-gray-700 mb-8 leading-relaxed italic font-light">{testimonial.text}</p>

                  <div className="flex flex-col">
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Sophisticated styling */}
      <section className="py-36 px-6 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg font-light tracking-[0.25em] uppercase text-gray-400 mb-3">Stay Connected</h2>
          <h3 className="text-3xl font-light tracking-wide mb-8">Join Our Community</h3>

          <div className="w-24 h-px bg-white/20 mx-auto mb-10"></div>

          <p className="text-gray-300 mb-12 leading-relaxed">
            Subscribe to receive updates on new collections, exclusive offers, and player highlights.
            Be the first to know about limited releases and special events.
          </p>

          <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow p-4 border border-gray-700 bg-gray-900 text-white focus:outline-none focus:border-white transition-colors duration-300"
              required
            />
            <button
              type="submit"
              className="px-10 py-4 bg-white text-black uppercase tracking-widest text-sm font-light transition-all duration-300 hover:bg-gray-200"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-6 text-xs text-gray-500">By subscribing, you agree to our Privacy Policy and consent to receive updates.</p>
        </div>
      </section>
    </div>
  );
}