// CalendarPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CalendarPage from '../components/resident/CalendarPage.jsx';
import * as bookingService from './../../backend/services/bookingService';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('./../../backend/services/bookingService');

describe('CalendarPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();
    sessionStorage.setItem('facility', 'gym');
    localStorage.setItem('userID', 'test-user');
  });

  test('renders calendar with correct headers', () => {
    render(<Router><CalendarPage/></Router>);
    expect(screen.getByText(/Facility Booking Calendar/i)).toBeInTheDocument();
    expect(screen.getByText(/Select a date to book/i)).toBeInTheDocument();
    expect(screen.getByText(/Sun/i)).toBeInTheDocument();
    expect(screen.getByText(/Sat/i)).toBeInTheDocument();
  });

  test('shows popup on valid date click and displays slots', async () => {
    bookingService.fetchAvailableNumericSlots.mockResolvedValue([9, 10, 11]);

    render(<Router><CalendarPage/></Router>);
    const availableButtons = await screen.findAllByRole('button');
    const dayButton = availableButtons.find(btn => btn.textContent.match(/^\d+$/));

    fireEvent.click(dayButton);

    await waitFor(() => {
      expect(screen.getByText(/Available Slots for/i)).toBeInTheDocument();
      expect(screen.getByText(/9AM - 10AM/)).toBeInTheDocument();
    });
  });

 

  test('shows error on submit with no slot selected', async () => {
    render(<Router><CalendarPage/></Router>);
    const dayButton = screen.getAllByRole('button').find(btn => btn.textContent.match(/^\d+$/));
    fireEvent.click(dayButton);

    await waitFor(() => screen.getByText(/Available Slots for/i));
    fireEvent.click(screen.getByText('Submit'));

    expect(screen.getByText(/Please select at least one slot/i)).toBeInTheDocument();
  });

  test('submits and confirms booking flow', async () => {
    bookingService.fetchAvailableNumericSlots.mockResolvedValue([9, 10, 11]);
    bookingService.validBooking.mockResolvedValue('success');
    bookingService.createBooking.mockResolvedValue({});

    render(<Router><CalendarPage /></Router>);
    const dayButton = screen.getAllByRole('button').find(btn => btn.textContent.match(/^\d+$/));
    fireEvent.click(dayButton);

    await waitFor(() => screen.getByText(/Available Slots for/i));
    fireEvent.click(screen.getByText(/9AM - 10AM/));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => screen.getByText(/Confirm booking/i));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => screen.getByText(/Booking Submitted/i));
    expect(screen.getByText(/Your booking has been submitted successfully/i)).toBeInTheDocument();
  });
});
