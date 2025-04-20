import React, { useState } from "react";
import "./LandingPage.css";

const FacilitySlideshow = ({ facilities }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? facilities.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === facilities.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (!facilities || facilities.length === 0) {
    return null;
  }

  return (
    <section className="facility-slideshow">
      <figure className="slideshow-container">
        <button
          className="arrow left-arrow"
          onClick={goToPrevious}
          aria-label="Go to previous slide"
        >
          &lt;
        </button>
        <figure className="slide">
          <img
            src={facilities[currentIndex].image}
            alt={facilities[currentIndex].name}
            className="facility-image"
          />
          <figcaption className="facility-name">{facilities[currentIndex].name}</figcaption>
        </figure>
        <button
          className="arrow right-arrow"
          onClick={goToNext}
          aria-label="Go to next slide"
        >
          &gt;
        </button>
      </figure>
      <nav className="dots-container">
        {facilities.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`View ${facilities[index].name}`}
          />
        ))}
      </nav>
    </section>
  );
};

export default FacilitySlideshow;
