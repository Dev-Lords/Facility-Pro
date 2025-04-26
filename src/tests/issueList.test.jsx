import { render, screen } from '@testing-library/react';
import IssuesPageList from '../components/staff/IssuesPageList';  // Adjust the import path if necessary
import { DataGrid } from '@mui/x-data-grid';
import '@testing-library/jest-dom';
import React from 'react';

// Mocking the DataGrid component to avoid rendering the full component
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns, pageSize, getRowId }) => (
    <div data-testid="mock-data-grid">
      {rows.map((row) => (
        <div key={getRowId(row)}>{row.issueTitle}</div>
      ))}
    </div>
  ),
}));

describe('IssuesPageList Component', () => {
  const mockIssues = [
    { issueID: '1', issueTitle: 'Broken Pipe', issueStatus: 'Pending' },
    { issueID: '2', issueTitle: 'Leaky Roof', issueStatus: 'In-Progress' },
    { issueID: '3', issueTitle: 'Broken Elevator', issueStatus: 'Resolved' },
  ];

  test('renders the list of issues', () => {
    render(<IssuesPageList issues={mockIssues} />);

    // Check if the titles of the issues are rendered
    mockIssues.forEach((issue) => {
      expect(screen.getByText(issue.issueTitle)).toBeInTheDocument();
    });
  });


});
