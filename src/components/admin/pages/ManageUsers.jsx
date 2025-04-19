//Importing important packages,functions and databases
import React, { useState, useEffect } from "react";
import { User } from "../../../../backend/models/user.js";
//import { OnboardMember } from '../../../../backend/auth/firebase-auth';
import { getFunctions, httpsCallable } from "firebase/functions";
import { fetchUsers,deleteUser,updateUserType } from '../../../../backend/services/userServices.js';
import { Navigate,useNavigate } from 'react-router-dom';

//importing graphics/icons and css for UI appearance
import "./ManageUsers.css";
import { Pencil, Trash2,Filter,Search,Check,UserPlus} from "lucide-react";

//admin sdk:
const functions = getFunctions();
const createUserAccount = httpsCallable(functions, "createUserAccount");


const ManageUsers = () => { 
  const navigate = useNavigate();

  //UI improvements
  const formatDateOnly = (isoString) => {
    if (!isoString) return ""; // Handle undefined/null gracefully
    const date = new Date(isoString);
    return date.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  //handle routing
  const handleNavigate = (path) => {
    navigate(path);
  };
  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  const isAuthenticated = token && userType === 'admin';

  if (!isAuthenticated) {
  	return <Navigate to="/" replace />;
  }

  //pop up state tracking for confirming delete
  const [showPopup, setShowPopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  //pop up state tracking for editing user
  const [editUser, setEditUser] = useState(null);
  const [newUserType, setNewUserType] = useState("");

  //pop up state tracking for onboarding user
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationFormData, setRegistrationFormData] = useState({
  name: '', email: '', password: '', user_type: '' });
  const [registrationError, setRegistrationError] = useState(null);

  //filter and search properties
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

//getting users in the database using fetchUsers() for display purposes
const [users, setUsers] = useState([]);
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersList = await fetchUsers();
        setUsers(usersList);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    loadUsers();
  }, []);

//filtering and searching through users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      user.user_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const userTypes = ["all", ...new Set(users.map(user => user.user_type))];

  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };


//deleting users from system using deleteUser()
  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    setShowPopup(true);
  };

  const handleDelete = async () => {
    try {
      await deleteUser(selectedUserId);
      setUsers(prev => prev.filter(user => user.id !== selectedUserId));
      setShowPopup(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("You don't have permission to delete this user.");
      setShowPopup(false);
    }
  };
  
  //editing user-types/roles using updateUserType()
  const openEditModal = (user) => {
    setEditUser(user);
    setNewUserType(user.user_type || "");
  };

  const handleUpdateUserType = async () => {
    if (!editUser) return;

    try {
      await updateUserType(editUser.id, newUserType);
    
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editUser.id ? { ...user, user_type: newUserType } : user
        )
      );
    
      setEditUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("You don't have permission to edit this user.");
    }
  };


  //Onboarding user function : to be edited using admin sdk
  const handleRegistrationChange = (e) => {
    setRegistrationFormData({ ...registrationFormData, [e.target.name]: e.target.value });
  };
  
  const handleRegistrationSubmit = async (e) => {

    e.preventDefault();

    const data =
    {
      email:registrationFormData.email,
      password:registrationFormData.password,
      displayName: registrationFormData.name,
      user_type: registrationFormData.user_type
    }

    try{
      const result = await createUserAccount(data);
      alert(result.data.message);
      const newUser = new User(
        registrationFormData.name,
        registrationFormData.email,
        registrationFormData.user_type
      );
      setUsers([...users, newUser]);
      setShowRegistration(false);
    }
    catch(error){
      alert("Error creating user: " + error.message);
      setRegistrationError(error.message);
    }
    
    /*
    OnboardMember(  //found in backend firebase-auth.js
      registrationFormData.name,
      registrationFormData.email,
      registrationFormData.password,
      registrationFormData.user_type
    )
      .then((userCredential) => {
        const newUser = new User(
          registrationFormData.name,
          registrationFormData.email,
          registrationFormData.user_type
        );
        setUsers([...users, newUser]);
        setShowRegistration(false);
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        setRegistrationError(error.message);
      });

      */

  };
  



  return (
    <main className="users-page">
      <header className="user-management-header">
        <h1 className="management-title">Manage Users</h1>
        <p className="management-subtitle">
          Onboard members, revoke access and assign roles.
        </p>
      </header>

      <button className="onboard-button" onClick={() => setShowRegistration(true)}>
          <span className="icon-plus">+</span>
          <span> Onboard Member</span>
        </button>

      <form className="search-filter-container" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="search-container">
        <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </fieldset>

        <fieldset className="filter-container">
          <button
            type="button"
            onClick={toggleFilterDropdown}
            className="filter-button"
          >
            <Filter size={16} className="filter-icon" />
            <span>{filterType === "all" ? "All user types" : filterType}</span>
            <span className="dropdown-icon">▼</span>
          </button>

          {isFilterOpen && (
            <ul className="filter-dropdown">
              {userTypes.map((type) => (
                <li
                  key={type}
                  className="filter-option"
                  onClick={() => {
                    setFilterType(type);
                    setIsFilterOpen(false);
                  }}
                >
                  {type === "all" ? "All user types" : type}
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </form>

      <section className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Last Modified</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-users-message">
                  Loading users...
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                    <td >{user.displayName}</td>
                    <td>{user.email}</td>
                    <td><span className="user-type-badge">{user.user_type}</span></td>
                    <td>{formatDateOnly(user.updatedAt)}</td>
                    <td className="actions-cell">
                      <button className="edit-button"  onClick={() => openEditModal(user)}>
                        <Pencil size={18} className="icon" />
                      </button></td>
                    <td className="actions-cell"> 
                      <button className="delete-button" 
                        onClick={() => confirmDelete(user.id)}>
                        <Trash2 size={18} className="icon" /> 
                      </button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    

{/*Pop up screen for deleting user */}
      {showPopup && (
    <>
      <section className="modal-overlay">
        <section className="modal-box">
          <h3>Delete User?</h3>
          <p>This action cannot be undone!</p>
          <section className="modal-buttons">
            <button onClick={handleDelete} className="confirm-btn">
              Yes,delete
            </button>
            <button onClick={() => setShowPopup(false)} className="cancel-btn">
              Cancel
            </button>
          </section>
        </section>
      </section>
    </>
   )}



{/*Pop up screen for editing user type */}
{editUser && (
  <section className="modal-overlay">
    <section className="modal-box edit-modal-box">
      <h3>Edit User Type</h3>
      <p>Name: {editUser.displayName}</p>
      <p>Email: {editUser.email}</p>
      <label htmlFor="userType">User Type:</label>
      <select
        id="userType"
        value={newUserType}
        onChange={(e) => setNewUserType(e.target.value)}
      >
        <option value="">Select type</option>
        <option value="admin">admin</option>
        <option value="staff">staff</option>
        <option value="resident">resident</option>
      </select>

      <section className="modal-buttons">
        <button onClick={handleUpdateUserType} className="confirm-btn">Save Changes</button>
        <button onClick={() => setEditUser(null)} className="cancel-btn">Cancel</button>
      </section>
    </section>
  </section>
)}



{/*Pop up screen for onboarding a user */}
{showRegistration && (
  <section className="modal-overlay">
    <section className="modal-box">
      <header className="form-header">
        <UserPlus size={24} />
        <h2 className="form-title">Register User</h2>
      </header>

      <form onSubmit={handleRegistrationSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={registrationFormData.name}
          onChange={handleRegistrationChange}
          required
          className="form-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={registrationFormData.email}
          onChange={handleRegistrationChange}
          required
          className="form-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password (staff number)"
          value={registrationFormData.password}
          onChange={handleRegistrationChange}
          required
          className="form-input"
        />
        <select
          name="user_type"
          value={registrationFormData.user_type}
          onChange={handleRegistrationChange}
          required
          className="form-input"
        >
          <option value="">Select type</option>
          <option value="resident">resident</option>
          <option value="staff">staff</option>
          <option value="admin">admin</option>
        </select>

        <section className="modal-buttons">
          <button type="submit" className="confirm-btn">Register</button>
          <button type="button" onClick={() => setShowRegistration(false)} className="cancel-btn">Cancel</button>
        </section>

        {registrationError && <p className="error">{registrationError}</p>}
      </form>
    </section>
  </section>
)}

      <footer className="facility-footer">
        <p>Facility Management System • Staff Portal • Version 1.0.0</p>
      </footer>

    </main>
  );
  
};

export default ManageUsers;
 