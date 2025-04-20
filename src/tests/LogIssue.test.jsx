import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LogIssueForm from '../components/resident/logIssue.jsx';  // Adjust the import path if necessary
import { createIssue } from '../../backend/services/issuesService';
import { getAuth } from 'firebase/auth';
import '@testing-library/jest-dom';
import React from 'react';

// Mocking the backend service and Firebase Auth
jest.mock("../../backend/services/issuesService", () => ({
  createIssue: jest.fn(() => {
    throw {};
  }),
}));

jest.mock('firebase/auth');

describe('LogIssueForm Component', () => {
  const mockUser = {
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    uid: 'user123',
  };

  beforeEach(() => {
    // Mock Firebase's getAuth and onAuthStateChanged methods
    getAuth.mockReturnValue({
      onAuthStateChanged: jest.fn((callback) => {
        // Simulate a user being logged in
        callback(mockUser); // Call the callback to simulate an authenticated user

        // Return a mock unsubscribe function (used for cleanup in useEffect)
        return jest.fn();
      }),
    });
  });

  test('handles form submission failure', async () => {
    const mockCreateIssue = jest.fn().mockRejectedValue(new Error('Failed to submit issue'));
    createIssue.mockImplementation(mockCreateIssue);

    render(<LogIssueForm />);

    // Simulate filling out the form
    fireEvent.change(screen.getByLabelText(/Issue Title/i), { target: { value: 'Broken Pipe' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Water leaking from pipe.' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Building A, Floor 2' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Plumbing' } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'high' } });

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /Submit Issue/i }));

    // Wait for the error message to appear
    await waitFor(() => screen.getByText(/Failed to submit issue/i));

    // Check if the error message is displayed
    expect(screen.getByText('Failed to submit issue')).toBeInTheDocument();
  });

  test('handles successful form submission', async () => {
    const mockCreateIssue = jest.fn().mockResolvedValue('issue123');
    createIssue.mockImplementation(mockCreateIssue);

    render(<LogIssueForm />);

    // Simulate filling out the form
    fireEvent.change(screen.getByLabelText(/Issue Title/i), { target: { value: 'Broken Pipe' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Water leaking from pipe.' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Building A, Floor 2' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Plumbing' } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'high' } });

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /Submit Issue/i }));

    // Wait for the success message to appear
    await waitFor(() => screen.getByText(/Your issue was submitted successfully!/i));

    // Check if the success message is displayed
    expect(screen.getByText('Your issue was submitted successfully!')).toBeInTheDocument();
    expect(screen.getByText('Issue ID: issue123')).toBeInTheDocument();
  });

 

  
});
