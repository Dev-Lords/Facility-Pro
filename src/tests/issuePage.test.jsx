import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import IssuesPage from '../components/staff/IssuesPage.jsx';
import { within } from '@testing-library/react';

import { fetchIssues, UpdateIssue } from '../../backend/services/issuesService.js';

// Mock the services
jest.mock('../../backend/services/issuesService', () => ({
  fetchIssues: jest.fn(),
  UpdateIssue: jest.fn()
}));

describe('IssuesPage Component', () => {



    


  // Sample mock data
  const mockIssues = [
    {
      issueID: 1,
      issueTitle: 'Broken Light',
      issueStatus: 'pending',
      priority: 'high',
      location: 'Building A, Room 101',
      reportedAt: '2025-04-10T10:00:00Z',
      reporter: 'John Doe',
      issueDescription: 'Light fixture is not working',
      assignedTo: '',
      feedback: '',
      images: []
    },
    {
      issueID: 2,
      issueTitle: 'Water Leak',
      issueStatus: 'in-progress',
      priority: 'medium',
      location: 'Building B, Room 203',
      reportedAt: '2025-04-12T14:30:00Z',
      reporter: 'Jane Smith',
      issueDescription: 'Water leaking from ceiling',
      assignedTo: 'staff1',
      feedback: 'Technician dispatched',
      images: []
    },
    {
      issueID: 3,
      issueTitle: 'AC Not Working',
      issueStatus: 'closed',
      priority: 'low',
      location: 'Building C, Room 305',
      reportedAt: '2025-04-08T09:15:00Z',
      reporter: 'Anonymous',
      issueDescription: 'Air conditioning not cooling properly',
      assignedTo: 'staff2',
      feedback: 'Fixed and tested',
      images: []
    }
  ];


  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup default mock implementations
    fetchIssues.mockResolvedValue(mockIssues);
    UpdateIssue.mockResolvedValue({ success: true });
    
    // Mock window.alert
    window.alert = jest.fn();
  });

  test('renders the page header', async () => {
    render(<IssuesPage />);
    
    expect(screen.getByText('Issue Reports')).toBeInTheDocument();
    expect(screen.getByText('View and manage maintenance issues reported by facility users')).toBeInTheDocument();
  });

  test('displays loading state while fetching issues', async () => {
    // Set up fetchIssues to delay returning
    fetchIssues.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockIssues), 100);
    }));
    
    render(<IssuesPage />);
    
    expect(screen.getByText('Loading issues...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading issues...')).not.toBeInTheDocument();
    });
  });

  test('displays issues in the table after loading', async () => {
    render(<IssuesPage />);
    
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
      expect(screen.getByText('Water Leak')).toBeInTheDocument();
      expect(screen.getByText('AC Not Working')).toBeInTheDocument();
    });
    
    // Verify table headers
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Reported')).toBeInTheDocument();
  });

  test('filters issues by status', async () => {
    render(<IssuesPage />);
    
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    
    // Get the status filter select
    const statusFilter = screen.getByTestId('status-filter');
    
    // Filter by "open" status
    await userEvent.selectOptions(statusFilter, 'pending');
    
    // Should show "Broken Light" (open status) but not "Water Leak" (in-progress)
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
      expect(screen.queryByText('Water Leak')).not.toBeInTheDocument();
    });
    
    // Filter by "in-progress" status
    await userEvent.selectOptions(statusFilter, 'in-progress');
    
    // Should show "Water Leak" but not "Broken Light"
    await waitFor(() => {
      expect(screen.getByText('Water Leak')).toBeInTheDocument();
      expect(screen.queryByText('Broken Light')).not.toBeInTheDocument();
    });
    
    // Filter by "completed" status
    await userEvent.selectOptions(statusFilter, 'closed');
    
    // Should show "AC Not Working" but not the others
    await waitFor(() => {
      expect(screen.getByText('AC Not Working')).toBeInTheDocument();
      expect(screen.queryByText('Water Leak')).not.toBeInTheDocument();
      expect(screen.queryByText('Broken Light')).not.toBeInTheDocument();
    });
  });

  test('opens issue details when an issue is clicked', async () => {
    render(<IssuesPage />);
  
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
  
    // Click on the issue row to open the modal
    fireEvent.click(screen.getByText('Broken Light'));
  
    // Find the modal (which appears conditionally)
    const modal = await screen.findByRole('dialog', { hidden: true }) || screen.getByText('Light fixture is not working').closest('.issue-details-modal');
  
    // Scope all queries to inside the modal
    const modalUtils = within(modal);
  
    // Check modal content
    expect(modalUtils.getByText('Light fixture is not working')).toBeInTheDocument();
    expect(modalUtils.getByText('Building A, Room 101')).toBeInTheDocument();

    
  });
  

  test('status progress bar shows correct state and can be changed', async () => {
    render(<IssuesPage />);
    
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    
    // Click on an issue to open the modal
    await userEvent.click(screen.getByText('Broken Light'));
    
    // Get the specific status steps from the progress bar
    const statusProgressBar = screen.getByTestId('status-progress-bar');
    const openStep = within(statusProgressBar).getByText('Pending').closest('.status-step');

    const inProgressStep = within(statusProgressBar).getByText('In Progress').closest('.status-step');
    const completedStep = within(statusProgressBar).getByText('Closed').closest('.status-step');
    
    // Verify initial state (should be open)
    expect(openStep).toHaveClass('active');
    expect(inProgressStep).not.toHaveClass('closed');
    expect(inProgressStep).not.toHaveClass('active');
    expect(completedStep).not.toHaveClass('closed');
    
    // Change status to in-progress
    await userEvent.click(inProgressStep);
    
    // Verify the change was applied to editedIssue
    expect(inProgressStep).toHaveClass('active');
    
    // Update button should now be clickable
    const updateButton = screen.getByRole('button', { name: 'Update Issue' });
    expect(updateButton).toBeEnabled();
    
    // Click update
    await userEvent.click(updateButton);
    
    // UpdateIssue should have been called
    await waitFor(() => {
      expect(UpdateIssue).toHaveBeenCalledWith(1, expect.objectContaining({
        issueStatus: 'in-progress'
      }));
    });
  });

  test('can update issue priority', async () => {
    render(<IssuesPage />);
  
    // Open modal
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Broken Light'));
  
    // Change priority
    const prioritySelect = screen.getByTestId('priority-select');
    await userEvent.selectOptions(prioritySelect, 'medium');
  
    // Wait for state update to reflect
    await waitFor(() => {
      expect(prioritySelect.value).toBe('medium');
    });
  
    // Click update
    fireEvent.click(screen.getByText('Update Issue'));
  
    // Check API call
    await waitFor(() => {
      expect(UpdateIssue).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          priority: 'medium',
        })
      );
    });
  });
  

  test('can update assignee', async () => {
    render(<IssuesPage />);
    
    // Wait for issues to load and click on one
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Broken Light'));
    
    // Change assignee - use getByTestId for reliability
    const assigneeSelect = screen.getByTestId('assignee-select');
    
    // IMPORTANT: Use userEvent for proper select simulation
    await userEvent.selectOptions(assigneeSelect, 'staff2');
    
    // Verify the selection was made
    expect(assigneeSelect.value).toBe('staff2');
    
    // Update issue
    fireEvent.click(screen.getByText('Update Issue'));
    
    // Verify UpdateIssue was called with correct data
    await waitFor(() => {
      expect(UpdateIssue).toHaveBeenCalledWith(
        1, 
        expect.objectContaining({
          assignedTo: 'staff2',
          // Include other required fields that your API expects
          issueStatus: 'pending',
          priority: 'high', // or whatever default priority is
          feedback: ''
        })
      );
    });
  });

  test('can add feedback', async () => {
    render(<IssuesPage />);
    
    // Wait for issues to load and click on one
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Broken Light'));
    
    // Add feedback
    const feedbackTextarea = screen.getByPlaceholderText('Enter feedback or resolution notes here...');
    fireEvent.change(feedbackTextarea, { target: { value: 'This issue has been addressed' } });
    
    // Update issue
    fireEvent.click(screen.getByText('Update Issue'));
    
    // Verify UpdateIssue was called with correct data
    await waitFor(() => {
      expect(UpdateIssue).toHaveBeenCalledWith(1, expect.objectContaining({
        feedback: 'This issue has been addressed'
      }));
    });
  });
  test('can update issue priority', async () => {
    render(<IssuesPage />);
    
    // Open the modal
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Broken Light'));
    
    // Get the priority select
    const prioritySelect = screen.getByTestId('priority-select');
    
    // Verify initial value is 'high'
    expect(prioritySelect.value).toBe('high');
    
    // Change priority to medium
    await userEvent.selectOptions(prioritySelect, 'medium');
    
    // Verify the value changed
    expect(prioritySelect.value).toBe('medium');
    
    // Click update button
    fireEvent.click(screen.getByText('Update Issue'));
    
    // Verify API call
    await waitFor(() => {
      expect(UpdateIssue).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          priority: 'medium'  // This should now pass
        })
      );
    });
  });

  test('handles failed API requests gracefully', async () => {
    // Mock fetch to fail
    console.error = jest.fn(); // Suppress console errors
    fetchIssues.mockRejectedValue(new Error('API Error'));
    
    render(<IssuesPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading issues...')).not.toBeInTheDocument();
    });
    
    // Should show empty table
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to load issues:'), expect.any(Error));
  });

  test('handles failed update gracefully', async () => {
    // Mock update to fail
    console.error = jest.fn(); // Suppress console errors
    UpdateIssue.mockRejectedValue(new Error('Update Error'));
    
    render(<IssuesPage />);
    
    // Wait for issues to load and click on one
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Broken Light'));
    
    // Try to update
    fireEvent.click(screen.getByText('Update Issue'));
    
    // Should show error alert
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to update issue:'), expect.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Failed to update issue. Please try again.');
    });
  });

  test('closes modal when clicking close button', async () => {
    render(<IssuesPage />);
    
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    
    // Click on an issue to open modal
    fireEvent.click(screen.getByText('Broken Light'));
    
    // Click close button
    fireEvent.click(screen.getByText('×'));
    
    // Modal should disappear
    expect(screen.queryByText('Staff Feedback')).not.toBeInTheDocument();
  });
});