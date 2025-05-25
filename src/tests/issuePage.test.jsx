import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { within } from '@testing-library/react';
import IssuesPage from '../components/staff/IssuesPage.jsx';

import { fetchIssues, UpdateIssue } from '../../backend/services/issuesService.js';
import { fetchUser } from '../../backend/services/userServices.js';

// Mock the services
jest.mock('../../backend/services/issuesService', () => ({
  fetchIssues: jest.fn(),
  UpdateIssue: jest.fn()
}));

jest.mock('../../backend/services/userServices', () => ({
  fetchUser: jest.fn()
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaBars: () => <div>Menu Icon</div>
}));

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

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
      reporter: 'user123',
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
      reporter: 'user456',
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
      reporter: 'user789',
      issueDescription: 'Air conditioning not cooling properly',
      assignedTo: 'staff2',
      feedback: 'Fixed and tested',
      images: []
    }
  ];

  const mockUser = {
    displayName: 'John Doe',
    email: 'john@example.com'
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup default mock implementations
    fetchIssues.mockResolvedValue(mockIssues);
    UpdateIssue.mockResolvedValue({ success: true });
    fetchUser.mockResolvedValue(mockUser);
    
    // Mock window.alert
    window.alert = jest.fn();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  test('renders the page header', async () => {
    renderWithRouter(<IssuesPage />);
    
    expect(screen.getByText('Issue Reports')).toBeInTheDocument();
    expect(screen.getByText('View and manage maintenance issues reported by facility users')).toBeInTheDocument();
  });

  test('displays loading state while fetching issues', async () => {
    // Set up fetchIssues to delay returning
    fetchIssues.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockIssues), 100);
    }));
    
    renderWithRouter(<IssuesPage />);
    
    expect(screen.getByText('Loading issues...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading issues...')).not.toBeInTheDocument();
    });
  });

  test('displays issues in the table after loading', async () => {
    renderWithRouter(<IssuesPage />);
    
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
      expect(screen.getByText('Water Leak')).toBeInTheDocument();
      expect(screen.getByText('AC Not Working')).toBeInTheDocument();
    });
    
    // Verify table headers
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Reported')).toBeInTheDocument();
  });

  test('filters issues by status', async () => {
    renderWithRouter(<IssuesPage />);
    
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    
    // Get the status filter select
    const statusFilter = screen.getByTestId('status-filter');
    
    // Filter by "pending" status
    await userEvent.selectOptions(statusFilter, 'pending');
    
    // Should show "Broken Light" (pending status) but not "Water Leak" (in-progress)
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
    
    // Filter by "closed" status
    await userEvent.selectOptions(statusFilter, 'closed');
    
    // Should show "AC Not Working" but not the others
    await waitFor(() => {
      expect(screen.getByText('AC Not Working')).toBeInTheDocument();
      expect(screen.queryByText('Water Leak')).not.toBeInTheDocument();
      expect(screen.queryByText('Broken Light')).not.toBeInTheDocument();
    });
  });

  test('opens issue details when an issue is clicked', async () => {
    renderWithRouter(<IssuesPage />);
  
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
  
    // Click on the issue row to open the modal
    fireEvent.click(screen.getByText('Broken Light'));
  
    // Wait for modal to appear and find it
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  
    const modal = screen.getByRole('dialog');
    const modalUtils = within(modal);
  
    // Check modal content
    expect(modalUtils.getByText('Light fixture is not working')).toBeInTheDocument();
    expect(modalUtils.getByText('Building A, Room 101')).toBeInTheDocument();
  });

  test('status progress bar shows correct state and can be changed', async () => {
    renderWithRouter(<IssuesPage />);
    
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    
    // Click on an issue to open the modal
    await userEvent.click(screen.getByText('Broken Light'));
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Get the specific status steps from the progress bar
    const statusProgressBar = screen.getByTestId('status-progress-bar');
    const pendingStep = within(statusProgressBar).getByText('Pending').closest('button');
    const inProgressStep = within(statusProgressBar).getByText('In Progress').closest('button');
    
    // Verify initial state (should be pending)
    expect(pendingStep).toHaveClass('active');
    expect(inProgressStep).not.toHaveClass('active');
    
    // Change status to in-progress
    await userEvent.click(inProgressStep);
    
    // Verify the change was applied
    expect(inProgressStep).toHaveClass('active');
    
    // Update button should be clickable
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
    renderWithRouter(<IssuesPage />);
  
    // Open modal
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Broken Light'));
  
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  
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

 

  test('can add feedback', async () => {
    renderWithRouter(<IssuesPage />);
    
    // Wait for issues to load and click on one
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Broken Light'));
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
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

  test('handles failed API requests gracefully', async () => {
    // Mock fetch to fail
    console.error = jest.fn(); // Suppress console errors
    fetchIssues.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(<IssuesPage />);
    
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
    
    renderWithRouter(<IssuesPage />);
    
    // Wait for issues to load and click on one
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Broken Light'));
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Try to update
    fireEvent.click(screen.getByText('Update Issue'));
    
    // Should show error alert
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to update issue:'), expect.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Failed to update issue. Please try again.');
    });
  });

  test('closes modal when clicking close button', async () => {
    renderWithRouter(<IssuesPage />);
    
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    
    // Click on an issue to open modal
    fireEvent.click(screen.getByText('Broken Light'));
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Click close button
    fireEvent.click(screen.getByText('×'));
    
    // Modal should disappear
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('displays pagination controls correctly', async () => {
    renderWithRouter(<IssuesPage />);
    
    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken Light')).toBeInTheDocument();
    });
    
    // Check pagination info
    const pageInfo = screen.getByTestId('page-info');
    expect(pageInfo).toHaveTextContent('1–3 of 3');
    
    // Check pagination buttons
    const prevButton = screen.getByLabelText('Previous page');
    const nextButton = screen.getByLabelText('Next page');
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  
});