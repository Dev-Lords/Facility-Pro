import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Events from '../components/staff/Events.jsx'; // 
import { MemoryRouter } from 'react-router-dom';
import { fetchEvents } from '../../backend/services/ReportDataService';

// 🔧 Mock the navigation
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));


jest.mock('../../backend/services/ReportDataService', () => ({
  fetchEvents: jest.fn(),
}));

// 📦 Mock event data
const mockEvents = [
  {
    title: "Soccer Tournament",
    eventType: "Sports",
    date: "2025-06-10",
    startTime: "10:00",
    endTime: "12:00",
    location: "soccer-field",
    description: "Exciting local soccer games",
    maxParticipants: 20,
  },
  {
    title: "Netball Workshop",
    eventType: "Training",
    date: "2025-06-12",
    startTime: "14:00",
    endTime: "16:00",
    location: "netball-court",
    description: "Skills and drills",
    maxParticipants: 15,
  }
];

describe('Events Component', () => {
  beforeEach(() => {
    fetchEvents.mockResolvedValue(mockEvents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('loads and displays all events by default', async () => {
    render(<Events />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText(/Soccer Tournament/)).toBeInTheDocument();
      expect(screen.getByText(/Netball Workshop/)).toBeInTheDocument();
    });
  });

  it('filters events by facility', async () => {
    render(<Events />, { wrapper: MemoryRouter });

    await screen.findByText("Soccer Tournament");

    const select = screen.getByLabelText(/Filter by facility/i);
    fireEvent.change(select, { target: { value: 'netball-court' } });

    expect(screen.queryByText("Soccer Tournament")).not.toBeInTheDocument();
    expect(screen.getByText("Netball Workshop")).toBeInTheDocument();
  });

  it('navigates to dashboard when dashboard button is clicked', async () => {
    render(<Events />, { wrapper: MemoryRouter });

    const button = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(button);

    expect(mockedUsedNavigate).toHaveBeenCalledWith('/staff-home');
  });
});

