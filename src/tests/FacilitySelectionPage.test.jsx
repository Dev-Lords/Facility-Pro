import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FacilitiesPage from '../components/resident/FacilitySelection.jsx';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => jest.fn(),
  };
});

const setup = () => {
  return render(
    <MemoryRouter initialEntries={['/facilities']}>
      <Routes>
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/" element={<div>Redirected to Home</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('FacilitiesPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });



  

  test('clicking "Book Now" sets facility in sessionStorage and navigates', () => {
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('userType', 'resident');
    setup();

    const poolButton = screen.getAllByRole('button', { name: /book now/i })[0];
    fireEvent.click(poolButton);

    expect(sessionStorage.getItem('facility')).toBe('pool');
  });

  test('sets correct facility in sessionStorage for each card', () => {
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('userType', 'resident');
    setup();

    const buttons = screen.getAllByRole('button', { name: /book now/i });

    fireEvent.click(buttons[1]); // Gym
    expect(sessionStorage.getItem('facility')).toBe('gym');

    fireEvent.click(buttons[2]); // Soccer
    expect(sessionStorage.getItem('facility')).toBe('soccer');

    fireEvent.click(buttons[3]); // Basketball
    expect(sessionStorage.getItem('facility')).toBe('basketball');
  });
});
