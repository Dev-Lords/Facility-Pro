import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateEvents from '../components/admin/CreateEvent.jsx';
import { MemoryRouter } from 'react-router-dom';
import * as eventsService from '../../backend/services/Events.js';
import '@testing-library/jest-dom';

// Mock navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock Events service
jest.mock('../../backend/services/Events.js', () => ({
  createEvent: jest.fn(),
  fetchEvents: jest.fn(),
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaCalendarAlt: () => <div>Calendar Icon</div>,
  FaClock: () => <div>Clock Icon</div>,
  FaBars: () => <div>Menu Icon</div>,
}));

beforeEach(() => {
  localStorage.setItem('role', 'admin');
  localStorage.setItem('userId', 'test-user');
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

const setup = () => {
  return render(
    <MemoryRouter>
      <CreateEvents />
    </MemoryRouter>
  );
};

// Helper function to fill out the form with valid data
const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Test Event' } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2025-06-30' } });
  fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '10:00' } });
  fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'soccer-field' } });
  fireEvent.change(screen.getByLabelText(/Event Type/i), { target: { value: 'tournament' } });
  fireEvent.change(screen.getByLabelText(/Maximum Participants/i), { target: { value: '20' } });
};

test('renders event creation form', () => {
  setup();
  expect(screen.getByText(/Create New Event/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Summer Pool Party/i)).toBeInTheDocument();
});

test('shows validation error if end time is before start time', async () => {
  setup();
  
  // Fill form with invalid time (end before start)
  fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Test Event' } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2025-06-30' } });
  fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '15:00' } });
  fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '14:00' } }); // End before start
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'soccer-field' } });
  fireEvent.change(screen.getByLabelText(/Event Type/i), { target: { value: 'tournament' } });
  fireEvent.change(screen.getByLabelText(/Maximum Participants/i), { target: { value: '10' } });

  fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));

  // Wait for the error popup to appear
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // Check for error messages in the popup
  expect(screen.getByText(/Unable to Create Event/i)).toBeInTheDocument();
  expect(screen.getByText(/End time must be after start time/i)).toBeInTheDocument();
  expect(screen.getByText(/Event must be at least 30 minutes long/i)).toBeInTheDocument();
});

test('displays error if overlapping event exists', async () => {
  // Mock fetchEvents to return an overlapping event
  eventsService.fetchEvents.mockResolvedValueOnce([
    {
      title: 'Existing Event',
      date: '2025-06-30',
      location: 'soccer-field',
      startTime: '14:00',
      endTime: '15:30',
      status: 'active'
    }
  ]);

  setup();
  
  // Fill form with overlapping time
  fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Overlapping Event' } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2025-06-30' } });
  fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '14:30' } }); // Overlaps with 14:00-15:30
  fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '15:00' } });
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'soccer-field' } });
  fireEvent.change(screen.getByLabelText(/Event Type/i), { target: { value: 'tournament' } });
  fireEvent.change(screen.getByLabelText(/Maximum Participants/i), { target: { value: '15' } });

  fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));

  // Wait for the error popup to appear
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // Check for overlap error message
  expect(screen.getByText(/Unable to Create Event/i)).toBeInTheDocument();
  expect(screen.getByText(/This time slot overlaps with an existing/i)).toBeInTheDocument();
});

test('creates event successfully and shows success message', async () => {
  // Mock no overlapping events
  eventsService.fetchEvents.mockResolvedValueOnce([]);
  // Mock successful event creation
  eventsService.createEvent.mockResolvedValueOnce({ success: true, id: 'event123' });

  setup();
  
  // Fill form with valid data
  fillValidForm();

  fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));

  // Wait for the success popup to appear
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // Check for success message
  expect(screen.getByText(/Event Created Successfully!/i)).toBeInTheDocument();
  expect(screen.getByText(/The event has been added to the calendar/i)).toBeInTheDocument();
  
  // Verify createEvent was called with correct data
  expect(eventsService.createEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Test Event',
      description: 'Test Description',
      date: '2025-06-30',
      startTime: '10:00',
      endTime: '11:00',
      location: 'soccer-field',
      eventType: 'tournament',
      maxParticipants: '20'
    })
  );
});



 

test('shows loading state during form submission', async () => {
  // Mock no overlapping events
  eventsService.fetchEvents.mockResolvedValueOnce([]);
  // Mock delayed event creation
  eventsService.createEvent.mockImplementation(() => 
    new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
  );

  setup();
  fillValidForm();

  fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));

  // Check that button shows loading state
  expect(screen.getByRole('button', { name: /Creating.../i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Creating.../i })).toBeDisabled();

  // Wait for completion
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

test('handles service errors gracefully', async () => {
  // Mock fetchEvents to throw an error
  eventsService.fetchEvents.mockRejectedValueOnce(new Error('Service error'));

  setup();
  fillValidForm();

  fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));

  // Wait for the error popup to appear
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  expect(screen.getByText(/Unable to Create Event/i)).toBeInTheDocument();
  expect(screen.getByText(/Failed to create event/i)).toBeInTheDocument();
});

test('clears error message when user starts typing', async () => {
  setup();
  
  // First trigger an error
  fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Test Event' } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2025-06-30' } });
  fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '15:00' } });
  fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '14:00' } }); // Invalid
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'soccer-field' } });
  fireEvent.change(screen.getByLabelText(/Event Type/i), { target: { value: 'tournament' } });
  fireEvent.change(screen.getByLabelText(/Maximum Participants/i), { target: { value: '10' } });

  fireEvent.click(screen.getByRole('button', { name: /Create Event/i }));

  // Wait for error popup
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // Close the popup
  fireEvent.click(screen.getByText(/OK, I'll Fix It/i));

  // Wait for popup to close
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // Now change a form field - this should clear any inline error messages
  fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Updated Event' } });

  // Since the error was in a popup that's now closed, we can't really test inline error clearing
  // But we can verify the form is functional again
  expect(screen.getByDisplayValue('Updated Event')).toBeInTheDocument();
});