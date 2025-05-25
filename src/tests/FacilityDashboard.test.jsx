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
jest.mock('react-icons/fa6', () => ({
  FaUserTie: () => <div data-testid="user-tie-icon">👤</div>
}));

jest.mock('react-icons/fa', () => ({
  FaFileAlt: () => <div data-testid="file-alt-icon">📄</div>,
  FaBars: ({ onClick }) => <div data-testid="bars-icon" onClick={onClick}>☰</div>
}));

// Mock CSS imports
jest.mock('../components/staff/FacilityStaffDashboard.css', () => ({}));

// Set up localStorage mock
const localStorageMock = (() => {
  let store = {
    authToken: 'mock-token',
    userType: 'staff'
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
  value: localStorageMock
});

// Import the component after setting up mocks
import FacilityStaffDashboard from '../components/staff/FacilityStaffDashboard.jsx';

describe('FacilityStaffDashboard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Reset localStorage to authenticated state
    localStorageMock.__setStore({
      authToken: 'mock-token',
      userType: 'staff'
    });
  });

  test('renders the welcome header when authenticated', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome, Facility Staff!')).toBeInTheDocument();
    expect(screen.getByText('Manage maintenance and bookings with ease')).toBeInTheDocument();
    expect(screen.getByTestId('user-tie-icon')).toBeInTheDocument();
  });

  test('renders all facility cards when authenticated', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Maintenance Reports')).toBeInTheDocument();
    expect(screen.getByText('Manage all facility maintenance requests and reports.')).toBeInTheDocument();
    expect(screen.getByText('View Reports')).toBeInTheDocument();

    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('View upcoming facility events to prepare in advance.')).toBeInTheDocument();
    expect(screen.getByText('View Events')).toBeInTheDocument();

    expect(screen.getAllByTestId('file-alt-icon')).toHaveLength(2);
  });

  test('renders footer information', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Facility Management System • Staff Portal • Version 1.0.4')).toBeInTheDocument();
  });

  test('redirects to home when not authenticated (no token)', () => {
    localStorageMock.__setStore({
      authToken: null,
      userType: 'staff'
    });

    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate-redirect')).toHaveTextContent('Redirected to: /');
    expect(screen.queryByText('Welcome, Facility Staff!')).not.toBeInTheDocument();
  });

  test('redirects to home when not authenticated (wrong user type)', () => {
    localStorageMock.__setStore({
      authToken: 'mock-token',
      userType: 'user'
    });

    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate-redirect')).toHaveTextContent('Redirected to: /');
    expect(screen.queryByText('Welcome, Facility Staff!')).not.toBeInTheDocument();
  });

  test('hamburger menu toggles correctly', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
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
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    // Open the menu
    fireEvent.click(screen.getByTestId('bars-icon'));
    
    // Click the sign out button
    fireEvent.click(screen.getByText('Sign Out'));
    
    await waitFor(() => {
      // Check localStorage was cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userType');
      
      // Check navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('navigates to home when Home button is clicked', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    // Open menu
    fireEvent.click(screen.getByTestId('bars-icon'));
    
    // Click home button
    fireEvent.click(screen.getByText('Home'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('navigates to staff issues when View Reports button is clicked', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('View Reports'));
    expect(mockNavigate).toHaveBeenCalledWith('/staff-issues');
  });

  test('navigates to upcoming events when View Events button is clicked', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('View Events'));
    expect(mockNavigate).toHaveBeenCalledWith('/upcoming-events');
  });

  test('buttons have correct accessibility attributes', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    const viewReportsButton = screen.getByLabelText('View maintenance reports');
    const viewEventsButton = screen.getByLabelText('View upcoming events');
    
    expect(viewReportsButton).toHaveAttribute('role', 'button');
    expect(viewEventsButton).toHaveAttribute('role', 'button');
  });

  test('component structure uses semantic HTML elements', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  test('localStorage is called with correct keys on component mount', () => {
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('userType');
  });

  test('component renders without console errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <MemoryRouter>
        <FacilityStaffDashboard />
      </MemoryRouter>
    );

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});