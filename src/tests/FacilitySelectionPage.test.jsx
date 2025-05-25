import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock useNavigate before importing the component
const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: ({ to }) => <div data-testid="navigate-redirect">{`Redirected to: ${to}`}</div>
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaSwimmer: () => <div data-testid="swimmer-icon">🏊</div>,
  FaDumbbell: () => <div data-testid="dumbbell-icon">🏋️</div>,
  FaFutbol: () => <div data-testid="soccer-icon">⚽</div>,
  FaBasketballBall: () => <div data-testid="basketball-icon">🏀</div>,
  FaBars: ({ onClick }) => <div data-testid="bars-icon" onClick={onClick}>☰</div>
}));

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    })
  };
})();

// Mock localStorage
const localStorageMock = (() => {
  let store = {
    authToken: 'valid-token',
    userType: 'resident'
  };
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    __setStore: (newStore) => {
      store = { ...newStore };
    }
  };
})();

// Replace the global storage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Import the component after setting up mocks
import FacilitiesPage from '../components/resident/FacilitySelection.jsx';

describe('FacilitiesPage Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorageMock.__setStore({
      authToken: 'valid-token',
      userType: 'resident'
    });
    sessionStorageMock.clear();
  });

  test('renders the facility selection page correctly', () => {
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Choose a Facility to Book')).toBeInTheDocument();
    expect(screen.getByText('Select one of the available facilities below')).toBeInTheDocument();
    
    // Check all facility cards are rendered
    expect(screen.getByText('Swimming Pool')).toBeInTheDocument();
    expect(screen.getByText('Gym')).toBeInTheDocument();
    expect(screen.getByText('Soccer Field')).toBeInTheDocument();
    expect(screen.getByText('Basketball Court')).toBeInTheDocument();
    
    // Check all icons are rendered
    expect(screen.getByTestId('swimmer-icon')).toBeInTheDocument();
    expect(screen.getByTestId('dumbbell-icon')).toBeInTheDocument();
    expect(screen.getByTestId('soccer-icon')).toBeInTheDocument();
    expect(screen.getByTestId('basketball-icon')).toBeInTheDocument();
  });

  test('redirects unauthenticated users to home', () => {
    localStorageMock.__setStore({
      authToken: null,
      userType: null
    });

    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate-redirect')).toHaveTextContent('Redirected to: /');
  });

  test('hamburger menu toggles correctly', () => {
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    const hamburgerIcon = screen.getByTestId('bars-icon');
    
    // Menu should not be visible initially
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    
    // Click to open menu
    fireEvent.click(hamburgerIcon);
    
    // Menu should now be visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    
    // Click again to close menu
    fireEvent.click(hamburgerIcon);
    
    // Menu should be hidden again
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  test('sign out clears localStorage and navigates to home', async () => {
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    // Open menu
    fireEvent.click(screen.getByTestId('bars-icon'));
    
    // Click sign out
    fireEvent.click(screen.getByText('Sign Out'));
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userType');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('navigates to home when Home button is clicked', () => {
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('bars-icon'));
    fireEvent.click(screen.getByText('Home'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('sets pool facility in sessionStorage and navigates when Pool Book Now is clicked', () => {
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    const poolButton = screen.getAllByRole('button', { name: /book now/i })[0];
    fireEvent.click(poolButton);
    
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('facility', 'pool');
    expect(mockNavigate).toHaveBeenCalledWith('/calendar');
  });

  test('sets gym facility in sessionStorage and navigates when Gym Book Now is clicked', () => {
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    const gymButton = screen.getAllByRole('button', { name: /book now/i })[1];
    fireEvent.click(gymButton);
    
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('facility', 'gym');
    expect(mockNavigate).toHaveBeenCalledWith('/calendar');
  });

  test('sets soccer facility in sessionStorage and navigates when Soccer Book Now is clicked', () => {
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    const soccerButton = screen.getAllByRole('button', { name: /book now/i })[2];
    fireEvent.click(soccerButton);
    
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('facility', 'soccer');
    expect(mockNavigate).toHaveBeenCalledWith('/calendar');
  });

  test('sets basketball facility in sessionStorage and navigates when Basketball Book Now is clicked', () => {
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    const basketballButton = screen.getAllByRole('button', { name: /book now/i })[3];
    fireEvent.click(basketballButton);
    
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('facility', 'basketball');
    expect(mockNavigate).toHaveBeenCalledWith('/calendar');
  });

  test('component structure uses semantic HTML elements', () => {
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

 

  test('component renders without console errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <MemoryRouter>
        <FacilitiesPage />
      </MemoryRouter>
    );

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});