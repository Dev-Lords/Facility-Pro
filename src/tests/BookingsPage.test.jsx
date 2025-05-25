import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';
import MyBookingsPage from '../components/resident/bookingsPage.jsx';
import { fetchUserBookings } from '../../backend/services/bookingService.js';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

jest.mock('../../backend/services/bookingService.js', () => ({
  fetchUserBookings: jest.fn()
}));

jest.mock('react-icons/fa', () => ({
  FaBars: () => <div data-testid="hamburger-icon">☰</div>
}));

// Mock CSS import
jest.mock('../staff/IssuesPage.css', () => ({}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('MyBookingsPage Component', () => {
  const mockNavigate = jest.fn();
  const mockBookings = [
    {
      bookingID: 1,
      facilityID: 'Basketball Court A',
      date: '2025-05-26',
      bookedSlots: [9, 10, 11],
      status: 'pending'
    },
    {
      bookingID: 2,
      facilityID: 'Tennis Court B',
      date: '2025-05-27',
      bookedSlots: [14, 15],
      status: 'approved'
    },
    {
      bookingID: 3,
      facilityID: 'Swimming Pool',
      date: '2025-05-28',
      bookedSlots: [16],
      status: 'declined'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    mockLocalStorage.getItem.mockReturnValue('user123');
    fetchUserBookings.mockResolvedValue(mockBookings);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the main components correctly', async () => {
    render(<MyBookingsPage />);
    
    expect(screen.getByText('My Bookings')).toBeInTheDocument();
    expect(screen.getByText('View all your current and past facility bookings')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Filter by status' })).toBeInTheDocument();
    
    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByText('Basketball Court A')).toBeInTheDocument();
    });
  });

  test('displays loading state while fetching bookings', () => {
    fetchUserBookings.mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(<MyBookingsPage />);
    
    expect(screen.getByText('Loading bookings...')).toBeInTheDocument();
  });

  test('fetches and displays bookings on mount', async () => {
    render(<MyBookingsPage />);
    
    await waitFor(() => {
      expect(fetchUserBookings).toHaveBeenCalledWith('user123');
      expect(screen.getByText('Basketball Court A')).toBeInTheDocument();
      expect(screen.getByText('Tennis Court B')).toBeInTheDocument();
      expect(screen.getByText('Swimming Pool')).toBeInTheDocument();
    });
  });

  test('renders table headers correctly', async () => {
    render(<MyBookingsPage />);
    
    expect(screen.getByText('Facility')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Slots')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('displays booking information correctly', async () => {
    render(<MyBookingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Basketball Court A')).toBeInTheDocument();
      expect(screen.getByText('2025-05-26')).toBeInTheDocument();
      expect(screen.getByText('Tennis Court B')).toBeInTheDocument();
      expect(screen.getByText('2025-05-27')).toBeInTheDocument();
    });
  });

  
  
 
  

  test('status filter works correctly', async () => {
    render(<MyBookingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Basketball Court A')).toBeInTheDocument();
      expect(screen.getByText('Tennis Court B')).toBeInTheDocument();
      expect(screen.getByText('Swimming Pool')).toBeInTheDocument();
    });
    
    // Filter by pending
    const statusFilter = screen.getByRole('combobox', { name: 'Filter by status' });
    fireEvent.change(statusFilter, { target: { value: 'pending' } });
    
    expect(screen.getByText('Basketball Court A')).toBeInTheDocument();
    expect(screen.queryByText('Tennis Court B')).not.toBeInTheDocument();
    expect(screen.queryByText('Swimming Pool')).not.toBeInTheDocument();
    
    // Filter by approved
    fireEvent.change(statusFilter, { target: { value: 'approved' } });
    
    expect(screen.queryByText('Basketball Court A')).not.toBeInTheDocument();
    expect(screen.getByText('Tennis Court B')).toBeInTheDocument();
    expect(screen.queryByText('Swimming Pool')).not.toBeInTheDocument();
    
    // Filter by declined
    fireEvent.change(statusFilter, { target: { value: 'declined' } });
    
    expect(screen.queryByText('Basketball Court A')).not.toBeInTheDocument();
    expect(screen.queryByText('Tennis Court B')).not.toBeInTheDocument();
    expect(screen.getByText('Swimming Pool')).toBeInTheDocument();
    
    // Back to all
    fireEvent.change(statusFilter, { target: { value: 'all' } });
    
    expect(screen.getByText('Basketball Court A')).toBeInTheDocument();
    expect(screen.getByText('Tennis Court B')).toBeInTheDocument();
    expect(screen.getByText('Swimming Pool')).toBeInTheDocument();
  });

  test('pagination controls work correctly', async () => {
    render(<MyBookingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Basketball Court A')).toBeInTheDocument();
    });
    
    // Check pagination info
    expect(screen.getByText('1–3 of 3')).toBeInTheDocument();
    
    // Previous button should be disabled on first page
    const prevButton = screen.getByText('<');
    expect(prevButton).toBeDisabled();
    
    // Next button should be disabled when all items fit on one page
    const nextButton = screen.getByText('>');
    expect(nextButton).toBeDisabled();
  });

  test('rows per page selector works correctly', async () => {
    render(<MyBookingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Basketball Court A')).toBeInTheDocument();
    });
    
    const rowsSelect = screen.getByDisplayValue('50');
    expect(rowsSelect).toBeInTheDocument();
    
    fireEvent.change(rowsSelect, { target: { value: '100' } });
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  

 
  test('pagination works with multiple pages', async () => {
    // Create enough bookings to trigger pagination
    const manyBookings = Array.from({ length: 60 }, (_, i) => ({
      bookingID: i + 1,
      facilityID: `Facility ${i + 1}`,
      date: '2025-05-26',
      bookedSlots: [9],
      status: 'approved'
    }));
    
    fetchUserBookings.mockResolvedValue(manyBookings);
    
    render(<MyBookingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('1–50 of 60')).toBeInTheDocument();
    });
    
    // Next button should be enabled
    const nextButton = screen.getByText('>');
    expect(nextButton).not.toBeDisabled();
    
    // Click next page
    fireEvent.click(nextButton);
    
    expect(screen.getByText('51–60 of 60')).toBeInTheDocument();
    
    // Previous button should now be enabled
    const prevButton = screen.getByText('<');
    expect(prevButton).not.toBeDisabled();
    
    // Next button should be disabled on last page
    expect(nextButton).toBeDisabled();
  });

  test('component renders without console errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<MyBookingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('My Bookings')).toBeInTheDocument();
    });
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});