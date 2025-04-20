import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from '../components/SignupPage.jsx';
import { MemoryRouter } from 'react-router-dom';
import * as authModule from '../../backend/auth/firebase-auth.js';
import * as userModel from '../../backend/models/user.js';
import '@testing-library/jest-dom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Firebase auth functions
jest.mock('../../backend/auth/firebase-auth.js', () => ({
  signInWithGoogle: jest.fn(),
  signUpWithEmailAndPassword: jest.fn(),
}));

// Mock user model functions
jest.mock('../../backend/models/user.js', () => ({
  User: {
    saveUser: jest.fn(),
    getUserType: jest.fn(),
  },
}));

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders all form fields', () => {
    renderWithRouter(<SignupPage />);
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
  });

  test('handles input changes', () => {
    renderWithRouter(<SignupPage />);
    const nameInput = screen.getByPlaceholderText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');
  });

  test('submits form with valid data', async () => {
    const mockUserCredential = {
      user: { uid: '123', email: 'test@example.com' },
    };
    authModule.signUpWithEmailAndPassword.mockResolvedValue(mockUserCredential);

    renderWithRouter(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() => {
      expect(authModule.signUpWithEmailAndPassword).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/LoginPage');
    });
  });

  test('shows error message when signUpWithEmailAndPassword fails', async () => {
    authModule.signUpWithEmailAndPassword.mockRejectedValue(new Error('Signup failed'));

    renderWithRouter(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() => {
      expect(screen.getByText(/signup failed/i)).toBeInTheDocument();
    });
  });

  test('handles Google sign up', async () => {
    const mockUser = {
      uid: 'google-uid',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: '',
      phoneNumber: '',
      providerId: 'google.com',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('token123'),
    };

    authModule.signInWithGoogle.mockResolvedValue({ user: mockUser });
    userModel.User.getUserType.mockResolvedValue('resident');

    renderWithRouter(<SignupPage />);
    fireEvent.click(screen.getByText(/continue with google/i));

    await waitFor(() => {
      expect(authModule.signInWithGoogle).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/resident-home');
    });
  });

  test('calls User.saveUser with correct Google user data', async () => {
    const mockUser = {
      uid: 'google-uid',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: '',
      phoneNumber: '',
      providerId: 'google.com',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('token123'),
    };

    authModule.signInWithGoogle.mockResolvedValue({ user: mockUser });
    userModel.User.getUserType.mockResolvedValue('resident');

    renderWithRouter(<SignupPage />);
    fireEvent.click(screen.getByText(/continue with google/i));

    await waitFor(() => {
      expect(userModel.User.saveUser).toHaveBeenCalledWith(expect.objectContaining({
        uid: 'google-uid',
        email: 'google@example.com',
        displayName: 'Google User',
        user_type: 'resident',
      }));
    });
  });

  test('stores token in localStorage after Google sign up', async () => {
    const mockUser = {
      uid: 'google-uid',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: '',
      phoneNumber: '',
      providerId: 'google.com',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('tokenXYZ'),
    };

    authModule.signInWithGoogle.mockResolvedValue({ user: mockUser });
    userModel.User.getUserType.mockResolvedValue('resident');

    renderWithRouter(<SignupPage />);
    fireEvent.click(screen.getByText(/continue with google/i));

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('tokenXYZ');
    });
  });

  test('redirects admin to /admin-home', async () => {
    const mockUser = {
      uid: 'admin-uid',
      email: 'admin@example.com',
      displayName: 'Admin User',
      photoURL: '',
      phoneNumber: '',
      providerId: 'google.com',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('token123'),
    };

    authModule.signInWithGoogle.mockResolvedValue({ user: mockUser });
    userModel.User.getUserType.mockResolvedValue('admin');

    renderWithRouter(<SignupPage />);
    fireEvent.click(screen.getByText(/continue with google/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin-home');
    });
  });

  test('redirects staff to /staff-home', async () => {
    const mockUser = {
      uid: 'staff-uid',
      email: 'staff@example.com',
      displayName: 'Staff User',
      photoURL: '',
      phoneNumber: '',
      providerId: 'google.com',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('token123'),
    };

    authModule.signInWithGoogle.mockResolvedValue({ user: mockUser });
    userModel.User.getUserType.mockResolvedValue('staff');

    renderWithRouter(<SignupPage />);
    fireEvent.click(screen.getByText(/continue with google/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/staff-home');
    });
  });
});
