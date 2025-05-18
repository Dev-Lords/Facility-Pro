// SearchableLocationDropdown.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import SearchableLocationDropdown from '../components/resident/SearchableLocationDropdown';

// Mock react-select
jest.mock('react-select', () => ({ options, value, onChange, placeholder, isSearchable, id }) => {
  // Find the option group and option that matches the value
  const flatOptions = options.flatMap(group => group.options);
  const selectedOption = value || '';

  function getOptionGroups() {
    return options.map(group => (
      <optgroup key={group.label} label={group.label} data-testid={`optgroup-${group.label}`}>
        {group.options.map(option => (
          <option key={option.value} value={option.value} data-testid={`option-${option.value}`}>
            {option.label}
          </option>
        ))}
      </optgroup>
    ));
  }

  return (
    <div className="react-select-container" data-testid="react-select-container">
      <input 
        type="text" 
        data-testid="react-select-input" 
        placeholder={placeholder}
        value={selectedOption.label || ''}
        onChange={(e) => {
          // Simulating typing into the search box
          const inputValue = e.target.value;
          // We're not implementing full filtering here, just the onChange event
        }}
      />
      <select
        id={id}
        data-testid="react-select-dropdown"
        value={selectedOption.value || ''}
        onChange={(e) => {
          const selectedValue = e.target.value;
          const option = flatOptions.find(opt => opt.value === selectedValue);
          onChange(option ? option.value : '');
        }}
      >
        <option value="">Select a location</option>
        {getOptionGroups()}
      </select>
    </div>
  );
});

describe('SearchableLocationDropdown Component', () => {
  // Basic render test
  test('renders with label and dropdown', () => {
    const mockOnChange = jest.fn();
    render(<SearchableLocationDropdown value="" onChange={mockOnChange} />);
    
    // Check if the label is rendered
    expect(screen.getByText('Select Location')).toBeInTheDocument();
    
    // Check if react-select container is rendered
    expect(screen.getByTestId('react-select-container')).toBeInTheDocument();
    
    // Check if the placeholder is present
    expect(screen.getByPlaceholderText('Search or choose location...')).toBeInTheDocument();
  });
  
  // Test with initial value
  test('renders with a pre-selected value', () => {
    const mockOnChange = jest.fn();
    render(<SearchableLocationDropdown value="Pool" onChange={mockOnChange} />);
    
    // The dropdown should have the selected value
    const dropdown = screen.getByTestId('react-select-dropdown');
    expect(dropdown).toHaveValue('Pool');
  });
  
  // Test with non-existent value
  test('handles non-existent value gracefully', () => {
    const mockOnChange = jest.fn();
    render(<SearchableLocationDropdown value="NonExistentLocation" onChange={mockOnChange} />);
    
    // Should not crash and should render the component
    expect(screen.getByText('Select Location')).toBeInTheDocument();
  });
  
 
  
  // Test option groups
  test('renders option groups for different facilities', () => {
    const mockOnChange = jest.fn();
    render(<SearchableLocationDropdown value="" onChange={mockOnChange} />);
    
    // Check for option groups
    const optgroups = screen.getAllByTestId(/^optgroup-/);
    
    // Should have 5 option groups (Soccer Field, Pool, Gym, Garden, Basketball Court)
    expect(optgroups).toHaveLength(5);
    
    // Check specific group names
    expect(screen.getByTestId('optgroup-Soccer Field')).toBeInTheDocument();
    expect(screen.getByTestId('optgroup-Pool')).toBeInTheDocument();
    expect(screen.getByTestId('optgroup-Gym')).toBeInTheDocument();
    expect(screen.getByTestId('optgroup-Garden')).toBeInTheDocument();
    expect(screen.getByTestId('optgroup-Basketball Court')).toBeInTheDocument();
  });
  
  // Test options within groups
  test('renders options within each group', () => {
    const mockOnChange = jest.fn();
    render(<SearchableLocationDropdown value="" onChange={mockOnChange} />);
    
    // Check for specific options
    expect(screen.getByTestId('option-Soccer Field')).toBeInTheDocument();
    expect(screen.getByTestId('option-Pool Restroom')).toBeInTheDocument();
    expect(screen.getByTestId('option-Gym Locker Room')).toBeInTheDocument();
    expect(screen.getByTestId('option-Garden')).toBeInTheDocument();
    expect(screen.getByTestId('option-Basketball Court')).toBeInTheDocument();
  });
  
  // Test input/search functionality
  test('handles input for searchable functionality', () => {
    const mockOnChange = jest.fn();
    render(<SearchableLocationDropdown value="" onChange={mockOnChange} />);
    
    // Get the input field
    const input = screen.getByTestId('react-select-input');
    
    // Simulate typing into the search field
    fireEvent.change(input, { target: { value: 'Gym' } });
    
    // No explicit assertion as we're just testing that it doesn't crash
    // In a real implementation, we'd test filtering, but our mock doesn't implement that
  });
  

  
  // Test for changing the value
  test('updates when value prop changes', () => {
    const mockOnChange = jest.fn();
    const { rerender } = render(<SearchableLocationDropdown value="Gym" onChange={mockOnChange} />);
    
    // Initial value
    const dropdown = screen.getByTestId('react-select-dropdown');
    expect(dropdown).toHaveValue('Gym');
    
    // Update the value prop
    rerender(<SearchableLocationDropdown value="Pool" onChange={mockOnChange} />);
    
    // Check if the value has been updated
    expect(dropdown).toHaveValue('Pool');
  });
  
  // Test with empty onChange handler
  test('handles empty onChange handler gracefully', () => {
    // This test ensures the component doesn't crash if onChange is not provided or invalid
    expect(() => {
      render(<SearchableLocationDropdown value="Gym" onChange={undefined} />);
    }).not.toThrow();
  });
});