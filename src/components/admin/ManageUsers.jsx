import React, { useState, useEffect } from "react";
import { db } from "../../../backend/firebase/firebase.config";

import { collection, getDocs, deleteDoc,updateDoc, doc , query, orderBy,addDoc}from "firebase/firestore";
import { Pencil, Trash2,Filter,Search,Check,UserPlus} from "lucide-react";

import { useNavigate } from "react-router-dom";
import "./ManageUsers.css";

const ManageUsers = () => {
  const navigate = useNavigate();  
  //pop up to confirm delete
  const [showPopup, setShowPopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  //pop up to edit user
  const [editUser, setEditUser] = useState(null);
  const [newUserType, setNewUserType] = useState("");
  //pop up to onboard member 
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationFormData, setRegistrationFormData] = useState({
  name: '',
  email: '',
  password: '',
  user_type: ''
  });
  const [registrationError, setRegistrationError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);



  //filter and search properties
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchUsers = async () => {
    try {
        setIsLoading(true); 
      const usersCol = query(collection(db, "users"), orderBy("displayName"));
      const usersSnapshot = await getDocs(usersCol);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }finally {
    setIsLoading(false); 
  }
  };

  
  useEffect(() => {
    const getUsers = async () => {
      await fetchUsers();
    };
  
    getUsers();
  }, []);  

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


  //deleting users from system
  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    setShowPopup(true);
  };
  
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "users", selectedUserId));
      setUsers(prev => prev.filter(user => user.id !== selectedUserId));
      setShowPopup(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("You don't have permission to delete this user.");
      setShowPopup(false);
    }
  };
  
  //edit user pop-up and function
  const openEditModal = (user) => {
    setEditUser(user);
    setNewUserType(user.user_type || "");
  };

  const handleUpdateUserType = async () => {
    if (!editUser) return;
  
    try {
      const userRef = doc(db, "users", editUser.id);
      await updateDoc(userRef, { user_type: newUserType });
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

  //add user pop-up and function
  const handleRegistrationChange = (e) => {
    setRegistrationFormData({ ...registrationFormData, [e.target.name]: e.target.value });
  };
  
  const createAccount = async (e) => {
    e.preventDefault();
    setRegistrationError("");
    if (!registrationFormData.email || !registrationFormData.password || !registrationFormData.name || !registrationFormData.user_type) {
        alert('Please fill in all fields');
        return;
      }
  
    const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/create-account';
  
    const payload = {
      email: registrationFormData.email,
      password: registrationFormData.password,
      displayName: registrationFormData.name,
      user_type: registrationFormData.user_type
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response:", errorResponse);
        throw new Error(errorResponse.error);
      }
  
      console.log("Account created");
      await fetchUsers(); 
      setShowRegistration(false);
      setRegistrationError("");

    
    } catch (error) {
      setRegistrationError(error.message);
    }
  };

//UI improvements:
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-ZA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <main className="users-page">

    <header className="user-management-header">
        <h1 className="user-management-title">Manage Users</h1>
        <p className="user-management-subtitle">
        Onboard members, revoke access and assign roles!
        </p>
      </header>
        <button className="onboard-button" onClick={() =>{setRegistrationError("");
            setShowRegistration(true)}}>
          <span className="icon-plus">+</span>
          <span>Onboard Member</span>
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
              {userTypes.map((type, index) => (
                <li
                    key={`${type}-${index}`} // Combines value with index to guarantee uniqueness
                    className="filter-option"
                    onClick={() => {
                    setFilterType(type);
                    setIsFilterOpen(false);
                    }}>
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
  {isLoading ? null : (
    filteredUsers.length === 0 ? (
      <tr>
        <td colSpan="6" className="no-users-message">
        No users found
        </td>
      </tr>
    ) : (
      filteredUsers.map((user, index) => (
        <tr key={user.id || `user-${index}`}>
          <td >{user.displayName }</td>
          <td >{user.email}</td>
          <td className="user-type-cell">
            <span className="user-type-badge">{user.user_type}</span>
          </td>
          <td>{formatDate(user.updatedAt)}</td>
          <td className="actions-cell">
            <button className="edit-button" onClick={() => openEditModal(user)}>
              <Pencil size={18} className="icon" />
            </button>
          </td>
          <td className="actions-cell">
            <button className="delete-button" onClick={() => confirmDelete(user.id)}>
              <Trash2 size={18} className="icon" />
            </button>
          </td>
        </tr>
      ))
    )
  )}
</tbody>

        </table>
      </section>
    

      {showPopup && (
    <>
      <section className="modal-overlay">
        <section className="modal-box">
          <h3>Delete User?</h3>
          <p>This action cannot be undone!</p>
          <section className="modal-buttons">
            <button onClick={handleDelete} className="confirm-btn">
              delete
            </button>
            <button onClick={() => setShowPopup(false)} className="cancel-btn">
              Cancel
            </button>
          </section>
        </section>
      </section>
    </>
   )}


{editUser && (
  <section className="modal-overlay">
    <section className="modal-box edit-modal-box">
      <h4>Edit User Type</h4>
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


{showRegistration && (
  <section className="modal-overlay">
    <section className="modal-box">
      <header className="form-header">
        <UserPlus size={24} />
        <h2 className="form-title">Register User</h2>
      </header>

      <form onSubmit={createAccount}>
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
        <p>Facility Management System • Admin services • Version 1.0.0</p>
      </footer>

    </main>
  );
  
};



export default ManageUsers;
 
