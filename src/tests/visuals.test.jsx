import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FacilitySlideshow from '../components/visuals.jsx';
import '@testing-library/jest-dom';


const mockFacilities = [
  { name: 'Gym', image: 'gym.jpg' },
  { name: 'Swimming Pool', image: 'pool.jpg' },
  { name: 'Basketball Court', image: 'court.jpg' },
];

describe('FacilitySlideshow', () => {
  test('renders the first facility initially', () => {
    render(<FacilitySlideshow facilities={mockFacilities} />);
    expect(screen.getByAltText('Gym')).toBeInTheDocument();
    expect(screen.getByText('Gym')).toBeInTheDocument();
  });

  test('navigates to next facility on right arrow click', () => {
    render(<FacilitySlideshow facilities={mockFacilities} />);
    fireEvent.click(screen.getByRole('button', { name: /go to next slide/i })); // Exact match
    expect(screen.getByAltText('Swimming Pool')).toBeInTheDocument(); // goes to the next facility
  });
  

  test('navigates to previous facility on left arrow click', () => {
    render(<FacilitySlideshow facilities={mockFacilities} />);
    fireEvent.click(screen.getByRole('button', { name: /go to previous slide/i })); // Exact match
    expect(screen.getByAltText('Basketball Court')).toBeInTheDocument(); // wraps around
  });
  
  test('wraps to first slide from last when clicking next', () => {
    render(<FacilitySlideshow facilities={mockFacilities} />);
  
    // Navigate through the slides using the right arrow button
    fireEvent.click(screen.getByRole('button', { name: /go to next slide/i })); // to 1
    fireEvent.click(screen.getByRole('button', { name: /go to next slide/i })); // to 2
    fireEvent.click(screen.getByRole('button', { name: /go to next slide/i })); // wrap to 0
  
    expect(screen.getByAltText('Gym')).toBeInTheDocument();
  });
  

  test('navigates using dot buttons', () => {
    render(<FacilitySlideshow facilities={mockFacilities} />);
    const dots = screen.getAllByRole('button', { name: /view/i });
    fireEvent.click(dots[2]);
    expect(screen.getByAltText('Basketball Court')).toBeInTheDocument();
    fireEvent.click(dots[1]);
    expect(screen.getByAltText('Swimming Pool')).toBeInTheDocument();
  });

  test('applies active class to the current dot', () => {
    render(<FacilitySlideshow facilities={mockFacilities} />);
    const dots = screen.getAllByRole('button', { name: /view/i });
    expect(dots[0]).toHaveClass('active');
    fireEvent.click(dots[1]);
    expect(dots[1]).toHaveClass('active');
  });

  test('returns null if facilities prop is empty', () => {
    const { container } = render(<FacilitySlideshow facilities={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('returns null if facilities prop is not passed', () => {
    const { container } = render(<FacilitySlideshow />);
    expect(container.firstChild).toBeNull();
  });
});
