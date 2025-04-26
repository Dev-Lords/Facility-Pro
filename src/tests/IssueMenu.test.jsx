import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';  // Ensure Router is imported correctly
import IssueMenu from '../components/resident/issueMenu';
import '@testing-library/jest-dom';
import React from 'react';


// Mocking useNavigate directly
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('IssueMenu Component', () => {
  test('renders the component correctly', () => {
    render(
      <Router>
        <IssueMenu />
      </Router>
    );

    // Check if header elements are rendered
    const reportIssuesText = screen.getAllByText('Report Issues');
    expect(reportIssuesText).toHaveLength(2);  // Expecting two occurrences of "Report Issues"

    // Check if the subtitle is rendered
    expect(screen.getByText('Manage maintenance requests and track issues')).toBeInTheDocument();

    // Check if card titles are rendered
    expect(screen.getByText('Log New Issue')).toBeInTheDocument();
    expect(screen.getByText('Track Issue History')).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /Log Issue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View History/i })).toBeInTheDocument();
  });

  test('navigates to the correct pages when buttons are clicked', () => {
    const mockNavigate = jest.fn();
    // Mock useNavigate to return the mock function
    require('react-router-dom').useNavigate.mockImplementation(() => mockNavigate);

    render(
      <Router>
        <IssueMenu />
      </Router>
    );

    // Click "Log Issue" button and check if navigate is called
    screen.getByRole('button', { name: /Log Issue/i }).click();
    expect(mockNavigate).toHaveBeenCalledWith('/log-issue');

    // Click "View History" button and check if navigate is called
    screen.getByRole('button', { name: /View History/i }).click();
    expect(mockNavigate).toHaveBeenCalledWith('/issue-history');
  });
});
