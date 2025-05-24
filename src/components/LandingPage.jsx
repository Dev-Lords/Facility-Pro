import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, MapPin, Star, ArrowRight, Play, Award, Clock } from 'lucide-react';
import "./LandingPage.css";

import basketballImage from '../assets/polish/basketball_court.jpg';
import swimmingImage from '../assets/polish/Swimming_pools.jpg';
import tennisImage from '../assets/polish/Tennis_Courts.jpg';
import soccerImage from '../assets/polish/Soccer_field.jpg';
import trackImage from '../assets/polish/Running_track.jpg';
import gymnasticsImage from '../assets/polish/Gymnastics.png';
import danceImage from '../assets/polish/Dance_studio.jpg';

const facilityData = [
  { 
    name: "Basketball Courts", 
    image: basketballImage,
    caption: "Premium indoor courts with professional lighting",
    stats: "12 courts available"
  },
  { 
    name: "Swimming Pools", 
    image: swimmingImage,
    caption: "Olympic-sized pools for all skill levels",
    stats: "8 pools • Open year-round"
  },
  { 
    name: "Tennis Courts", 
    image: tennisImage,
    caption: "Hard and clay courts with night lighting",
    stats: "16 courts • All weather"
  },
  { 
    name: "Soccer Fields", 
    image: soccerImage,
    caption: "Full-size fields with quality turf",
    stats: "6 fields • FIFA standard"
  },
  { 
    name: "Running Tracks", 
    image: trackImage,
    caption: "400m tracks with timing systems",
    stats: "3 tracks • Professional grade"
  },
  { 
    name: "Gymnasiums", 
    image: gymnasticsImage,
    caption: "Multi-purpose halls for various sports",
    stats: "5 gyms • Full equipment"
  },
  { 
    name: "Dance Studios", 
    image: danceImage,
    caption: "Mirrored studios with premium sound systems",
    stats: "4 studios • All styles welcome"
  }
];

const testimonials = [
  {
    quote: "Facility Pro transformed how our local basketball league operates. Booking is now seamless and our players love the quality facilities.",
    author: "Mike Johnson",
    role: "Community Basketball League Organizer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
  },
  {
    quote: "The automated scheduling saved us hours every week. Our swimming club has never been more organized!",
    author: "Sarah Chen",
    role: "Aquatic Center Manager",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
  },
  {
    quote: "Amazing platform! Our tennis tournaments run smoothly thanks to the intuitive booking system.",
    author: "David Rodriguez",
    role: "Tennis Club Director",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
  }
];

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "AI-powered booking system that prevents conflicts and optimizes facility usage"
  },
  {
    icon: Users,
    title: "Community Management",
    description: "Connect players, organize teams, and build lasting sporting communities"
  },
  {
    icon: MapPin,
    title: "Location Discovery",
    description: "Find the perfect venue with detailed maps and facility information"
  },
  {
    icon: Award,
    title: "Quality Assurance",
    description: "All facilities are verified and rated by our community of users"
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Book facilities anytime with instant confirmation and flexible cancellation"
  },
  {
    icon: Star,
    title: "Premium Experience",
    description: "Professional-grade facilities with top-notch amenities and equipment"
  }
];

// Typing Animation Component
const TypingAnimation = () => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  
  const texts = [
    'Schedule your local facilities…',
    'Manage sports days with ease…',
    'Get your community active again!'
  ];

  useEffect(() => {
    const tick = () => {
      const fullText = texts[loopIndex];
      
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentIndex - 1));
        setCurrentIndex(prev => prev - 1);
      } else {
        setCurrentText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }

      if (!isDeleting && currentIndex === fullText.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentIndex === 0) {
        setIsDeleting(false);
        setLoopIndex(prev => (prev + 1) % texts.length);
      }
    };

    const timer = setTimeout(tick, isDeleting ? 50 : 100);
    return () => clearTimeout(timer);
  }, [currentText, currentIndex, isDeleting, loopIndex]);

  return currentText;
};

const FacilitySlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === facilityData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? facilityData.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="facility-slideshow">
      <article className="slideshow-container">
        <button className="arrow left-arrow" onClick={prevSlide}>‹</button>
        
        <figure 
          className="slide"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          <picture className="slide-image-container">
            <img 
              src={facilityData[currentSlide].image} 
              alt={facilityData[currentSlide].name} 
              className="facility-image"
            />
            <figcaption className="slide-overlay">
              <h3 className="facility-name">{facilityData[currentSlide].name}</h3>
              <p className="facility-caption">{facilityData[currentSlide].caption}</p>
              <small className="facility-stats">{facilityData[currentSlide].stats}</small>
            </figcaption>
          </picture>
        </figure>
        
        <button className="arrow right-arrow" onClick={nextSlide}>›</button>
      </article>

      <nav className="slideshow-controls">
        <ul className="dots-container">
          {facilityData.map((_, index) => (
            <li key={index}>
              <button
                className={`dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => goToSlide(index)}
              />
            </li>
          ))}
        </ul>
        
        <button 
          className="play-pause-btn"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <Play className={`play-icon ${isPlaying ? 'playing' : ''}`} size={16} />
        </button>
      </nav>
    </section>
  );
};

const TestimonialCarousel = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <article className="testimonial-carousel">
      <blockquote className="testimonial-card">
        <p className="testimonial-content">
          "{testimonials[currentTestimonial].quote}"
        </p>
        <footer className="testimonial-author">
          <img 
            src={testimonials[currentTestimonial].avatar} 
            alt={testimonials[currentTestimonial].author}
            className="author-avatar"
          />
          <address className="author-info">
            <strong className="author-name">{testimonials[currentTestimonial].author}</strong>
            <em className="author-role">{testimonials[currentTestimonial].role}</em>
          </address>
        </footer>
      </blockquote>
      
      <nav className="testimonial-indicators">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentTestimonial ? 'active' : ''}`}
            onClick={() => setCurrentTestimonial(index)}
          />
        ))}
      </nav>
    </article>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <header className="header-bar">
        <section className="header-content">
          <hgroup className="header-left">
            <h1 className="logo">Facility Pro</h1>
          </hgroup>
          <nav className="header-right">
            <ul className="nav-links">
              <li><a href="https://dev-lords.github.io/Facility-Pro/#/">Documentation</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </nav>
        </section>
      </header>

      <section className="hero-section">
        <article className="hero-left">
          <hgroup className="hero-content">
            <h2 className="hero-title">
              <TypingAnimation />
            </h2>
            <p className="hero-subtitle">
              We want to see communities outside again. Plan sports days, without the headache.
            </p>
            <button 
              className="cta-button"
              onClick={() => navigate("/SignupPage")}
            >
              Book a Facility Now
              <ArrowRight className="cta-icon" size={20} />
            </button>
          </hgroup>
        </article>

        <aside className="hero-right">
          <form className="auth-container">
            <h3>Get Started Today</h3>
            <button 
              type="button"
              className="login-btn"
              onClick={() => navigate("/LoginPage")}
            >
              Login
            </button>
            <p>Don't have an account?</p>
            <button 
              type="button"
              className="signup-btn"
              onClick={() => navigate("/SignupPage")}
            >
              Create Account
            </button>
          </form>
        </aside>
      </section>

      <section className="features-section">
        <article className="container">
          <header className="section-header">
            <h2>Why Choose Facility Pro?</h2>
            <p>Everything you need to manage community sports in one powerful platform</p>
          </header>
          
          <ul className="features-grid">
            {features.map((feature, index) => (
              <li
                key={index}
                className="feature-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <figure className="feature-icon">
                  <feature.icon size={32} />
                </figure>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="facilities-section">
        <article className="container">
          <header className="section-header">
            <h2>Premium Facilities</h2>
            <p>Discover world-class venues for every sport and activity</p>
          </header>
          
          <FacilitySlideshow />
        </article>
      </section>

      <section className="testimonials-section">
        <article className="container">
          <header className="section-header">
            <h2>What Our Community Says</h2>
            <p>Join thousands of satisfied organizers and athletes</p>
          </header>
          
          <TestimonialCarousel />
        </article>
      </section>

      <footer className="footer">
        <section className="container">
          <section className="footer-content">
            <article className="footer-section">
              <h3>About Facility Pro</h3>
              <p>Connecting communities through sport with seamless facility management and booking solutions.</p>
            </article>
            
            <article className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#">Find Facilities</a></li>
                <li><a href="#">Book Now</a></li>
                <li><a href="#">Community</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </article>
            
            <article className="footer-section">
              <h3>Contact</h3>
              <address>
                <p>Email: hello@facilitypro.com</p>
                <p>Phone: (555) 123-4567</p>
              </address>
              <nav className="social-links">
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="LinkedIn">💼</a>
              </nav>
            </article>
          </section>
          
          <footer className="footer-bottom">
            <p>&copy; 2025 Facility Pro. All rights reserved.</p>
          </footer>
        </section>
      </footer>
    </main>
  );
};

export default LandingPage;