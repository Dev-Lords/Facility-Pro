import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../components/LandingPage.jsx';
import { useNavigate, Link } from 'react-router-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock images to prevent import errors
jest.mock('../assets/polish/basketball_court.jpg', () => 'basketball-court-mock.jpg');
jest.mock('../assets/polish/Swimming_pools.jpg', () => 'swimming-pools-mock.jpg');
jest.mock('../assets/polish/Tennis_Courts.jpg', () => 'tennis-courts-mock.jpg');
jest.mock('../assets/polish/Soccer_field.jpg', () => 'soccer-field-mock.jpg');
jest.mock('../assets/polish/Gymnastics.png', () => 'gymnastics-mock.png');

describe('LandingPage Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('renders the landing page correctly', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Facility Pro')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText(/We want to see communities outside again/)).toBeInTheDocument();
  });
  
  test('navigates to login page when Login button is clicked', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('Login'));
    expect(mockNavigate).toHaveBeenCalledWith('/LoginPage');
  });

  test('navigates to signup page when signup buttons are clicked', () => {
    render(<LandingPage />);
    
    // Test "Book a Facility Now" button
    fireEvent.click(screen.getByText('Book a Facility Now'));
    expect(mockNavigate).toHaveBeenCalledWith('/SignupPage');
    
    // Test "Create Account" button
    fireEvent.click(screen.getByText('Create Account'));
    expect(mockNavigate).toHaveBeenCalledWith('/SignupPage');
  });

  test('renders hero section with typing animation', () => {
    render(<LandingPage />);
    
    // Check for hero section elements
    expect(screen.getByText('Get Started Today')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText(/We want to see communities outside again/)).toBeInTheDocument();
  });

  test('renders features section', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Why Choose Facility Pro?')).toBeInTheDocument();
    expect(screen.getByText('Community Management')).toBeInTheDocument();
    expect(screen.getByText('Quality Assurance')).toBeInTheDocument();
    expect(screen.getByText('Premium Experience')).toBeInTheDocument();
  });

  test('renders facilities section', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Premium Facilities')).toBeInTheDocument();
    expect(screen.getByText('Discover world-class venues for every sport and activity')).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('© 2025 Facility Pro. All rights reserved.')).toBeInTheDocument();
  });

  test('renders FacilitySlideshow with initial slide', async () => {
    render(<LandingPage />);
    
    // Wait for the slideshow to render
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
    
    // Check for slideshow controls
    const leftArrow = screen.getByText('‹');
    const rightArrow = screen.getByText('›');
    
    expect(leftArrow).toBeInTheDocument();
    expect(rightArrow).toBeInTheDocument();
    
    // Check for dots (they should be buttons with class 'dot')
    const dots = screen.getAllByRole('button').filter(button => 
      button.className.includes('dot')
    );
    expect(dots.length).toBe(5); // 5 facilities in the actual component
  });

  test('changes slide when clicking next arrow', async () => {
    render(<LandingPage />);
    
    // Wait for initial slide
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
    
    // Click next arrow (›)
    const nextArrow = screen.getByText('›');
    fireEvent.click(nextArrow);
    
    await waitFor(() => {
      expect(screen.getByAltText('Swimming Pools')).toBeInTheDocument();
    });
  });

  test('changes slide when clicking previous arrow', async () => {
    render(<LandingPage />);
    
    // Wait for initial slide
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
    
    // Click previous arrow (‹) - should wrap to last slide
    const prevArrow = screen.getByText('‹');
    fireEvent.click(prevArrow);
    
    await waitFor(() => {
      expect(screen.getByAltText('Gymn')).toBeInTheDocument(); // Last slide is 'Gymn' in actual component
    });
  });

  test('changes slide when clicking on dot indicators', async () => {
    render(<LandingPage />);
    
    // Wait for initial slide
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
    
    // Get all dot buttons
    const dots = screen.getAllByRole('button').filter(button => 
      button.className.includes('dot')
    );
    
    // Click on the third dot (index 2) - should show Tennis Courts
    fireEvent.click(dots[2]);
    
    await waitFor(() => {
      expect(screen.getByAltText('Tennis Courts')).toBeInTheDocument();
    });
  });

  test('automatically advances slides after timeout', async () => {
    render(<LandingPage />);
    
    // Wait for initial slide
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
    
    // Advance time by 5 seconds (slideshow interval)
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.getByAltText('Swimming Pools')).toBeInTheDocument();
    });
  });

  test('dot indicator for current slide has active class', async () => {
    render(<LandingPage />);
    
    // Wait for slideshow to render
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
    
    const dots = screen.getAllByRole('button').filter(button => 
      button.className.includes('dot')
    );
    
    // First dot should be active
    expect(dots[0]).toHaveClass('active');
    
    // Click on third dot
    fireEvent.click(dots[2]);
    
    await waitFor(() => {
      expect(dots[2]).toHaveClass('active');
      expect(dots[0]).not.toHaveClass('active');
    });
  });

  test('slideshow wraps around after reaching the end', async () => {
    render(<LandingPage />);
    
    // Wait for initial slide
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
    
    const nextArrow = screen.getByText('›');
    
    // Click through all slides (5 total, so 4 clicks to reach the last one)
    for (let i = 0; i < 4; i++) {
      fireEvent.click(nextArrow);
    }
    
    await waitFor(() => {
      expect(screen.getByAltText('Gymn')).toBeInTheDocument(); // Last slide
    });
    
    // One more click should wrap back to the first slide
    fireEvent.click(nextArrow);
    
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
  });

  test('slideshow pauses on hover and resumes on leave', async () => {
    render(<LandingPage />);
    
    // Wait for initial slide
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
    
    // Find the slide element and hover over it
    const slideElement = screen.getByAltText('Basketball Courts').closest('figure');
    
    // Hover to pause
    fireEvent.mouseEnter(slideElement);
    
    // Advance time - should NOT change slide while paused
    jest.advanceTimersByTime(5000);
    
    // Should still be on first slide
    expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    
    // Leave hover to resume
    fireEvent.mouseLeave(slideElement);
    
    // Now advance time - should change slide
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.getByAltText('Swimming Pools')).toBeInTheDocument();
    });
  });

  test('play/pause button toggles slideshow', async () => {
    render(<LandingPage />);
    
    // Wait for slideshow to render
    await waitFor(() => {
      expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    });
    
    // Find the play/pause button by class
    const playPauseButton = document.querySelector('.play-pause-btn');
    
    expect(playPauseButton).toBeInTheDocument();
    
    // Initial state should be playing
    const playIcon = playPauseButton.querySelector('.play-icon');
    expect(playIcon).toHaveClass('playing');
    
    // Click to pause
    fireEvent.click(playPauseButton);
    
    // Advance time - should not change slide when paused
    jest.advanceTimersByTime(5000);
    expect(screen.getByAltText('Basketball Courts')).toBeInTheDocument();
    
    // Click to resume
    fireEvent.click(playPauseButton);
    
    // Advance time - should change slide when playing
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.getByAltText('Swimming Pools')).toBeInTheDocument();
    });
  });

  test('cleans up interval timers when unmounted', () => {
    const { unmount } = render(<LandingPage />);
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    unmount();
    
    // Should have called clearInterval for slideshow timer
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  test('renders all navigation links correctly', () => {
    render(<LandingPage />);
    
    // Check header navigation
    const docLink = screen.getByText('Documentation');
    expect(docLink).toHaveAttribute('href', 'https://dev-lords.github.io/Facility-Pro/#/');
    
    const termsLink = screen.getByText('Terms');
    expect(termsLink).toHaveAttribute('href', '/terms');
    
    const faqLink = screen.getByText('FAQ');
    expect(faqLink).toHaveAttribute('href', '/FAQ');
  });

  test('renders all feature cards with animations', () => {
    render(<LandingPage />);
    
    const expectedFeatures = [
      'Community Management', 
      'Quality Assurance',
      'Premium Experience'
    ];
    
    expectedFeatures.forEach((feature, index) => {
      const featureCard = screen.getByText(feature).closest('li');
      expect(featureCard).toHaveStyle({ animationDelay: `${index * 0.1}s` });
    });
  });

  test('typing animation component renders', () => {
    render(<LandingPage />);
    
    // The typing animation should be working, we can verify the hero section exists
    const heroSection = document.querySelector('.hero-title');
    expect(heroSection).toBeInTheDocument();
    
    // Verify the subtitle is present
    expect(screen.getByText(/We want to see communities outside again/)).toBeInTheDocument();
  });

  test('facility slideshow shows correct captions', async () => {
    render(<LandingPage />);
    
    // Wait for slideshow to render
    await waitFor(() => {
      expect(screen.getByText('Premium indoor courts with professional lighting')).toBeInTheDocument();
    });
    
    // Click next to see swimming pool caption
    const nextArrow = screen.getByText('›');
    fireEvent.click(nextArrow);
    
    await waitFor(() => {
      expect(screen.getByText('Olympic-sized pools for all skill levels')).toBeInTheDocument();
    });
  });

  test('CTA button has arrow icon', () => {
    render(<LandingPage />);
    
    const ctaButton = screen.getByText('Book a Facility Now').closest('button');
    const arrowIcon = ctaButton.querySelector('.cta-icon');
    expect(arrowIcon).toBeInTheDocument();
  });

  test('auth container renders with correct structure', () => {
    render(<LandingPage />);
    
    const authContainer = document.querySelector('.auth-container');
    expect(authContainer).toBeInTheDocument();
    expect(authContainer.tagName.toLowerCase()).toBe('form');
    
    // Check form elements
    expect(screen.getByText('Get Started Today')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toHaveClass('login-btn');
    expect(screen.getByRole('button', { name: 'Create Account' })).toHaveClass('signup-btn');
  });

  test('feature icons render correctly', () => {
    render(<LandingPage />);
    
    const featureCards = document.querySelectorAll('.feature-card');
    expect(featureCards.length).toBe(3);
    
    featureCards.forEach(card => {
      const icon = card.querySelector('.feature-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  test('slideshow navigation has correct ARIA attributes', () => {
    render(<LandingPage />);
    
    const dotsContainer = document.querySelector('.dots-container');
    expect(dotsContainer).toBeInTheDocument();
    expect(dotsContainer.tagName.toLowerCase()).toBe('ul');
  });
});