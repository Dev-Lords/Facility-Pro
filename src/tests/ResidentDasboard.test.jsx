import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResidentPortal from '../components/resident/ResidentDashboard.jsx';  // Adjust the import path if necessary
import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock the window localStorage
global.localStorage = mockLocalStorage;

describe('ResidentPortal Component', () => {

  afterEach(() => {
    // Clear localStorage after each test
    localStorage.clear();
  });

  



  test('navigates to the correct path when the "Book Now" button is clicked', () => {
    // Set localStorage to simulate an authenticated user
    localStorage.setItem('authToken', 'sample_token');
    localStorage.setItem('userType', 'resident');

    render(
      <Router>
        <ResidentPortal />
      </Router>
    );

    // Simulate a button click
    fireEvent.click(screen.getByRole('button', { name: /Book Now/i }));

    // Check if the navigate function was called with the correct path
    expect(window.location.pathname).toBe('/Facility-selection');
  });

  test('navigates to the correct path when the "See Calendar" button is clicked', () => {
    // Set localStorage to simulate an authenticated user
    localStorage.setItem('authToken', 'sample_token');
    localStorage.setItem('userType', 'resident');

    render(
      <Router>
        <ResidentPortal />
      </Router>
    );

    // Simulate a button click
    fireEvent.click(screen.getByRole('button', { name: /See Calendar/i }));

    // Check if the navigate function was called with the correct path
    expect(window.location.pathname).toBe('/calendar');
  });

  test('navigates to the correct path when the "Report Problem" button is clicked', () => {
    // Set localStorage to simulate an authenticated user
    localStorage.setItem('authToken', 'sample_token');
    localStorage.setItem('userType', 'resident');

    render(
      <Router>
        <ResidentPortal />
      </Router>
    );

    // Simulate a button click
    fireEvent.click(screen.getByRole('button', { name: /Report Problem/i }));

    // Check if the navigate function was called with the correct path
    expect(window.location.pathname).toBe('/issue-menu');
  });
});
