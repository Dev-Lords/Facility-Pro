// 👇 MUST go at the top of the file BEFORE imports
jest.mock('jspdf', () => {
  const jsPDF = jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    addImage: jest.fn(),
    save: mockSave,
    setFontSize: jest.fn(),
  }));
  return { __esModule: true, default: jsPDF };
});

jest.mock('jspdf-autotable', () => jest.fn());

const mockSave = jest.fn();


import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import UsageTrends from '../components/admin/UsageTrends.jsx';
import '@testing-library/jest-dom';

// Enhanced mocks
jest.mock('../../backend/services/logService.js', () => ({
  fetchFacilityEvents: jest.fn(),
  fetchMonthSummaryStats: jest.fn()
}));




jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell"></div>,
  Sector: () => <div data-testid="sector"></div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>
}));

// Mock file download functions
global.URL.createObjectURL = jest.fn();
global.Blob = jest.fn((content) => ({ content }));

describe('UsageTrends Component', () => {
  const mockStats = {
    bookingsPieChart: [{ name: 'gym', value: 60 }, { name: 'soccer', value: 40 }],
    issuesPieChart: [{ name: 'pool', value: 100 }],
    totalBookings: 150,
    totalIssues: 50,
    bookingsChange: '+10',
    issuesChange: '+5'
  };

  const mockLogs = [
    {
      id: '1',
      facilityId: 'gym',
      eventType: 'booking',
      timestamp: { seconds: Date.now() / 1000 }
    }
  ];

  beforeAll(() => {
    // Mock canvas operations
    global.URL.createObjectURL = jest.fn();
    global.Blob = jest.fn((content) => ({ content }));
    
    // Mock image loading
    global.Image = class {
      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 100);
      }
    };
  });





  // Add this to your mocks
global.XMLSerializer = class {
  serializeToString = jest.fn().mockImplementation((node) => '<svg></svg>');
};

  beforeEach(() => {
    jest.clearAllMocks();
    require('../../backend/services/logService.js').fetchMonthSummaryStats.mockResolvedValue(mockStats);
    require('../../backend/services/logService.js').fetchFacilityEvents.mockResolvedValue(mockLogs);
  });

  it('renders without errors', async () => {
    render(<UsageTrends />);
    await waitFor(() => {
      expect(screen.getByText('Facility Trends Overview')).toBeInTheDocument();
    });
  });

  it('displays initial empty state correctly', async () => {
    render(<UsageTrends />);
    
    // Get all h4 elements and check their content
    const h4Elements = screen.getAllByRole('heading', { level: 4 });
    h4Elements.forEach(element => {
      expect(element.textContent.trim()).toBe('');
    });
    
    // Check that "No Logs found" is displayed
    expect(screen.getByText('No Logs found')).toBeInTheDocument();
  });
  
  it('displays statistics after loading', async () => {
    render(<UsageTrends />);
    await waitFor(() => {
      expect(screen.getByText('Total Bookings This Month:')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('+10')).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    require('../../backend/services/logService.js').fetchMonthSummaryStats.mockRejectedValue(new Error('API Error'));
    render(<UsageTrends />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
      // Verify fallback data is also displayed
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      require('../../backend/services/logService.js').fetchFacilityEvents.mockResolvedValue([
        {
          id: '1',
          facilityId: 'gym',
          eventType: 'booking',
          timestamp: { seconds: new Date('2025-05-10').getTime() / 1000 }
        },
        {
          id: '2',
          facilityId: 'pool',
          eventType: 'issue',
          timestamp: { seconds: new Date('2025-05-15').getTime() / 1000 }
        }
      ]);
    });
  
    it('filters logs by facility', async () => {
      render(<UsageTrends />);
      
      // Wait for table to render
      await screen.findByRole('table');
      
      // Find the facility filter - try different queries if needed
      const facilityFilter = screen.getByRole('combobox', { name: /facility/i }) || 
                           screen.getByLabelText(/facility/i) ||
                           document.querySelector('select:nth-of-type(2)');
      
      if (!facilityFilter) {
        throw new Error('Could not find facility filter element');
      }
      
      // Filter by gym facility
      fireEvent.change(facilityFilter, {
        target: { value: 'gym' }
      });
      
      // Verify results
      await waitFor(() => {
        expect(screen.getByText('gym')).toBeInTheDocument();
        expect(screen.queryByText('pool')).not.toBeInTheDocument();
      });
    });
  
    // Alternative approach if combobox role isn't working
    it('filters logs by facility using test ID', async () => {
      render(<UsageTrends />);
      
      await screen.findByRole('table');
      
      // Add test-id to your select element in the component:
      // <select data-testid="facility-filter" ...>
      const facilityFilter = screen.getByTestId('facility-filter');
      
      fireEvent.change(facilityFilter, {
        target: { value: 'gym' }
      });
      
      await waitFor(() => {
        expect(screen.getByText('gym')).toBeInTheDocument();
      });
    });
  });


  it('exports CSV when button is clicked', async () => {
    render(<UsageTrends />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Export as CSV'));
      expect(global.Blob).toHaveBeenCalled();
    });
  });



  it('triggers PDF export', async () => {
    const jsPDF = require('jspdf').default;
    const mockInstance = new jsPDF();
    render(<UsageTrends />);
  
    // Click the export button
    await waitFor(() => {
      expect(screen.getByText('Export As PDF')).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText('Export As PDF'));
  
    await waitFor(() => {
      expect(mockInstance.save).toHaveBeenCalled();
    });
  }, 10000);
  

  it('shows "No Logs found" when filtered results are empty', async () => {
    require('../../backend/services/logService.js').fetchFacilityEvents.mockResolvedValue([]);
    render(<UsageTrends />);
    await waitFor(() => {
      expect(screen.getByText('No Logs found')).toBeInTheDocument();
    });
  });

  it('renders fallback data when API returns empty arrays', async () => {
    // Mock empty data response
    require('../../backend/services/logService.js').fetchMonthSummaryStats.mockResolvedValue({
      bookingsPieChart: [],
      totalBookings: 0,
      totalIssues: 0,
      bookingsChange: '+0',
      issuesChange: '+0'
    });
  
    render(<UsageTrends />);
    
    // Check that summary values show 0
    await waitFor(() => {
      expect(screen.getAllByRole('heading', { level: 4 })[0]).toHaveTextContent('0');
      expect(screen.getAllByRole('heading', { level: 4 })[1]).toHaveTextContent('0');
    });
  
    // Check that the fallback pie charts are rendered
    // Note: We can't directly check the text because it's rendered in SVG elements
    // Instead, we'll verify the mocked chart components are rendered
    expect(screen.getAllByTestId('pie-chart')).toHaveLength(1);
    expect(screen.getAllByTestId('pie')).toHaveLength(1);
  });

  describe('Basic Rendering', () => {
    it('renders the main component without crashing', async () => {
      render(<UsageTrends />);
      await waitFor(() => {
        expect(screen.getByText('Facility Trends Overview')).toBeInTheDocument();
      });
    });
  
    it('displays  pie chart sections', async () => {
      render(<UsageTrends />);
      await waitFor(() => {
        expect(screen.getByText('Proportion of Bookings by Facility')).toBeInTheDocument();
      });
    });
  
    it('shows both summary cards', async () => {
      render(<UsageTrends />);
      await waitFor(() => {
        expect(screen.getByText('Total Bookings This Month:')).toBeInTheDocument();
        expect(screen.getByText('Total Issues Reported This Month:')).toBeInTheDocument();
      });
    });
  });


  describe('Trend Indicators', () => {
    it('shows upward trend for positive change', async () => {
      require('../../backend/services/logService.js').fetchMonthSummaryStats.mockResolvedValue({
        ...mockStats,
        bookingsChange: "+10",
        issuesChange: "+5" // Make sure both changes are positive
      });
      
      render(<UsageTrends />);
      
      await waitFor(() => {
        // Get all trend indicators and verify they show upward trend
        const trendIndicators = screen.getAllByText('↑');
        expect(trendIndicators.length).toBe(2); // One for bookings, one for issues
        trendIndicators.forEach(indicator => {
          expect(indicator).toHaveClass('trend-up');
        });
      });
    });
  
    it('shows downward trend for negative change', async () => {
      require('../../backend/services/logService.js').fetchMonthSummaryStats.mockResolvedValue({
        ...mockStats,
        bookingsChange: "-5",
        issuesChange: "-2" // Make sure both changes are negative
      });
      
      render(<UsageTrends />);
      
      await waitFor(() => {
        const trendIndicators = screen.getAllByText('↓');
        expect(trendIndicators.length).toBe(2);
        trendIndicators.forEach(indicator => {
          expect(indicator).toHaveClass('trend-down');
        });
      });
    });
  });

  describe('Pie Chart Rendering', () => {
    it('renders booking pie chart with data', async () => {
      render(<UsageTrends />);
      await waitFor(() => {
        expect(screen.getByTestId('bookings-chart')).toBeInTheDocument();
        expect(screen.getAllByTestId('cell')).toHaveLength(2); // 2 data points + fallback
      });
    });
  
  
  });

});


it('renders pie charts with empty data', async () => {
  // Mock empty data response
  require('../../backend/services/logService.js').fetchMonthSummaryStats.mockResolvedValue({
    bookingsPieChart: [],
    totalBookings: 0,
    totalIssues: 0,
    bookingsChange: "+0",
    issuesChange: "+0"
  });

  render(<UsageTrends />);

  await waitFor(() => {
    // Verify both charts are rendered
    const bookingChart = screen.getByTestId('bookings-chart');
    expect(bookingChart).toBeInTheDocument();

    // Verify the actual fallback behavior
    // Option 1: Check for fallback data in the pie charts
    const cells = screen.getAllByTestId('cell');
    expect(cells.length).toBe(2); // One for each chart's fallback data
    
    // Option 2: Check for the "No Data" text if implemented
    try {
      expect(screen.getAllByText(/no data/i)).toHaveLength(2);
    } catch {
      // If text isn't implemented, verify via legend
      const legends = screen.getAllByTestId('legend');
      expect(legends.length).toBe(1);
    }
  });
});

it('displays correct data in the logs table', async () => {
    // Mock data with specific values we can test against
    const mockLogs = [
      {
        id: 'log-1',
        facilityId: 'gym',
        eventType: 'booking',
        timestamp: { seconds: new Date('2025-05-10T10:00:00').getTime() / 1000 }
      },
      {
        id: 'log-2',
        facilityId: 'pool',
        eventType: 'issue',
        timestamp: { seconds: new Date('2025-05-15T14:30:00').getTime() / 1000 }
      }
    ];

    // Mock the service to return our test data
    require('../../backend/services/logService').fetchFacilityEvents.mockResolvedValue(mockLogs);

    render(<UsageTrends />);

    // Wait for the component to finish loading data
    await waitFor(() => {
      expect(screen.queryByText('Loading logs...')).not.toBeInTheDocument();
    });

    // Verify table headers
    expect(screen.getByRole('columnheader', { name: /event type/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /facility/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /occured at/i })).toBeInTheDocument();

    // Wait for the log rows to be rendered
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(mockLogs.length + 1); // +1 for header row
    });

    // Verify table rows contain expected data
    const rows = screen.getAllByRole('row');

    // Test first log entry (row index 1 because index 0 is header)
    expect(within(rows[1]).getByText('booking')).toBeInTheDocument();
    expect(within(rows[1]).getByText('gym')).toBeInTheDocument();
    expect(within(rows[1]).getByText('5/10/2025')).toBeInTheDocument();

    // Test second log entry
    expect(within(rows[2]).getByText('issue')).toBeInTheDocument();
    expect(within(rows[2]).getByText('pool')).toBeInTheDocument();
    expect(within(rows[2]).getByText('5/15/2025')).toBeInTheDocument();
  });


