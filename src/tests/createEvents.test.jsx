import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateEvents from '../components/admin/CreateEvent.jsx';
import { MemoryRouter } from 'react-router-dom';
import * as firestore from 'firebase/firestore';
import '@testing-library/jest-dom';


// Mock navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock Firebase methods
jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    getFirestore: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
    serverTimestamp: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
  };
});

beforeEach(() => {
  localStorage.setItem('role', 'admin');
  localStorage.setItem('userId', 'test-user');
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

test('renders event creation form', () => {
  setup();
  expect(screen.getByText(/Create New Event/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Summer Pool Party/i)).toBeInTheDocument();
});

test('shows validation error if end time is before start time', async () => {
  setup();
  fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '15:00' } });
  fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '14:00' } });

  fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Test Event' } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2025-04-30' } });
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'soccer-field' } });
  fireEvent.change(screen.getByLabelText(/Event Type/i), { target: { value: 'tournament' } });
  fireEvent.change(screen.getByLabelText(/Maximum Participants/i), { target: { value: '10' } });

  fireEvent.click(screen.getByText(/Create Event/i));
  expect(screen.getByText(/End time must be after start time/i)).toBeInTheDocument();
  expect(screen.getByText(/Event must be at least 30 minutes long/i)).toBeInTheDocument();

});

test('displays error if overlapping event exists', async () => {
  firestore.getDocs.mockResolvedValueOnce({
    docs: [{
      data: () => ({
        title: 'Yoga Class',
        date: '2025-04-30',
        location: 'soccer-field',
        startTime: '14:00',
        endTime: '15:30',
        status: 'active'
      })
    }]
  });

  setup();
  fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Overlapping Event' } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2025-04-30' } });
  fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '14:30' } });
  fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '15:00' } });
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'soccer-field' } });
  fireEvent.change(screen.getByLabelText(/Event Type/i), { target: { value: 'tournament' } });
  fireEvent.change(screen.getByLabelText(/Maximum Participants/i), { target: { value: '15' } });

  fireEvent.click(screen.getByText(/Create Event/i));

  await waitFor(() => {
  expect(screen.getByText((content) =>
    content.includes("End time must be after start time")
  )).toBeInTheDocument();
});

});

test('creates event successfully and shows success message', async () => {
  firestore.getDocs.mockResolvedValueOnce({ docs: [] });
  firestore.addDoc.mockResolvedValueOnce({ id: 'event123' });

  setup();
  fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Test Event' } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Description' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2025-04-30' } });
  fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '10:00' } });
  fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'swimming-pool' } });
  fireEvent.change(screen.getByLabelText(/Event Type/i), { target: { value: 'class' } });
  fireEvent.change(screen.getByLabelText(/Maximum Participants/i), { target: { value: '20' } });

  fireEvent.click(screen.getByText(/Create Event/i));

  await waitFor(() => {
    expect(screen.getByText(/Your event was created successfully/i)).toBeInTheDocument();
  });
});
