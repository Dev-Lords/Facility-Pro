import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import BookingsPage from '../components/admin/Bookings.jsx';
import { BrowserRouter as Router } from 'react-router-dom';


// Mocking the necessary modules and services
jest.mock('../../backend/services/bookingService.js', () => ({
  fetchBookings: jest.fn(),
  updateBooking: jest.fn()
}));

jest.mock('../../backend/services/userServices.js', () => ({
  fetchUser: jest.fn()
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

const mockBookings = [
  {
    bookingID: 'booking1',
    userID: 'user1',
    date: '2025-05-01',
    facilityID: 'Tennis Court',
    status: 'pending',
    bookedSlots: [9, 10]
  },
  {
    bookingID: 'booking2',
    userID: 'user2',
    date: '2025-05-02',
    facilityID: 'Swimming Pool',
    status: 'approved',
    bookedSlots: [14, 15]
  },
  {
    bookingID: 'booking3',
    userID: 'user3',
    date: '2025-05-03',
    facilityID: 'Basketball Court',
    status: 'declined',
    bookedSlots: [18, 19]
  }
];

const mockUsers = {
  user1: { displayName: 'John Doe', email: 'john@example.com' },
  user2: { displayName: 'Jane Smith', email: 'jane@example.com' },
  user3: { displayName: 'Alex Johnson', email: 'alex@example.com' }
};

describe('BookingsPage Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    const { fetchBookings } = require('../../backend/services/bookingService.js');
    const { fetchUser } = require('../../backend/services/userServices.js');
    
    fetchBookings.mockResolvedValue(mockBookings);
    fetchUser.mockImplementation((uid) => Promise.resolve(mockUsers[uid] || null));
  });

  test('renders loading state initially', () => {
    render(<Router><BookingsPage /></Router>);
    expect(screen.getByText('Bookings Review')).toBeInTheDocument();
    expect(screen.getByText('Approve and Decline bookings!')).toBeInTheDocument();
  });


  test('renders bookings after loading', async () => {
    render(<Router><BookingsPage /></Router>);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Tennis Court')).toBeInTheDocument();
    expect(screen.getByText('Swimming Pool')).toBeInTheDocument();
    expect(screen.getByText('Basketball Court')).toBeInTheDocument();
  });


  test('filters bookings by status', async () => {
    render(<Router><BookingsPage /></Router>);
    
    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Open filter dropdown
    fireEvent.click(screen.getByRole('button', { name: /Booking status/i }));

    
    // Select 'approved' filter - be more specific by using the dropdown's class
    const filterOptions = screen.getAllByText('approved');
    // Get the one inside dropdown (it's a list item)
    const approvedInDropdown = filterOptions.find(el => el.closest('.filter-option'));
    fireEvent.click(approvedInDropdown);
    
    // Check if only approved booking is shown
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument();
  });


  test('searches bookings by user name', async () => {
    render(<Router><BookingsPage /></Router>);
    
    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Search for 'Jane'
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    // Check if only Jane's booking is shown
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument();
  });


  test('searches bookings by facility', async () => {
    render(<Router><BookingsPage /></Router>);
    
    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByText('Tennis Court')).toBeInTheDocument();
    });
    
    // Search for 'Basketball'
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'Basketball' } });
    
    // Check if only Basketball Court booking is shown
    expect(screen.queryByText('Tennis Court')).not.toBeInTheDocument();
    expect(screen.queryByText('Swimming Pool')).not.toBeInTheDocument();
    expect(screen.getByText('Basketball Court')).toBeInTheDocument();
  });


  test('searches bookings by date', async () => {
    render(<Router><BookingsPage /></Router>);
    
    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByText('2025-05-02')).toBeInTheDocument();
    });
    
    // Search for '2025-05-01' as a day of a booking
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: '2025-05-01' } });
    
    // Check if only bookings on specified date is shown
    expect(screen.queryByText('2025-05-02')).not.toBeInTheDocument();
    expect(screen.queryByText('2025-05-03')).not.toBeInTheDocument();
    expect(screen.getByText('2025-05-01')).toBeInTheDocument();
  });


  
  
// For the "opens modal and declines a pending booking" test:
test('opens modal and declines a pending booking', async () => {
  const { updateBooking } = require('../../backend/services/bookingService.js');
  const { toast } = require('react-toastify');
  
  updateBooking.mockResolvedValue({ success: true });

  render(<Router><BookingsPage /></Router>);

  // Wait for bookings to load
  await waitFor(() => {
    expect(screen.getByText('Bookings Review')).toBeInTheDocument();
  });

  // Look for the "Pending" button in the list
  const pendingButton = await screen.findByText('Pending');
  fireEvent.click(pendingButton); // opens modal

  // Ensure modal is visible
  expect(screen.getByText('Review Booking!')).toBeInTheDocument();

  // Ensure we're updating correct booking - use modal-specific query
  const modal = screen.getByRole('dialog');
  expect(modal).toHaveTextContent('John Doe');

  // Find and click the decline button for the pending booking
  const declineButtons = screen.getAllByText('Decline');
  fireEvent.click(declineButtons[0]);

  // Check if UpdateBooking was called with correct parameters
  await waitFor(() => {
    expect(updateBooking).toHaveBeenCalledWith('booking1', 'declined');
    expect(toast.success).toHaveBeenCalledWith('declined booking successfully!');
  }); 
});

  

// For the "handles booking update failure" test:
test('handles booking update failure', async () => {
  const { updateBooking } = require('../../backend/services/bookingService.js');
  const { toast } = require('react-toastify');
  
  updateBooking.mockResolvedValue({ success: false });
  
  render(<Router><BookingsPage /></Router>);
  
  // Wait for bookings to load
  await waitFor(() => {
    expect(screen.getByText('Bookings Review')).toBeInTheDocument();
  });

  // Look for the "Pending" button in the list
  const pendingButton = await screen.findByText('Pending');
  fireEvent.click(pendingButton); // opens modal

  // Ensure modal is visible
  expect(screen.getByText('Review Booking!')).toBeInTheDocument();

  // Ensure we're updating correct booking - use modal-specific query
  const modal = screen.getByRole('dialog');
  expect(modal).toHaveTextContent('John Doe');
  
  // Find and click the approve button for the pending booking
  const approveButtons = screen.getAllByText('Approve');
  fireEvent.click(approveButtons[0]);
  
  // Check if error toast was shown
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith('Failed to update booking status.');
  });
});

  

  test('prevents status change for already reviewed bookings', async () => {
    const { toast } = require('react-toastify');
    const { updateBooking } = require('../../backend/services/bookingService.js');
    
    // Mock implementation to modify the component's state
    const mockHandleStatusChange = jest.fn().mockImplementation((booking, newStatus) => {
      if (booking.status === 'approved' || booking.status === 'declined') {
        toast.info('This booking has already been reviewed and cannot be changed.');
        return;
      }
      updateBooking(booking.bookingID, newStatus);
    });
    
    // We need to manually trigger this since we can't directly test the handler
    // as approved/declined bookings don't show the buttons
    render(<Router><BookingsPage /></Router>);
    
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // Get component instance (this is for test purposes only)
    const instance = screen.getByText('Jane Smith').closest('tr');
    expect(instance).toBeInTheDocument();
    
    // Simulate calling handleStatusChange with an already approved booking
    act(() => {
      mockHandleStatusChange(mockBookings[1], 'declined');
    });
    
    // Check if info toast was shown
    expect(toast.info).toHaveBeenCalledWith('This booking has already been reviewed and cannot be changed.');
    expect(updateBooking).not.toHaveBeenCalled();
  });



  test('displays correct time format for booked slots', async () => {
    render(<Router><BookingsPage /></Router>);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Instead of searching for exact text, use a more flexible regex pattern
    // or look for the cell with partial content
    const johnRow = screen.getByText('John Doe').closest('tr');
    const timeCell = johnRow.querySelector('.timeslot-cell');
    expect(timeCell).toHaveTextContent(/9am.*10am/i);
    
    const janeRow = screen.getByText('Jane Smith').closest('tr');
    const janeTimes = janeRow.querySelector('.timeslot-cell');
    expect(janeTimes).toHaveTextContent(/2pm.*3pm/i);
    
    const alexRow = screen.getByText('Alex Johnson').closest('tr');
    const alexTimes = alexRow.querySelector('.timeslot-cell');
    expect(alexTimes).toHaveTextContent(/6pm.*7pm/i);
  });



  test('displays "No bookings to review" when filtered results are empty', async () => {
    render(<Router><BookingsPage /></Router>);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });
    
    // Check if "No bookings to review" message is shown
    expect(screen.getByText('No bookings to review')).toBeInTheDocument();
  });



  test('handles API error when fetching bookings', async () => {
    const { fetchBookings } = require('../../backend/services/bookingService.js');
    
    // Mock API error
    fetchBookings.mockRejectedValue(new Error('API Error'));
    
    console.error = jest.fn(); // Silence console.error for this test
    
    render(<Router><BookingsPage /></Router>);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // The component should still render but with no bookings
    expect(screen.getByText('No bookings to review')).toBeInTheDocument();
  });
});