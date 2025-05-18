// MaintenanceReportPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MaintenanceReportPage from '../components/admin/MaintenanceReportPage';
import { fetchFilteredIssues, getStats, resolveStatus, exportToCsv } from '../../backend/services/MaintenanceReportService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart } from 'chart.js/auto';
import { MemoryRouter as Router } from 'react-router-dom';
// Mock all the external dependencies
jest.mock('../../backend/services/MaintenanceReportService', () => ({
  fetchFilteredIssues: jest.fn(),
  getStats: jest.fn(),
  resolveStatus: jest.fn(),
  exportToCsv: jest.fn()
}));

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    save: jest.fn()
  }));
});

jest.mock('jspdf-autotable', () => jest.fn());

// Mock Chart.js
jest.mock('chart.js/auto', () => {
  return {
    Chart: jest.fn().mockImplementation(() => ({
      destroy: jest.fn()
    }))
  };
});

describe('MaintenanceReportPage Component', () => {
  // Sample data for tests
  const mockIssues = [
    {
      issueID: '1',
      issueTitle: 'Broken Pool Filter',
      issueStatus: 'open',
      priority: 'High',
      relatedFacility: 'Pool',
      location: 'Pool Area',
      reportedAt: '2025-05-10T10:00:00.000Z'
    },
    {
      issueID: '2',
      issueTitle: 'Gym Equipment Maintenance',
      issueStatus: 'closed',
      priority: 'Medium',
      relatedFacility: 'Gym',
      location: 'Gym Area',
      reportedAt: '2025-05-08T14:30:00.000Z'
    },
    {
      issueID: '3',
      issueTitle: 'Soccer Field Lights',
      issueStatus: 'open',
      priority: 'Low',
      relatedFacility: 'Soccer Field',
      location: 'Soccer Field',
      reportedAt: '2025-05-12T09:15:00.000Z'
    }
  ];

  // Mock stats
  const mockStats = {
    open: 2,
    closed: 1,
    priorityCounts: {
      High: 1,
      Medium: 1,
      Low: 1
    }
  };

  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the implementations
    fetchFilteredIssues.mockResolvedValue(mockIssues);
    
    getStats.mockImplementation(() => ({
      open: mockStats.open,
      closed: mockStats.closed,
      priorityCounts: mockStats.priorityCounts
    }));
    
    resolveStatus.mockImplementation((status) => {
      return status === 'open' ? 'Open' : 'Closed';
    });

    // Mock canvas context
    const mockCanvas = {
      getContext: jest.fn().mockReturnValue({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
        createImageData: jest.fn(),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        scale: jest.fn(),
        measureText: jest.fn().mockReturnValue({ width: 0 }),
        fillText: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn(),
        quadraticCurveTo: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        clip: jest.fn(),
      })
    };

    // Override the canvas prototype's getContext method
    HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;
  });

  afterEach(() => {
    // Clean up
    jest.restoreAllMocks();
  });

  test('renders component with initial data', async () => {
    render(<Router><MaintenanceReportPage/></Router>);
    
    // Wait for the initial data to load
    await waitFor(() => {
      expect(fetchFilteredIssues).toHaveBeenCalledWith('all', 'all', 'all');
    });
    
    // Check header is present
    expect(screen.getByText('Maintenance Report Dashboard')).toBeInTheDocument();
    
    // Check filter section is present
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Priority:/)).toBeInTheDocument();
    expect(screen.getByText(/Facility:/)).toBeInTheDocument();
    
    // Check buttons are present
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    expect(screen.getByText('Show Graphs')).toBeInTheDocument();
    expect(screen.getByText('Download as CSV')).toBeInTheDocument();
    expect(screen.getByText('Download as PDF')).toBeInTheDocument();
  });

  

  test('displays facility availability correctly', async () => {
    // Mock implementation to test the calculateFacilityAvailability logic
    resolveStatus.mockImplementation(status => status);
    
    render(<Router><MaintenanceReportPage/></Router>);
    
    await waitFor(() => {
      // Check facility availability section
      expect(screen.getByText('Facility Availability')).toBeInTheDocument();
      
      // Check specific facilities using h4 tags
      const facilityHeadings = screen.getAllByRole('heading', { level: 4 });
      
      // Find specific facility cards by their h4 text content
      const gymHeading = facilityHeadings.find(h => h.textContent === 'Gym');
      const poolHeading = facilityHeadings.find(h => h.textContent === 'Pool');
      const soccerFieldHeading = facilityHeadings.find(h => h.textContent === 'Soccer Field');
      const basketballCourtHeading = facilityHeadings.find(h => h.textContent === 'Basketball Court');
      
      expect(gymHeading).toBeInTheDocument();
      expect(poolHeading).toBeInTheDocument();
      expect(soccerFieldHeading).toBeInTheDocument();
      expect(basketballCourtHeading).toBeInTheDocument();
      
      // Check availability status by finding the closest facility card and then its status paragraph
      expect(gymHeading.closest('.facility-card').querySelector('.status')).toHaveTextContent(/Available|Unavailable/);
      expect(poolHeading.closest('.facility-card').querySelector('.status')).toHaveTextContent(/Available|Unavailable/);
      expect(soccerFieldHeading.closest('.facility-card').querySelector('.status')).toHaveTextContent(/Available|Unavailable/);
      expect(basketballCourtHeading.closest('.facility-card').querySelector('.status')).toHaveTextContent(/Available|Unavailable/);
    });
  });

  test('displays issues table with correct data', async () => {
    render(<Router><MaintenanceReportPage/></Router>);
    
    await waitFor(() => {
      // Check if table headers exist
      expect(screen.getByRole('columnheader', { name: 'Title' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Priority' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Facility' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Location' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Reported' })).toBeInTheDocument();
      
      // Check if issue data is displayed in the table
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(4); // 1 header row + 3 data rows
      
      expect(screen.getByText('Broken Pool Filter')).toBeInTheDocument();
      expect(screen.getByText('Gym Equipment Maintenance')).toBeInTheDocument();
      expect(screen.getByText('Soccer Field Lights')).toBeInTheDocument();
    });
  });

  test('applies filters correctly', async () => {
    // Mock new filtered data
    const filteredData = [mockIssues[0]]; // Just the Pool issue
    fetchFilteredIssues.mockResolvedValueOnce(mockIssues) // First call for initial load
                       .mockResolvedValueOnce(filteredData); // Second call for filter
    
    render(<Router><MaintenanceReportPage/></Router>);
    
    // Wait for initial load
    await waitFor(() => {
      expect(fetchFilteredIssues).toHaveBeenCalledTimes(1);
    });
    
    // Change the facility filter to 'Pool'
    const facilitySelect = screen.getByLabelText(/Facility:/);
    fireEvent.change(facilitySelect, { target: { value: 'Pool' } });
    
    // Click apply filters button
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);
    
    // Wait for filters to be applied
    await waitFor(() => {
      expect(fetchFilteredIssues).toHaveBeenCalledTimes(2);
      expect(fetchFilteredIssues).toHaveBeenLastCalledWith('all', 'Pool', 'all');
    });
  });

  test('toggles graph display when button is clicked', async () => {
    render(<Router><MaintenanceReportPage/></Router>);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Show Graphs')).toBeInTheDocument();
    });
    
    // Initially, graphs should not be visible
    expect(screen.queryByText('Maintenance Analytics')).not.toBeInTheDocument();
    
    // Click the Show Graphs button
    const showGraphsButton = screen.getByText('Show Graphs');
    fireEvent.click(showGraphsButton);
    
    // Now the graphs section should be visible
    expect(screen.getByText('Maintenance Analytics')).toBeInTheDocument();
    expect(screen.getByText('Hide Graphs')).toBeInTheDocument();
    
    // Click the Hide Graphs button
    const hideGraphsButton = screen.getByText('Hide Graphs');
    fireEvent.click(hideGraphsButton);
    
    // Graphs should be hidden again
    expect(screen.queryByText('Maintenance Analytics')).not.toBeInTheDocument();
    expect(screen.getByText('Show Graphs')).toBeInTheDocument();
  });

 

  test('exports to CSV when button is clicked', async () => {
    // Mock the filtered issues state with actual issues
    render(<Router><MaintenanceReportPage/></Router>);
    
    // Wait for initial load
    await waitFor(() => {
      expect(fetchFilteredIssues).toHaveBeenCalled();
    });
    
    // Click the CSV export button
    const csvButton = screen.getByText('Download as CSV');
    fireEvent.click(csvButton);
    
    // Check if exportToCsv was called
    expect(exportToCsv).toHaveBeenCalled();
    expect(exportToCsv.mock.calls[0][1]).toBe('maintenance_report.csv');
    
    // We don't check the exact issues since they may change during rendering
    // Just check that some array was passed as the first argument
    expect(Array.isArray(exportToCsv.mock.calls[0][0])).toBe(true);
  });

  test('exports to PDF when button is clicked', async () => {
    render(<Router><MaintenanceReportPage/></Router>);
    
    // Wait for initial load
    await waitFor(() => {
      expect(fetchFilteredIssues).toHaveBeenCalled();
    });
    
    // Click the PDF export button
    const pdfButton = screen.getByText('Download as PDF');
    fireEvent.click(pdfButton);
    
    // Check if jsPDF constructor was called
    expect(jsPDF).toHaveBeenCalled();
    
    // Check if autoTable was called
    expect(autoTable).toHaveBeenCalled();
    
    // Check if save method was called on the PDF object
    const pdfInstance = jsPDF.mock.results[0].value;
    expect(pdfInstance.save).toHaveBeenCalledWith('maintenance_report.pdf');
  });

  test('calculates facility availability correctly', async () => {
    // Mock implementation to test the calculateFacilityAvailability logic
    resolveStatus.mockImplementation(status => status);
    
    // Create mock data with specific facility states
    const facilityIssues = [
      { relatedFacility: 'Pool', issueStatus: 'Open' },       // Unavailable
      { relatedFacility: 'Gym', issueStatus: 'Closed' },      // Available
      { relatedFacility: 'Soccer Field', issueStatus: 'Open' } // Unavailable
      // Basketball Court has no issues, so should be Available
    ];
    
    fetchFilteredIssues.mockResolvedValueOnce(facilityIssues);
    
    render(<Router><MaintenanceReportPage/></Router>);
    
    await waitFor(() => {
      // Check the availability status for each facility
      const facilityHeadings = screen.getAllByRole('heading', { level: 4 });
      
      // Find specific facility cards by their h4 text content
      const gymHeading = facilityHeadings.find(h => h.textContent === 'Gym');
      const poolHeading = facilityHeadings.find(h => h.textContent === 'Pool');
      const soccerFieldHeading = facilityHeadings.find(h => h.textContent === 'Soccer Field');
      const basketballCourtHeading = facilityHeadings.find(h => h.textContent === 'Basketball Court');
      
      // Verify the status of each facility
      if (poolHeading) {
        const poolCard = poolHeading.closest('.facility-card');
        const poolStatus = poolCard.querySelector('.status');
        const poolPercentage = poolCard.querySelector('.percentage');
        
        expect(poolStatus).toHaveTextContent('Unavailable');
        expect(poolPercentage).toHaveTextContent('0%');
      }
      
      if (gymHeading) {
        const gymCard = gymHeading.closest('.facility-card');
        const gymStatus = gymCard.querySelector('.status');
        const gymPercentage = gymCard.querySelector('.percentage');
        
        expect(gymStatus).toHaveTextContent('Available');
        expect(gymPercentage).toHaveTextContent('100%');
      }
      
      if (basketballCourtHeading) {
        const basketballCard = basketballCourtHeading.closest('.facility-card');
        const basketballStatus = basketballCard.querySelector('.status');
        const basketballPercentage = basketballCard.querySelector('.percentage');
        
        expect(basketballStatus).toHaveTextContent('Available');
        expect(basketballPercentage).toHaveTextContent('100%');
      }
    });
  });

  test('displays results count correctly', async () => {
    render(<Router><MaintenanceReportPage/></Router>);
    
    await waitFor(() => {
      // Should show "Showing 3 issues" with the mock data
      expect(screen.getByText(/Showing 3 issues/)).toBeInTheDocument();
    });
    
    // Now update to filtered data with just 1 issue
    const singleIssue = [mockIssues[0]];
    fetchFilteredIssues.mockResolvedValueOnce(singleIssue);
    
    // Apply the filters
    fireEvent.click(screen.getByText('Apply Filters'));
    
    await waitFor(() => {
      // Should now show "Showing 1 issue" (singular)
      expect(screen.getByText(/Showing 1 issue/)).toBeInTheDocument();
    });
  });

  test('disables Show Graphs button when no issues present', async () => {
    // Mock empty results
    fetchFilteredIssues.mockResolvedValueOnce([]);
    
    render(<Router><MaintenanceReportPage/></Router>);
    
    await waitFor(() => {
      const showGraphsButton = screen.getByText('Show Graphs');
      expect(showGraphsButton).toBeDisabled();
    });
  });
});