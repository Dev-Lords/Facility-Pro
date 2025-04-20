import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageUsers from '../components/admin/ManageUsers.jsx';
import { db } from '../../backend/firebase/firebase.config.js';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock Firebase and other dependencies
jest.mock('../../backend/firebase/firebase.config.js', () => ({}));
jest.mock('firebase/firestore');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Pencil: () => <span>PencilIcon</span>,
  Trash2: () => <span>TrashIcon</span>,
  Filter: () => <span>FilterIcon</span>,
  Search: () => <span>SearchIcon</span>,
  Check: () => <span>CheckIcon</span>,
  UserPlus: () => <span>UserPlusIcon</span>,
}));

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

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
    // Mock Firestore getDocs
    getDocs.mockResolvedValue({
      docs: mockUsers.map(user => ({
        id: user.id,
        data: () => ({ ...user })
      }))
    });

    // Mock useNavigate
    useNavigate.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    render(<ManageUsers />);
    expect(screen.queryByText('No users found')).not.toBeInTheDocument();
    await waitFor(() => expect(getDocs).toHaveBeenCalled());
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
    getDocs.mockResolvedValue({ docs: [] });
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
    getDocs.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<ManageUsers />);
    expect(screen.queryByText('No users found')).not.toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });


  test('displays empty state when no users exist', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });
    
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

  test('shows error when user deletion fails', async () => {
    // Mock failed deletion
    deleteDoc.mockRejectedValueOnce(new Error('Permission denied'));
  
    render(<ManageUsers />);
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
  
    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /trashicon/i });
    fireEvent.click(deleteButtons[0]);
  
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);
  
    // Check for error message
    await waitFor(() => {
      expect(screen.getByTestId('delete-error')).toHaveTextContent(
        /you don't have permission to delete this user/i
      );
    });
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
    render(<ManageUsers />);
    
    const onboardButton = screen.getByText('Onboard Member');
    fireEvent.click(onboardButton);

    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password (staff number)');
    const userTypeSelect = screen.getByRole('combobox');

    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(userTypeSelect, { target: { value: 'staff' } });

    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://us-central1-facilty-pro.cloudfunctions.net/api/create-account',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'new@example.com',
            password: 'password123',
            displayName: 'New User',
            user_type: 'staff'
          })
        })
      );
    });
  });


  test('displays error when registration fails', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Registration failed' }),
      })
    );
  
    render(<ManageUsers />);
    
    // Open registration modal
    const onboardButton = screen.getByText('Onboard Member');
    fireEvent.click(onboardButton);
  
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password (staff number)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'staff' } });
  
    // Submit form
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
  
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    }, { timeout: 3000 }); // Increased timeout
  });

});