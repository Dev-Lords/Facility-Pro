import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../components/admin/AdminDashboard';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import React from 'react';

// Mock the useNavigate hook
const mockNavigate = jest.fn();

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaUser: () => <div data-testid="user-icon">👤</div>,
  FaUsers: () => <div data-testid="users-icon">👥</div>,
  FaFileAlt: () => <div data-testid="file-icon">📄</div>,
  FaRegCalendarPlus: () => <div data-testid="calendar-icon">📅</div>,
  FaClipboardCheck: () => <div data-testid="clipboard-icon">📋</div>,
  FaBars: ({ onClick }) => <div data-testid="bars-icon" onClick={onClick}>☰</div>
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {
    authToken: 'valid-token',
    userType: 'admin'
  };

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    __setStore: (newStore) => {
      store = { ...newStore };
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: ({ to }) => <div data-testid="navigate-redirect">Redirecting to {to}</div>,
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    localStorageMock.__setStore({
      authToken: 'valid-token',
      userType: 'admin'
    });
    mockNavigate.mockClear();
  });

  test('redirects unauthenticated user to the homepage', () => {
    localStorageMock.__setStore({
      authToken: null,
      userType: null
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate-redirect')).toHaveTextContent('Redirecting to /');
  });

  test('renders the Admin Dashboard correctly for authenticated user', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
  
    // Check header
    expect(screen.getByText('Welcome, Admin!')).toBeInTheDocument();
    expect(screen.getByText('Manage your system with ease and efficiency. View all your data at a glance.')).toBeInTheDocument();
    
    // Check card headings
    expect(screen.getByRole('heading', { name: /manage users/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /generate reports/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bookings/i })).toBeInTheDocument();
  
    // Check buttons
    expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate reports/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create events/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review bookings/i })).toBeInTheDocument();

    // Check icons
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clipboard-icon')).toBeInTheDocument();
  });

  test('hamburger menu toggles correctly', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
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
        <AdminDashboard />
      </MemoryRouter>
    );

    // Open menu
    fireEvent.click(screen.getByTestId('bars-icon'));
    
    // Click sign out
    fireEvent.click(screen.getByText('Sign Out'));
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userType');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('navigates to home when Home button is clicked', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('bars-icon'));
    fireEvent.click(screen.getByText('Home'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('navigates to Generate Reports page when "Generate Reports" button is clicked', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
  
    fireEvent.click(screen.getByRole('button', { name: /generate reports/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  test('navigates to Manage Users page when "Manage Users" button is clicked', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
  
    fireEvent.click(screen.getByRole('button', { name: /manage users/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/manage-users');
  });
  
  test('navigates to Create Events page when "Create events" button is clicked', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
  
    fireEvent.click(screen.getByRole('button', { name: /create events/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/events');
  });
  
  test('navigates to Review Bookings page when "Review bookings" button is clicked', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
  
    fireEvent.click(screen.getByRole('button', { name: /review bookings/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/bookings');
  });

  test('component uses semantic HTML elements', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

 

  test('component renders without console errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});