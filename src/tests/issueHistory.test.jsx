import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import IssueHistory from '../components/resident/IssueHistory.jsx';
import { getIssueByUserId } from '../../backend/services/issuesService.js';
import React from 'react';
import '@testing-library/jest-dom';

// Mock the backend service
jest.mock('../../backend/services/issuesService.js', () => ({
  getIssueByUserId: jest.fn(),
}));

describe('IssueHistory Component', () => {
  test('renders the component and fetches issues', async () => {
    // Mock the response from the backend service
    getIssueByUserId.mockResolvedValue([
      { issueID: 1, issueTitle: 'Test Issue', issueStatus: 'open', priority: 'high', category: 'Plumbing', reportedAt: '2025-04-15', location: 'Building A', assignedTo: 'John Doe' },
      { issueID: 2, issueTitle: 'Test Issue 2', issueStatus: 'resolved', priority: 'low', category: 'Electrical', reportedAt: '2025-04-14', location: 'Building B', assignedTo: 'Jane Doe' },
    ]);

    render(
      <Router>
        <IssueHistory />
      </Router>
    );

    // Wait for issues to be fetched and displayed
    await waitFor(() => screen.getByText('Test Issue'));

    // Check if the issue titles are displayed
    expect(screen.getByText('Test Issue')).toBeInTheDocument();
    expect(screen.getByText('Test Issue 2')).toBeInTheDocument();

    // Check if the "Log New Issue" button is rendered
    expect(screen.getByRole('button', { name: /Log New Issue/i })).toBeInTheDocument();
  });

  test('displays loading state while fetching issues', () => {
    // Mock the backend service to simulate loading
    getIssueByUserId.mockResolvedValueOnce(new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <Router>
        <IssueHistory />
      </Router>
    );

    // Check if the loading spinner is shown
    expect(screen.getByText('Loading issues...')).toBeInTheDocument();
  });

  test('displays "no issues found" message if no issues are returned', async () => {
    // Mock the backend service to return no issues
    getIssueByUserId.mockResolvedValue([]);

    render(
      <Router>
        <IssueHistory />
      </Router>
    );

    // Wait for the "no issues found" message to appear
    await waitFor(() => screen.getByText('No issues found with the selected status.'));
    
    // Check if the "no issues" message is displayed
    expect(screen.getByText('No issues found with the selected status.')).toBeInTheDocument();
  });

  test('filters issues based on the selected status', async () => {
    // Mock the response from the backend service with multiple issues
    getIssueByUserId.mockResolvedValue([
      { issueID: 1, issueTitle: 'Test Issue', issueStatus: 'open', priority: 'high', category: 'Plumbing', reportedAt: '2025-04-15', location: 'Building A', assignedTo: 'John Doe' },
      { issueID: 2, issueTitle: 'Test Issue 2', issueStatus: 'resolved', priority: 'low', category: 'Electrical', reportedAt: '2025-04-14', location: 'Building B', assignedTo: 'Jane Doe' },
    ]);

    render(
      <Router>
        <IssueHistory />
      </Router>
    );

    // Wait for issues to be fetched
    await waitFor(() => screen.getByText('Test Issue'));

    // Check initial state: Both issues are displayed
    expect(screen.getByText('Test Issue')).toBeInTheDocument();
    expect(screen.getByText('Test Issue 2')).toBeInTheDocument();

    // Filter by "open" status
    fireEvent.change(screen.getByLabelText('Filter by status:'), { target: { value: 'open' } });

    // Check if only the "open" issue is displayed
    expect(screen.queryByText('Test Issue')).toBeInTheDocument();
    expect(screen.queryByText('Test Issue 2')).not.toBeInTheDocument();

    // Filter by "resolved" status
    fireEvent.change(screen.getByLabelText('Filter by status:'), { target: { value: 'resolved' } });

    // Check if only the "resolved" issue is displayed
    expect(screen.queryByText('Test Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Issue 2')).toBeInTheDocument();
  });

  test('handles error when fetching issues', async () => {
    // Mock the backend service to simulate an error
    getIssueByUserId.mockRejectedValue(new Error('Error fetching issues'));
  
    render(
      <Router>
        <IssueHistory />
      </Router>
    );
  
    // Wait for loading to finish
    await waitFor(() => screen.queryByText('Loading issues...'));
  
    // Use a more flexible query like getByRole to ensure we can find the error message
    const errorMessage = await screen.findByRole('alert');
    
    // Check if the error message is displayed
    expect(errorMessage).toHaveTextContent('Error fetching issues');
  });
  
 
});
