// LogIssueForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogIssueForm from '../components/resident/logIssue.jsx';
import { createIssue } from '../../backend/services/issuesService';
import { logFacilityEvent } from '../../backend/services/logService';
import { getAuth } from 'firebase/auth';

// Mock the modules
jest.mock('../../backend/services/issuesService', () => ({
  createIssue: jest.fn()
}));

jest.mock('../../backend/services/logService', () => ({
  logFacilityEvent: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn()
}));

// Mock the SearchableLocationDropdown component
jest.mock('../components/resident/SearchableLocationDropdown.jsx', () => {
  return function MockSearchableLocationDropdown({ value, onChange }) {
    return (
      <div data-testid="searchable-location-dropdown">
        <select 
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          data-testid="location-select"
        >
          <option value="">Select Location</option>
          <option value="Lobby">Lobby</option>
          <option value="Pool Area">Pool Area</option>
          <option value="Gym">Gym</option>
        </select>
      </div>
    );
  };
});

// Mock the react-icons
jest.mock('react-icons/fa', () => ({
  FaTools: () => <div data-testid="fa-tools-icon">Tools Icon</div>,
  FaWrench: () => <div data-testid="fa-wrench-icon">Wrench Icon</div>
}));

describe('LogIssueForm Component', () => {
  const mockUser = {
    uid: 'test-user-123',
    displayName: 'Test User',
    email: 'test@example.com'
  };
  
  const mockAuth = {
    onAuthStateChanged: jest.fn((callback) => {
      callback(mockUser);
      return jest.fn(); // Return unsubscribe function
    })
  };
  
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    getAuth.mockReturnValue(mockAuth);
    createIssue.mockResolvedValue('test-issue-123');
    
    // Mock Date.now to return a consistent date
    const mockDate = new Date('2025-05-18T00:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });
  
  afterEach(() => {
    // Restore Date
    jest.restoreAllMocks();
  });
  
  test('renders form correctly', () => {
    render(<LogIssueForm />);
    
    // Check if main elements are rendered
    expect(screen.getByText('Log an Issue')).toBeInTheDocument();
    expect(screen.getByText(/Your comfort is our priority/)).toBeInTheDocument();
    expect(screen.getByTestId('fa-tools-icon')).toBeInTheDocument();
    expect(screen.getByTestId('fa-wrench-icon')).toBeInTheDocument();
    
    // Form fields
    expect(screen.getByLabelText('Issue Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByTestId('searchable-location-dropdown')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Related Facility')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload Images')).toBeInTheDocument();
    
    // Submit button
    expect(screen.getByText('Submit Issue')).toBeInTheDocument();
  });
  
  test('displays user info when logged in', async () => {
    render(<LogIssueForm />);
    
    // Wait for the auth state to be processed
    await waitFor(() => {
      expect(screen.getByText('Submitting as: Test User')).toBeInTheDocument();
    });
  });
  
  test('handles form input changes', () => {
    render(<LogIssueForm />);
    
    // Issue title
    fireEvent.change(screen.getByLabelText('Issue Title'), {
      target: { value: 'Test Issue Title' }
    });
    
    // Description
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This is a test description' }
    });
    
    // Location (using the mocked dropdown)
    fireEvent.change(screen.getByTestId('location-select'), {
      target: { value: 'Lobby' }
    });
    
    // Category
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Plumbing' }
    });
    
    // Related Facility
    fireEvent.change(screen.getByLabelText('Related Facility'), {
      target: { value: 'Pool' }
    });
    
    // Priority
    fireEvent.change(screen.getByLabelText('Priority'), {
      target: { value: 'high' }
    });
    
    // Check that values were updated correctly in the form
    expect(screen.getByLabelText('Issue Title').value).toBe('Test Issue Title');
    expect(screen.getByLabelText('Description').value).toBe('This is a test description');
    expect(screen.getByTestId('location-select').value).toBe('Lobby');
    expect(screen.getByLabelText('Category').value).toBe('Plumbing');
    expect(screen.getByLabelText('Related Facility').value).toBe('Pool');
    expect(screen.getByLabelText('Priority').value).toBe('high');
  });
  
  test('submits the form successfully', async () => {
    render(<LogIssueForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Issue Title'), {
      target: { value: 'Test Issue Title' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This is a test description' }
    });
    
    fireEvent.change(screen.getByTestId('location-select'), {
      target: { value: 'Lobby' }
    });
    
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Plumbing' }
    });
    
    fireEvent.change(screen.getByLabelText('Related Facility'), {
      target: { value: 'Pool' }
    });
    
    // Don't change priority - keep the default 'medium'
    
    // Mock the file input event
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Upload Images');
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Issue'));
    
    // Wait for the submission to complete
    await waitFor(() => {
      // Check that createIssue was called with the correct data
      expect(createIssue).toHaveBeenCalledWith(expect.objectContaining({
        issueTitle: 'Test Issue Title',
        issueDescription: 'This is a test description',
        location: 'Lobby',
        priority: 'medium', // Changed from 'high' to 'medium'
        category: 'Plumbing',
        relatedFacility: 'Pool',
        reporter: 'test-user-123',
      }));
      
      // Check that the created issue has reportedAt and images properties
      expect(createIssue.mock.calls[0][0]).toHaveProperty('reportedAt');
      expect(createIssue.mock.calls[0][0]).toHaveProperty('images');
      
      // Check that logFacilityEvent was called
      expect(logFacilityEvent).toHaveBeenCalledWith(
        'issue',
        'Lobby',
        'test-issue-123',
        'test-user-123',
        expect.any(Object)
      );
      
      // Check that success message is displayed
      expect(screen.getByText('Your issue was submitted successfully!')).toBeInTheDocument();
      expect(screen.getByText('Issue ID: test-issue-123')).toBeInTheDocument();
    });
  });
  
  test('handles submission error', async () => {
    // Mock an error when creating an issue
    const errorMessage = 'Failed to create issue';
    createIssue.mockRejectedValue(new Error(errorMessage));
    
    render(<LogIssueForm />);
    
    // Fill out and submit the form
    fireEvent.change(screen.getByLabelText('Issue Title'), {
      target: { value: 'Error Test Issue' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This should fail' }
    });
    
    fireEvent.change(screen.getByTestId('location-select'), {
      target: { value: 'Lobby' }
    });
    
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Plumbing' }
    });
    
    fireEvent.change(screen.getByLabelText('Related Facility'), {
      target: { value: 'Pool' }
    });
    
    fireEvent.click(screen.getByText('Submit Issue'));
    
    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
  
  test('prevents submission when user is not logged in', async () => {
    // Mock a user who is not logged in
    mockAuth.onAuthStateChanged.mockImplementationOnce((callback) => {
      callback(null);
      return jest.fn();
    });
    
    render(<LogIssueForm />);
    
    fireEvent.submit(screen.getByRole('form'));

    // Check if login warning is displayed
    await waitFor(() =>
    expect(screen.getByText('You must be logged in to submit an issue')).toBeInTheDocument()
    );

    // Try to submit the form
    fireEvent.click(screen.getByText('Submit Issue'));
    
    
    // Confirm that createIssue was not called
    expect(createIssue).not.toHaveBeenCalled();
  });
  
  test('closes success message when close button is clicked', async () => {
    render(<LogIssueForm />);
    
    // Fill out and submit the form
    fireEvent.change(screen.getByLabelText('Issue Title'), {
      target: { value: 'Test Issue Title' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This is a test description' }
    });
    
    fireEvent.change(screen.getByTestId('location-select'), {
      target: { value: 'Lobby' }
    });
    
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Plumbing' }
    });
    
    fireEvent.change(screen.getByLabelText('Related Facility'), {
      target: { value: 'Pool' }
    });
    
    fireEvent.click(screen.getByText('Submit Issue'));
    
    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText('Your issue was submitted successfully!')).toBeInTheDocument();
    });
    
    // Click close button
    fireEvent.click(screen.getByText('Close'));
    
    // Check that success message is no longer displayed
    await waitFor(() => {
      expect(screen.queryByText('Your issue was submitted successfully!')).not.toBeInTheDocument();
    });
  });
});