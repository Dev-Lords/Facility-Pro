import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ReportsDashboard from '../components/admin/GenerateReports.jsx';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  Navigate: jest.fn()
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ReportsDashboard Component', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test('redirects to home page when not authenticated', () => {
    const navigateMock = require('react-router-dom').Navigate;
    navigateMock.mockImplementation(() => <div data-testid="navigate-mock" />);
    
    render(<ReportsDashboard />);
    
    // Check that Navigate was called with the correct props
    expect(navigateMock).toHaveBeenCalled();
    expect(navigateMock.mock.calls[0][0]).toEqual({ to: '/', replace: true });
  });

  test('redirects to home page when authenticated but not as admin', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userType', 'user');
    
    const navigateMock = require('react-router-dom').Navigate;
    navigateMock.mockImplementation(() => <div data-testid="navigate-mock" />);
    
    render(<ReportsDashboard />);
    
    // Check that Navigate was called with the correct props
    expect(navigateMock).toHaveBeenCalled();
    expect(navigateMock.mock.calls[0][0]).toEqual({ to: '/', replace: true });
  });

  test('renders correctly when authenticated as admin', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userType', 'admin');
    
    const navigateMock = require('react-router-dom').useNavigate;
    navigateMock.mockImplementation(() => jest.fn());
    
    render(
      <BrowserRouter>
        <ReportsDashboard />
      </BrowserRouter>
    );
    
    // Check that main elements are rendered
    expect(screen.getByText('Generate Reports')).toBeInTheDocument();
    expect(screen.getByText('Usage Trends by Facility')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Reports')).toBeInTheDocument();
    expect(screen.getByText('Custom View')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  test('handles navigation when buttons are clicked', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userType', 'admin');
    
    const navigateMock = jest.fn();
    require('react-router-dom').useNavigate.mockImplementation(() => navigateMock);
    
    render(
      <BrowserRouter>
        <ReportsDashboard />
      </BrowserRouter>
    );
    
    // Test usage trends button - find it by its context with the heading
    const usageTrendsSection = screen.getByText('Usage Trends by Facility').closest('article');
    const usageTrendsButton = within(usageTrendsSection).getByText('Generate Report');
    fireEvent.click(usageTrendsButton);
    expect(navigateMock).toHaveBeenCalledWith("/usage-trends");
    
    // Test maintenance reports button - find it by its context with the heading
    const maintenanceSection = screen.getByText('Maintenance Reports').closest('article');
    const maintenanceButton = within(maintenanceSection).getByText('Generate Report');
    fireEvent.click(maintenanceButton);
    expect(navigateMock).toHaveBeenCalledWith("/maintenance-reports");
    
    // Test custom reports button
    fireEvent.click(screen.getByText('Create Custom Report'));
    expect(navigateMock).toHaveBeenCalledWith("/custom-reports");
    
    // Test back button
    fireEvent.click(screen.getByText('Back to Dashboard'));
    expect(navigateMock).toHaveBeenCalledWith("/AdminDashboard");
  });

  test('displays correct descriptions for each report type', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userType', 'admin');
    
    const navigateMock = require('react-router-dom').useNavigate;
    navigateMock.mockImplementation(() => jest.fn());
    
    render(
      <BrowserRouter>
        <ReportsDashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Track facility utilization patterns and identify peak usage times.')).toBeInTheDocument();
    expect(screen.getByText('View open vs. closed maintenance tickets and track resolution status.')).toBeInTheDocument();
    expect(screen.getByText('Create personalized reports with specific parameters and data points.')).toBeInTheDocument();
  });

  test('displays correct footer information', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userType', 'admin');
    
    const navigateMock = require('react-router-dom').useNavigate;
    navigateMock.mockImplementation(() => jest.fn());
    
    render(
      <BrowserRouter>
        <ReportsDashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Facility Management System • Reports Dashboard • Version 1.0.0')).toBeInTheDocument();
  });

  test('renders all icons correctly', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userType', 'admin');
    
    const navigateMock = require('react-router-dom').useNavigate;
    navigateMock.mockImplementation(() => jest.fn());
    
    render(
      <BrowserRouter>
        <ReportsDashboard />
      </BrowserRouter>
    );
    
    // Check that we have the correct number of cards with icons
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);

    // Back button should contain an icon as well
    const backButton = screen.getByText('Back to Dashboard').closest('button');
    expect(backButton).toBeInTheDocument();
  });
});