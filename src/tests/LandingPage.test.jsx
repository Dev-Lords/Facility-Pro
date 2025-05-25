// LandingPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../components/LandingPage.jsx';
import { useNavigate } from 'react-router-dom';

// Mock the router
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

// Mock the image imports
jest.mock('../assets/polish/basketball_court.jpg', () => 'basketball-image-mock');
jest.mock('../assets/polish/Swimming_pools.jpg', () => 'swimming-image-mock');
jest.mock('../assets/polish/Tennis_Courts.jpg', () => 'tennis-image-mock');
jest.mock('../assets/polish/Soccer_field.jpg', () => 'soccer-image-mock');
jest.mock('../assets/polish/Running_track.jpg', () => 'track-image-mock');
jest.mock('../assets/polish/Gymnastics.png', () => 'gymnastics-image-mock');
jest.mock('../assets/polish/Dance_studio.jpg', () => 'dance-image-mock');

describe('LandingPage Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    // Mock timers for handling the slideshow interval
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('renders the landing page correctly', () => {
    render(<LandingPage />);
    
    // Check header elements
    expect(screen.getByText('Facility Pro')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('FAQs')).toBeInTheDocument();
    
    // Check main content
    expect(
      screen.getByText('Facility Pro lets you schedule and manage your local facilities, Hassle Free.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('We want to see communities outside again. Plan sports days, without the headache.')
    ).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    
    // Check sports section
    expect(screen.getByText('Community Sports Made Simple')).toBeInTheDocument();
    expect(screen.getByText('Featured Facilities:')).toBeInTheDocument();
    
    //feature in construction
    /* Check testimonial
    expect(screen.getByText(/Facility Pro transformed how our local basketball league operates/)).toBeInTheDocument();
    expect(screen.getByText(/- Mike J., Community Basketball League Organizer/)).toBeInTheDocument();*/
    
    // Check footer
    expect(screen.getByText(/© 2025 Facility Pro. All rights reserved./)).toBeInTheDocument();
  });
  
  test('navigates to login page when Login button is clicked', () => {
    render(<LandingPage />);
    
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/LoginPage');
  });
  
  test('navigates to signup page when Create Account button is clicked', () => {
    render(<LandingPage />);
    
    const signupButton = screen.getByText('Create Account');
    fireEvent.click(signupButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/SignupPage');
  });
  
  test('renders FacilitySlideshow with initial slide', () => {
    render(<LandingPage />);
    
    // Initial slide should be Basketball Courts
    expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    expect(screen.getByText('Basketball Courts')).toBeInTheDocument();
    
    // Check that all dots are rendered (one for each facility)
    const dots = screen.getAllByRole('button', { name: '' }); // The dots have no accessible name
    expect(dots.length).toBe(7); // 7 facilities in the data
  });
  
  test('changes slide when clicking next arrow', () => {
    render(<LandingPage />);
    
    // First slide is Basketball Courts
    expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    
    // Click next arrow
    const nextArrow = screen.getByText('>');
    fireEvent.click(nextArrow);
    
    // Now should show Swimming Pools
    expect(screen.getByAltText('Swimming Pools')).toBeInTheDocument();
    expect(screen.getByText('Swimming Pools')).toBeInTheDocument();
  });
  
  test('changes slide when clicking previous arrow', () => {
    render(<LandingPage />);
    
    // First slide is Basketball Courts
    expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    
    // Click previous arrow (should wrap to the last slide)
    const prevArrow = screen.getByText('<');
    fireEvent.click(prevArrow);
    
    // Now should show the last slide (Dance Studios)
    expect(screen.getByAltText('Dance Studios')).toBeInTheDocument();
    expect(screen.getByText('Dance Studios')).toBeInTheDocument();
  });
  
  test('changes slide when clicking on dot indicators', () => {
    render(<LandingPage />);
    
    // Get all dot buttons
    const dots = screen.getAllByRole('button', { name: '' });
    
    // Click the third dot (index 2, Tennis Courts)
    fireEvent.click(dots[2]);
    
    // Now should show Tennis Courts
    expect(screen.getByAltText('Tennis Courts')).toBeInTheDocument();
    expect(screen.getByText('Tennis Courts')).toBeInTheDocument();
  });
  
  test('automatically advances slides after timeout', () => {
    render(<LandingPage />);
    
    // First slide is Basketball Courts
    expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    
    // Advance timer by 5 seconds (the auto-advance interval)
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Should now show the second slide (Swimming Pools)
    expect(screen.getByAltText('Swimming Pools')).toBeInTheDocument();
    expect(screen.getByText('Swimming Pools')).toBeInTheDocument();
    
    // Advance timer by another 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Should now show the third slide (Tennis Courts)
    expect(screen.getByAltText('Tennis Courts')).toBeInTheDocument();
    expect(screen.getByText('Tennis Courts')).toBeInTheDocument();
  });
  
  test('dot indicator for current slide has active class', () => {
    render(<LandingPage />);
    
    // Get all dot buttons
    const dots = screen.getAllByRole('button', { name: '' });
    
    // First dot should have active class
    expect(dots[0]).toHaveClass('active');
    
    // Click the third dot (index 2)
    fireEvent.click(dots[2]);
    
    // Third dot should now have active class
    expect(dots[2]).toHaveClass('active');
    // First dot should no longer have active class
    expect(dots[0]).not.toHaveClass('active');
  });
  
  test('slideshow wraps around after reaching the end', () => {
    render(<LandingPage />);
    
    // Get to the last slide by clicking next arrow multiple times
    const nextArrow = screen.getByText('>');
    
    // Click 6 times to reach the last slide (Dance Studios)
    for (let i = 0; i < 6; i++) {
      fireEvent.click(nextArrow);
    }
    
    // Should now show Dance Studios
    expect(screen.getByAltText('Dance Studios')).toBeInTheDocument();
    
    // Click next one more time to wrap around
    fireEvent.click(nextArrow);
    
    // Should now show the first slide again (Basketball Courts)
    expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
  });
  
  test('cleans up interval timer when unmounted', () => {
    const { unmount } = render(<LandingPage />);
    
    // Spy on clearInterval
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    // Unmount the component
    unmount();
    
    // Expect clearInterval to have been called
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    // Clean up the spy
    clearIntervalSpy.mockRestore();
  });
  
  test('link to documentation points to correct URL', () => {
    render(<LandingPage />);
    
    const docLink = screen.getByText('Documentation');
    expect(docLink.getAttribute('href')).toBe('https://dev-lords.github.io/Facility-Pro/#/');
  });
});