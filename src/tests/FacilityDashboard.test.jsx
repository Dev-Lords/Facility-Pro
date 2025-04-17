import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacilityStaffDashboard from '../components/staff/FacilityStaffDashboard.jsx';

// Mock the react-router-dom's useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


describe('FacilityStaffDashboard Component', () => {
  beforeEach(() => {
    // Clear mock calls between tests
    mockNavigate.mockClear();
  });

  test('renders the welcome header', () => {
    render(<FacilityStaffDashboard />);
    
    expect(screen.getByText('🏢 Welcome, Facility Staff!')).toBeInTheDocument();
    expect(screen.getByText('Manage maintenance and bookings with ease')).toBeInTheDocument();
  });

  test('renders all three facility cards', () => {
    render(<FacilityStaffDashboard />);
    
    expect(screen.getByText('🔧 Maintenance Reports')).toBeInTheDocument();
    expect(screen.getByText('📋 Facility Status')).toBeInTheDocument();
    expect(screen.getByText('📅 Booking Calendar')).toBeInTheDocument();
  });

  test('clicking on "View Reports" button navigates to staff-issues page', () => {
    render(<FacilityStaffDashboard />);
    
    const viewReportsButton = screen.getByText('View Reports');
    fireEvent.click(viewReportsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/staff-issues');
  });

  test('renders facility status update button', () => {
    render(<FacilityStaffDashboard />);
    
    const updateStatusButton = screen.getByText('Update Status');
    expect(updateStatusButton).toHaveAttribute('href', 'availability.html');
  });

  test('renders view bookings button', () => {
    render(<FacilityStaffDashboard />);
    
    const viewBookingsButton = screen.getByText('View Bookings');
    expect(viewBookingsButton).toHaveAttribute('href', 'bookings.html');
  });

  test('renders footer with version information', () => {
    render(<FacilityStaffDashboard />);
    
    expect(screen.getByText('Facility Management System • Staff Portal • Version 1.0.0')).toBeInTheDocument();
  });

  test('handleNavigate function works correctly', () => {
    render(<FacilityStaffDashboard />);
    
    // Test the navigation function
    const viewReportsButton = screen.getByText('View Reports');
    fireEvent.click(viewReportsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/staff-issues');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});