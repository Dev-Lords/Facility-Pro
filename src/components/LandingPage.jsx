import React, { useState, useEffect } from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";

// Import the images properly
// Option 1: Import images (preferred method)
import basketballImage from '../assets/polish/basketball_court.jpg';
import swimmingImage from '../assets/polish/Swimming_pools.jpg';
import tennisImage from '../assets/polish/Tennis_Courts.jpg';
import soccerImage from '../assets/polish/Soccer_field.jpg';
import trackImage from '../assets/polish/Running_track.jpg';
import gymnasticsImage from '../assets/polish/Gymnastics.png';
import danceImage from '../assets/polish/Dance_studio.jpg';



// Update facilityData to use imported images
const facilityData = [
  { name: "Basketball Courts", image: basketballImage },
  { name: "Swimming Pools", image: swimmingImage },
  { name: "Tennis Courts", image: tennisImage },
  { name: "Soccer Fields", image: soccerImage },
  { name: "Running Tracks", image: trackImage },
  { name: "Gymnasiums", image: gymnasticsImage },
  { name: "Dance Studios", image: danceImage }
];

// Facility Slideshow Component
const FacilitySlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === facilityData.length - 1 ? 0 : prevSlide + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? facilityData.length - 1 : prevSlide - 1));
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="facility-slideshow">
      <article className="slideshow-container">
        <button className="arrow left-arrow" onClick={prevSlide}>
          &lt;
        </button>
        <figure className="slide">
          <img 
            src={facilityData[currentSlide].image} 
            alt={facilityData[currentSlide].name} 
            className="facility-image"
          />
          <figcaption className="facility-name">{facilityData[currentSlide].name}</figcaption>
        </figure>
        <button className="arrow right-arrow" onClick={nextSlide}>
          &gt;
        </button>
      </article>
      <nav className="dots-container">
        {facilityData.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </nav>
    </section>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  function goToLoginPage() {
    navigate("/LoginPage");
  }

  function goToSignupPage() {
    navigate("/SignupPage");
  }

  return (
    <main className="LandingPage-main">
      <section className="LandingPage-HeaderBar">
        <header className="LandingPage-HeaderLeft">
          <h2>Facility Pro</h2>
          <ul className="nav-links">
            <li><a href="https://dev-lords.github.io/Facility-Pro/#/">Documentation</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">FAQs</a></li>
          </ul>
        </header>
      </section>
      
      <section className="LandingPage-Middle">
        <section className="LandingPage-LeftSection">
          <h2 className="LandingPage-text">Facility Pro lets you schedule and manage your local facilities, Hassle Free.</h2>
          <p className="LandingPage-text">We want to see communities outside again. Plan sports days, without the headache.</p>
        </section>

        <section className="LandingPage-RightSection">
          <section className="LandingPage-SignLogContainer">
            <button id="SignIn" onClick={goToLoginPage}>Login</button>
            <p>Don't have an account?</p>
            <button id="SignUp" className="Button" onClick={goToSignupPage}>Create Account</button>
          </section>
        </section>
      </section>

      <section className="LandingPage-Sports">
        <h2>Community Sports Made Simple</h2>
        <p>Our platform helps you find and reserve the perfect venue for your sporting events, whether you're looking for tennis courts, swimming pools, basketball courts, or soccer fields. No more endless phone calls or in-person visits to check availability - everything you need is at your fingertips.</p>
        
        <p>Join the thousands of community organizers who have simplified their sports planning with Facility Pro. From school athletics to neighborhood tournaments, we're empowering communities to spend less time planning and more time playing.</p>
        
        <article className="LandingPage-SportFeature">
          <h3>Featured Facilities:</h3>
          <FacilitySlideshow />
      
        </article>

        <article className="LandingPage-Testimonial">
          <blockquote>
            "Facility Pro transformed how our local basketball league operates. We went from spending hours coordinating venues to booking everything in minutes. It's an absolute game-changer!"
          </blockquote>
          <p className="testimonial-author">- Mike J., Community Basketball League Organizer</p>
        </article>
      </section>

      <footer className="LandingPage-Footer">
        <p>&copy; 2025 Facility Pro. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default LandingPage;