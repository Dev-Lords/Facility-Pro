import React from 'react';
import './FacilitySelection.css';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaUser, FaSwimmer, FaDumbbell, FaFutbol, FaBasketballBall } from 'react-icons/fa';

export default function FacilitiesPage() {
  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  const isAuthenticated = token && userType === 'resident';
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="container">
      <header className="header">
        <section className="header-content">
          <section className="resident-icon"><FaUser /></section>
          <section>
            <h1>Choose a Facility to Book</h1>
            <p>Select one of the available facilities below</p>
          </section>
        </section>
      </header>

      <section className="card-grid">

        <article className="card card-pool">
          <section className="card-icon"><FaSwimmer /></section>
          <h2>Swimming Pool</h2>
          <p>Cool off and relax in our clean, well-maintained swimming pool.</p>
          <button className="btn btn-facilities" onClick={() => {sessionStorage.setItem("facility", "pool");handleNavigate("/calendar")}
          }>Book Now</button>
        </article>

        <article className="card card-gym">
          <section className="card-icon"><FaDumbbell /></section>
          <h2>Gym</h2>
          <p>Stay fit and healthy with our state-of-the-art gym equipment.</p>
          <button className="btn btn-facilities" onClick={() => {sessionStorage.setItem("facility", "gym");handleNavigate("/calendar")}
          }>Book Now</button>
        </article>

        <article className="card card-soccer">
          <section className="card-icon"><FaFutbol /></section>
          <h2>Soccer Field</h2>
          <p>Enjoy a friendly game or practice your skills on the soccer field.</p>
          <button className="btn btn-facilities" onClick={() =>{sessionStorage.setItem("facility", "soccer"); handleNavigate("/calendar")}}>Book Now</button>
        </article>

        <article className="card card-basketball">
          <section className="card-icon"><FaBasketballBall /></section>
          <h2>Basketball Court</h2>
          <p>Shoot some hoops or challenge friends to a game of basketball.</p>
          <button className="btn btn-facilities" onClick={() => {sessionStorage.setItem("facility", "basketball");handleNavigate("/calendar")}}>Book Now</button>
        </article>

      </section>

      <footer className="footer">
        <p>Resident Booking System • Your Community • Copyright © {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
