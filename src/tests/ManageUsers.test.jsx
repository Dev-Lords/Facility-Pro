import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageUsers from '../components/admin/ManageUsers.jsx';
import { db } from '../../backend/firebase/firebase.config.js';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { fetchAllUsers } from '../../backend/services/userServices.js';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock Firebase and other dependencies
jest.mock('../../backend/firebase/firebase.config.js', () => ({}));
jest.mock('firebase/firestore');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Update the mock at the top of your test file
jest.mock('../../backend/services/userServices.js', () => ({
    fetchAllUsers: jest.fn(),
    updateUserType: jest.fn(),
    createAccountRequest: jest.fn().mockResolvedValue({}),
    deleteAccount: jest.fn(),
  }));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Pencil: () => <span>PencilIcon</span>,
    Trash2: () => <span>TrashIcon</span>,
    Filter: () => <span>FilterIcon</span>,
    Search: () => <span>SearchIcon</span>,
    ChevronDown: () => <span>ChevronDownIcon</span>,
    UserPlus: () => <span>UserPlusIcon</span>,
    Check: () => <span>CheckIcon</span>,
  }));

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

global.alert = jest.fn();


describe('ManageUsers Component', () => {
  const mockUsers = [
    {
      id: '1',
      displayName: 'John Doe',
      email: 'john@example.com',
      user_type: 'admin',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      user_type: 'staff',
      updatedAt: '2023-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    // Mock fetchAllUsers
    fetchAllUsers.mockResolvedValue(mockUsers);
    // Mock useNavigate
    useNavigate.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    render(<ManageUsers />);
    expect(screen.queryByText('No users found')).not.toBeInTheDocument();
    await waitFor(() => expect(fetchAllUsers).toHaveBeenCalled());
  });

  test('displays users after loading', async () => {
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  test('displays "No users found" when there are no users', async () => {
    fetchAllUsers.mockResolvedValue([]);
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  test('filters users by search term', async () => {
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  test('filters users by type', async () => {
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  
    // Open filter dropdown
    const filterButton = screen.getByText('All user types');
    fireEvent.click(filterButton);
  
    // Find the admin option in the filter dropdown
    const filterOptions = screen.getAllByRole('listitem');
    const adminFilterOption = filterOptions.find(option => 
      option.textContent === 'admin' && 
      option.classList.contains('filter-option')
    );
    
    // Click the admin filter option
    fireEvent.click(adminFilterOption);
  
    // Verify filtering
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });


  

  test('shows loading state before users are fetched', () => {
    // Delay the mock response to test loading state
    
    fetchAllUsers.mockImplementationOnce(() => new Promise(() => {}));

    
    render(<ManageUsers />);
    expect(screen.queryByText('No users found')).not.toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });


  test('displays empty state when no users exist', async () => {
    fetchAllUsers.mockResolvedValueOnce([]);
    
    render(<ManageUsers />);
    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });


  test('filters users by search term', async () => {
    render(<ManageUsers />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'john' } });
  
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });


 

  test('opens delete confirmation modal', async () => {
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('TrashIcon');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete User?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone!')).toBeInTheDocument();
  });

  test('opens edit user modal', async () => {
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('PencilIcon');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit User Type')).toBeInTheDocument();
    expect(screen.getByText(`Name: ${mockUsers[0].displayName}`)).toBeInTheDocument();
    expect(screen.getByText(`Email: ${mockUsers[0].email}`)).toBeInTheDocument();
  });

  test('opens registration modal', async () => {
    render(<ManageUsers />);
    
    const onboardButton = screen.getByText('Onboard Member');
    fireEvent.click(onboardButton);

    expect(screen.getByText('Register User')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password (staff number)')).toBeInTheDocument();
  });

  test('handles registration form submission', async () => {
    const { createAccountRequest } = require('../../backend/services/userServices');
    createAccountRequest.mockResolvedValueOnce({});
    
    render(<ManageUsers />);
    
    // Open registration modal
    const onboardButton = screen.getByText('Onboard Member');
    fireEvent.click(onboardButton);
  
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('Name'), { 
      target: { value: 'New User' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'new@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password (staff number)'), { 
      target: { value: 'password123' } 
    });
    fireEvent.change(screen.getByRole('combobox'), { 
      target: { value: 'staff' } 
    });
  
    // Submit form
    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);
  
    // Verify service was called with correct data
    await waitFor(() => {
      expect(createAccountRequest).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        user_type: 'staff'
      });
    });
  });


  test('displays error when registration fails', async () => {
    const { createAccountRequest } = require('../../backend/services/userServices');
    createAccountRequest.mockRejectedValueOnce(new Error('Registration failed'));
    
    render(<ManageUsers />);
    
    // Open registration modal
    const onboardButton = screen.getByText('Onboard Member');
    fireEvent.click(onboardButton);
  
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('Name'), { 
      target: { value: 'New User' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'new@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password (staff number)'), { 
      target: { value: 'password123' } 
    });
    fireEvent.change(screen.getByRole('combobox'), { 
      target: { value: 'staff' } 
    });
  
    // Submit form
    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);
  
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

});