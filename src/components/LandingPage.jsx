import React from "react";
import "./LandingPage.css";
import FacilitySlideshow from "./visuals";
import { useNavigate } from "react-router-dom";
import basketball from "../assets/polish/basketball_court.jpg";
import swim from "../assets/polish/Swimming_pools.jpg";
import tennis from "../assets/polish/Tennis_Courts.jpg";
import soccer from "../assets/polish/Soccer_field.jpg";
import track from"../assets/polish/Running_track.jpg";
import gym from "../assets/polish/Gymnastics.png";
import dance from "../assets/polish/Dance_studio.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  function goToLoginPage() {
    navigate("/LoginPage");
  }

  function goToSignupPage() {
    navigate("/SignupPage");
  }
 
  /*Featured facilities data*/
  const facilityData = [
    {name: "Basketball Courts",image: basketball },
    {name: "Swimming Pools",image: swim},
    {name: "Tennis Courts",image: tennis},
    {name: "Soccer Fields",image: soccer},
    {name: "Track",image: track},
    {name: "Gymnastics",image: gym},
    {name: "Dance Studios",image: dance}
  ];


  return(
    <main className="LandingPage-main">

      <section className="LandingPage-HeaderBar">
        <header className="LandingPage-HeaderLeft">
          <h2>Facility Pro</h2>
        </header>
        <header className="LandingPage-HeaderRight">
          <ul className="nav-links">
            <li><a className="nav-links a" href = "https://dev-lords.github.io/Facility-Pro/#/">Documentation</a></li>
            <li><a className="nav-links a" href = "">Terms</a></li>
            <li><a className= "nav-links a" href = "">Privacy</a></li>
            <li><a className= "nav-links a" href = "">FAQs</a></li>
          </ul>
        </header>
        
      </section>
      
      <section className="LandingPage-Middle">
      <section className="LandingPage-LeftSection">
        <h2 className="LandingPage-text">Facility Pro let's you schedule and manage your local facilities, Hassle Free.</h2>
        <p className="LandingPage-text">We want to see communities outside again. Plan sports days, without the headache.</p>
      </section>

      <section className="LandingPage-RightSection">
        <section className="LandingPage-SignLogContainer">
        <button id="SignIn Button"  onClick={goToLoginPage} >Login</button>
        <p>Don't have an account?</p>
        <button id="SignUp Button" onClick={goToSignupPage} >Create Account</button>
        </section>
      </section>
      </section>

      <section className="LandingPage-Sports">
        <h2>Community Sports Made Simple</h2>
        <p>Our platform helps you find and reserve the perfect venue for your sporting events, whether you're looking for tennis courts, swimming pools, basketball courts, or soccer fields. No more endless phone calls or in-person visits to check availability - everything you need is at your fingertips.</p>
        
        <p>Join the thousands of community organizers who have simplified their sports planning with Facility Pro. From school athletics to neighborhood tournaments, we're empowering communities to spend less time planning and more time playing.</p>
        
        <article className="LandingPage-SportFeature">
          <h3>Featured Facilities:</h3>
         <FacilitySlideshow facilities={facilityData} />
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
}

export default LandingPage;