import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import IssueMenu from '../components/resident/issueMenu';
import '@testing-library/jest-dom';
import React from 'react';

// Mocking useNavigate directly
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {
    'authToken': 'test-token',
    'userType': 'resident'
  };
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('IssueMenu Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders the component correctly', () => {
    render(
      <Router>
        <IssueMenu />
      </Router>
    );
    
    // Check if header elements are rendered - use more specific selector for the heading
    const reportIssuesText = screen.getByRole('heading', { name: 'Report Issues', level: 1 });
    expect(reportIssuesText).toBeInTheDocument();
    
    // Check if the subtitle is rendered
    expect(screen.getByText('Manage maintenance requests and track issues')).toBeInTheDocument();
    
    // Check if card titles are rendered
    expect(screen.getByText('Log New Issue')).toBeInTheDocument();
    expect(screen.getByText('Track Issue History')).toBeInTheDocument();
    
    // Check if buttons are rendered by text instead of role
    expect(screen.getByText('Log Issue')).toBeInTheDocument();
    expect(screen.getByText('View History')).toBeInTheDocument();
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
    fireEvent.click(screen.getByText('Log Issue'));
    expect(mockNavigate).toHaveBeenCalledWith('/log-issue');
    
    // Click "View History" button and check if navigate is called
    fireEvent.click(screen.getByText('View History'));
    expect(mockNavigate).toHaveBeenCalledWith('/issue-history');
  });

  test('redirects to home if user is not authenticated', () => {
    // Mock user not logged in
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'userType') return 'guest';
      if (key === 'authToken') return null;
      return null;
    });
    
    const { container } = render(
      <Router>
        <IssueMenu />
      </Router>
    );
    
    // Since we're redirecting, the component shouldn't render its content
    expect(container.firstChild).toBeNull();
  });
});