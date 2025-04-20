// LoginPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../components/LoginPage.jsx';
import { signInWithGoogle, signInWithEmailAndPassword } from '../../backend/auth/firebase-auth.js';
import { getUserByUid, saveUser, getUserType } from '../../backend/services/userServices.js';
import { useNavigate } from 'react-router-dom';

// Mock the modules
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

jest.mock('../../backend/auth/firebase-auth', () => ({
  signInWithGoogle: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
}));

jest.mock('../../backend/services/userServices', () => ({
  getUserByUid: jest.fn(),
  saveUser: jest.fn(),
  getUserType: jest.fn()
}));

describe('LoginPage Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock navigate
    useNavigate.mockReturnValue(mockNavigate);
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });
  
  test('renders login form correctly', () => {
    render(<LoginPage />);
    
    // Check if main elements are rendered
    expect(screen.getByText('Facility Pro')).toBeInTheDocument();
    expect(screen.getByText('Plan sport days, without the headache!')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });
  
  test('handles email and password input changes', () => {
    render(<LoginPage />);
    
    // Get form inputs
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    // Simulate user typing
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Check if values were updated
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });
  
  test('handles email/password login success for resident', async () => {
    // Set up mocks for successful login
    const mockUser = {
      uid: 'user123',
      getIdToken: jest.fn().mockResolvedValue('mock-token')
    };
    
    signInWithEmailAndPassword.mockResolvedValue(mockUser);
    getUserType.mockResolvedValue('resident');
    
    render(<LoginPage />);
    
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Sign In'));
    
    // Wait for async operations to complete
    await waitFor(() => {
      // Check if functions were called correctly
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(getUserType).toHaveBeenCalledWith('user123');
      expect(mockUser.getIdToken).toHaveBeenCalled();
      
      // Check localStorage values
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('userType', 'resident');
      expect(localStorage.setItem).toHaveBeenCalledWith('userID', 'user123');
      
      // Check navigation
      expect(mockNavigate).toHaveBeenCalledWith('/resident-home');
    });
  });
  
  test('handles email/password login success for admin', async () => {
    // Set up mocks for successful admin login
    const mockUser = {
      uid: 'admin123',
      getIdToken: jest.fn().mockResolvedValue('mock-token')
    };
    
    signInWithEmailAndPassword.mockResolvedValue(mockUser);
    getUserType.mockResolvedValue('admin');
    
    render(<LoginPage />);
    
    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin-home');
    });
  });
  
  test('handles email/password login success for staff', async () => {
    // Set up mocks for successful staff login
    const mockUser = {
      uid: 'staff123',
      getIdToken: jest.fn().mockResolvedValue('mock-token')
    };
    
    signInWithEmailAndPassword.mockResolvedValue(mockUser);
    getUserType.mockResolvedValue('staff');
    
    render(<LoginPage />);
    
    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'staff@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'staff123' } });
    fireEvent.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/staff-home');
    });
  });
  
  test('handles email/password login error', async () => {
    // Set up mock for failed login
    const errorMessage = 'Invalid email or password';
    signInWithEmailAndPassword.mockRejectedValue({ message: errorMessage });
    
    render(<LoginPage />);
    
    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
  
  test('handles Google sign-in for new resident user', async () => {
    // Set up mocks for successful Google login
    const mockUser = {
      uid: 'google123',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: 'https://example.com/photo.jpg',
      phoneNumber: '123-456-7890',
      providerId: 'google.com',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('mock-google-token')
    };
    
    signInWithGoogle.mockResolvedValue({ user: mockUser });
    getUserByUid.mockResolvedValue(null); // User doesn't exist yet
    
    render(<LoginPage />);
    
    // Click Google sign-in button
    fireEvent.click(screen.getByText('Continue with Google'));
    
    await waitFor(() => {
      // Check user was saved with correct data
      expect(saveUser).toHaveBeenCalledWith(expect.objectContaining({
        uid: 'google123',
        email: 'google@example.com',
        user_type: 'resident' // Default for new users
      }));
      
      expect(localStorage.setItem).toHaveBeenCalledWith('userType', 'resident');
      expect(mockNavigate).toHaveBeenCalledWith('/resident-home');
    });
  });
  
  test('handles Google sign-in for existing admin user', async () => {
    // Set up mocks for Google login of existing admin
    const mockUser = {
      uid: 'admin123',
      email: 'admin@example.com',
      displayName: 'Admin User',
      photoURL: 'https://example.com/admin.jpg',
      phoneNumber: '123-456-7890',
      providerId: 'google.com',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('mock-admin-token')
    };
    
    signInWithGoogle.mockResolvedValue({ user: mockUser });
    getUserByUid.mockResolvedValue({ user_type: 'admin' }); // User exists as admin
    
    render(<LoginPage />);
    
    // Click Google sign-in button
    fireEvent.click(screen.getByText('Continue with Google'));
    
    await waitFor(() => {
      // Check user was saved with correct type
      expect(saveUser).toHaveBeenCalledWith(expect.objectContaining({
        uid: 'admin123',
        user_type: 'admin' // Preserves existing user type
      }));
      
      expect(localStorage.setItem).toHaveBeenCalledWith('userType', 'admin');
      expect(mockNavigate).toHaveBeenCalledWith('/admin-home');
    });
  });
  
  test('handles Google sign-in error', async () => {
    // Set up mock for failed Google login
    const errorMessage = 'Google authentication failed';
    signInWithGoogle.mockRejectedValue(new Error(errorMessage));
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<LoginPage />);
    
    // Click Google sign-in button
    fireEvent.click(screen.getByText('Continue with Google'));
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error signing in: ', 
        expect.any(Error)
      );
    });
    
    // Restore console.error
    console.error.mockRestore();
  });
});