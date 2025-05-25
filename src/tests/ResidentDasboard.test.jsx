import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock useNavigate before importing the component
const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: ({ to }) => <div data-testid="navigate-redirect">{`Redirected to: ${to}`}</div>
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaBars: ({ onClick }) => <div data-testid="bars-icon" onClick={onClick}>☰</div>,
  FaHome: () => <div data-testid="home-icon">🏠</div>,
  FaCalendar: () => <div data-testid="calendar-icon">📅</div>,
  FaExclamationTriangle: () => <div data-testid="triangle-icon">⚠️</div>,
  FaCalendarCheck: () => <div data-testid="calendar-check-icon">📋</div>
}));

// Mock CSS imports
jest.mock('../components/resident/ResidentDashboard.css', () => ({}));

// Set up localStorage mock
const mockLocalStorage = (() => {
  let store = {
    authToken: 'sample_token',
    userType: 'resident'
  };

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    // Helper to reset store for testing
    __setStore: (newStore) => {
      store = { ...newStore };
    }
  };
})();

// Replace the global localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Import the component after setting up mocks
import ResidentPortal from '../components/resident/ResidentDashboard.jsx';

describe('ResidentPortal Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    
    // Reset localStorage to authenticated state
    mockLocalStorage.__setStore({
      authToken: 'sample_token',
      userType: 'resident'
    });
  });

  test('renders the welcome header when authenticated', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome Resident')).toBeInTheDocument();
    expect(screen.getByText('Access community services with ease')).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

 

  test('renders footer information', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    expect(screen.getByText('Resident Portal • Your Community • Copyright © 2025')).toBeInTheDocument();
  });

  test('redirects to home when not authenticated (no token)', () => {
    mockLocalStorage.__setStore({
      authToken: null,
      userType: 'resident'
    });

    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate-redirect')).toHaveTextContent('Redirected to: /');
    expect(screen.queryByText('Welcome Resident')).not.toBeInTheDocument();
  });

  test('redirects to home when not authenticated (wrong user type)', () => {
    mockLocalStorage.__setStore({
      authToken: 'sample_token',
      userType: 'staff'
    });

    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate-redirect')).toHaveTextContent('Redirected to: /');
    expect(screen.queryByText('Welcome Resident')).not.toBeInTheDocument();
  });

  test('hamburger menu toggles correctly', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    const hamburgerIcon = screen.getByTestId('bars-icon');
    
    // Menu should not be visible initially
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    
    // Click to open menu
    fireEvent.click(hamburgerIcon);
    
    // Menu should now be visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    
    // Click again to close menu
    fireEvent.click(hamburgerIcon);
    
    // Menu should be hidden again
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  test('sign out clears localStorage and navigates to home', async () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    // Open the menu
    fireEvent.click(screen.getByTestId('bars-icon'));
    
    // Click the sign out button
    fireEvent.click(screen.getByText('Sign Out'));
    
    await waitFor(() => {
      // Check localStorage was cleared
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userType');
      
      // Check navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('navigates to home when Home button is clicked', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    // Open menu
    fireEvent.click(screen.getByTestId('bars-icon'));
    
    // Click home button
    fireEvent.click(screen.getByText('Home'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('navigates to facility selection when Book Now is clicked', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Book Now'));
    expect(mockNavigate).toHaveBeenCalledWith('/Facility-selection');
  });

  test('navigates to view bookings when View Bookings is clicked', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('View Bookings'));
    expect(mockNavigate).toHaveBeenCalledWith('/view-bookings');
  });

  test('navigates to issue menu when Report Problem is clicked', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Report Problem'));
    expect(mockNavigate).toHaveBeenCalledWith('/issue-menu');
  });

  test('component structure uses semantic HTML elements', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  test('localStorage is called with correct keys on component mount', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('userType');
  });

  test('all buttons are clickable and have correct text', () => {
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    const bookNowButton = screen.getByText('Book Now');
    const viewBookingsButton = screen.getByText('View Bookings');
    const reportProblemButton = screen.getByText('Report Problem');

    expect(bookNowButton).toBeInTheDocument();
    expect(viewBookingsButton).toBeInTheDocument();
    expect(reportProblemButton).toBeInTheDocument();

    fireEvent.click(bookNowButton);
    fireEvent.click(viewBookingsButton);
    fireEvent.click(reportProblemButton);
  });

  test('component renders without console errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <MemoryRouter>
        <ResidentPortal />
      </MemoryRouter>
    );

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});