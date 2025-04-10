import React from "react";
import "./LandingPage.css";

const LandingPage = () => {

    return(
    <main className="LandingPage-main">

      <section className="LandingPage-HeaderBar">
        <header className="LandingPage-HeaderLeft"><h2>Facility Pro</h2></header>
        <header className="LandingPage-HeaderRight">
        <ul className="nav-links">
          <li><a className="nav-links a" href = "">Documentation</a></li>
          <li><a className="nav-links a" href = "">Terms</a></li>
          <li><a className= "nav-links a" href = "">Privacy</a></li>
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
        <button id="SignIn Button">Sign In with Google</button>
        <p>Don't have an account?</p>
        <button id="SignUp Button">Sign Up with Google</button>
        </section>
      </section>
      </section>
    </main>

    );
}

export default LandingPage;