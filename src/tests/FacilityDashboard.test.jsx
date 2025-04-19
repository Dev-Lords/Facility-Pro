import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Import the component after setting up mocks
import FacilityStaffDashboard from '../components/staff/FacilityStaffDashboard.jsx';

// Mock useNavigate
const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  // Don't render anything for Navigate, just mark that navigation happened
  Navigate: jest.fn(({ to }) => {
    console.log(`Navigation redirected to: ${to}`);
    return null;
  }),
}));

// Set up localStorage mock correctly
const localStorageMock = (function() {
  let store = {
    authToken: 'mock-token',
    userType: 'staff'
  };
  
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

// Replace the global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock CSS imports
jest.mock('../components/staff/FacilityStaffDashboard.css', () => ({}), { virtual: true });

describe('FacilityStaffDashboard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders the welcome header when authenticated', () => {
    // Make sure Navigate component from react-router-dom doesn't redirect
    const { Navigate } = require('react-router-dom');
    Navigate.mockImplementation(({ children }) => children || null);
    
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );
    
    // Debug to see what's being rendered
    console.log(screen.debug());
    
    expect(screen.getByText('🏢 Welcome, Facility Staff!')).toBeInTheDocument();
    expect(screen.getByText('Manage maintenance and bookings with ease')).toBeInTheDocument();
  });

  test('renders all three facility cards when authenticated', () => {
    // Make sure Navigate component doesn't redirect
    const { Navigate } = require('react-router-dom');
    Navigate.mockImplementation(({ children }) => children || null);
    
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );
    
    expect(screen.getByText('🔧 Maintenance Reports')).toBeInTheDocument();
    expect(screen.getByText('📋 Facility Status')).toBeInTheDocument();
    expect(screen.getByText('📅 Booking Calendar')).toBeInTheDocument();
  });

  test('redirects to home when not authenticated', () => {
    // First clear localStorage mock
    localStorageMock.getItem.mockImplementation(() => null);
    
    // Let Navigate redirect as normal
    const { Navigate } = require('react-router-dom');
    Navigate.mockImplementation(({ to }) => <div>{`Redirected to: ${to}`}</div>);
    
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Redirected to: /')).toBeInTheDocument();
  });
});