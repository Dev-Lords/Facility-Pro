import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboard from '../components/admin/AdminDashboard'; // Adjust the import path if necessary
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import React from 'react';

// Mock the useNavigate hook
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: ({ to }) => <div>Redirecting to {to}</div>,
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    localStorage.setItem('authToken', 'valid-token');
    localStorage.setItem('userType', 'admin');
    mockNavigate.mockClear(); // Clear mock calls before each test
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('redirects unauthenticated user to the homepage', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');

    render(
      <Router>
        <AdminDashboard />
      </Router>
    );

    expect(screen.getByText('Redirecting to /')).toBeInTheDocument();
  });

  test('renders the Admin Dashboard correctly for authenticated user', () => {
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );
  
    // Check header
    expect(screen.getByText('Welcome, Admin!')).toBeInTheDocument();
    
    // Check card headings (h2 elements)
    expect(screen.getByRole('heading', { name: /manage users/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /generate reports/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bookings/i })).toBeInTheDocument();
  
    // Check buttons
    expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate reports/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create events/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review bookings/i })).toBeInTheDocument();
  });

  

  test('navigates to Generate Reports page when "Generate Reports" button is clicked', () => {
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );
  
    // More specific selector to get the button
    const reportsButton = screen.getByRole('button', { name: /generate reports/i });
    fireEvent.click(reportsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });


  test('navigates to Manage Users page when "Manage Users" button is clicked', () => {
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );
  
    const manageUsersButton = screen.getByRole('button', { name: /manage users/i });
    fireEvent.click(manageUsersButton);
    expect(mockNavigate).toHaveBeenCalledWith('/manage-users');
  });
  
  test('navigates to Create Events page when "Create events" button is clicked', () => {
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );
  
    const createEventsButton = screen.getByRole('button', { name: /create events/i });
    fireEvent.click(createEventsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/events');
  });
  
  test('navigates to Review Bookings page when "Review bookings" button is clicked', () => {
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );
  
    const reviewBookingsButton = screen.getByRole('button', { name: /review bookings/i });
    fireEvent.click(reviewBookingsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/bookings');
  });
 


});