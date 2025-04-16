import { FaUser, FaSwimmer, FaDumbbell, FaFutbol, FaBasketballBall } from 'react-icons/fa';
import './FacilitySelection.css';

const facilities = [
  {
    title: 'Swimming Pool',
    description: 'Cool off and relax in our clean, well-maintained swimming pool.',
    icon: <FaSwimmer />,
    class: 'pool'
  },
  {
    title: 'Gym',
    description: 'Stay fit and healthy with our state-of-the-art gym equipment.',
    icon: <FaDumbbell />,
    class: 'gym'
  },
  {
    title: 'Soccer Field',
    description: 'Enjoy a friendly game or practice your skills on the soccer field.',
    icon: <FaFutbol />,
    class: 'soccer'
  },
  {
    title: 'Basketball Court',
    description: 'Shoot some hoops or challenge friends to a game of basketball.',
    icon: <FaBasketballBall />,
    class: 'basketball'
  }
];

export default function FacilitiesPage() {
  return (
    <main className="facilities-container">
  <header className="facilities-header">
    <section className="header-content">
      <aside className="resident-icon">
        <FaUser />
      </aside>
      <article>
        <h1>Choose a Facility to Book</h1>
        <p>Select one of the available facilities below</p>
      </article>
    </section>
  </header>

  <section className="facilities-card-grid">
    {facilities.map((facility, index) => (
      <article className={`facilities-card ${facility.class}`} key={index}>
        <section className="facilities-card-icon">{facility.icon}</section>
        <h2>{facility.title}</h2>
        <p>{facility.description}</p>
        <a href="#" className="btn btn-facilities">Book Now</a>
      </article>
    ))}
  </section>

  <footer className="facilities-footer">
    &copy; {new Date().getFullYear()} Resident Booking System. All rights reserved.
  </footer>
</main>
  );
}
