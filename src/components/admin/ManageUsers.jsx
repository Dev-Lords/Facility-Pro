import React, { useState, useEffect } from "react";
import {updateUserType,createAccountRequest,deleteAccount,fetchAllUsers} from "../../../backend/services/userServices";
import { Pencil, Trash2, Filter, Search, UserPlus, ChevronDown} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [showPopup, setShowPopup] = useState(false);   //pop up to delete user
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editUser, setEditUser] = useState(null);      //pop up to edit user
  const [newUserType, setNewUserType] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);   //pop up to onboard member
  const [registrationFormData, setRegistrationFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "",
  });
  const [registrationError, setRegistrationError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);   //pagination:
  const UsersPerPage = 10;
  
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  //filter and search properties
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  

//Fetching users
useEffect(() => {
  const loadUsers = async () => {
    try {
      setIsLoading(true);  
      const usersList = await fetchAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false); 
    }
  };

  loadUsers();
}, []);


//UI improvements (in order of appearance):

//Filter and Search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||  //search by name or email
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === "all" || user.user_type === filterType;  //filter by user type

    return matchesSearch && matchesFilter;
  });

  const userTypes = ["all", ...new Set(users.map((user) => user.user_type))];

  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };


//Displaying last modification date and time in a better way 
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


//Pagination
   const indexOfLastUser = currentPage * UsersPerPage;
   const indexOfFirstUser = indexOfLastUser - UsersPerPage;
   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
   const totalPages = Math.ceil(filteredUsers.length / UsersPerPage);

   useEffect(() => {    //scrolling to the top every new page to avoid glitching page when page reloads
    const tableTop = document.querySelector(".users-table-container");
    if (tableTop && typeof tableTop.scrollIntoView === "function") {
      tableTop.scrollIntoView({ behavior: "smooth", block: "start" }); 
    }
   }, [currentPage]);
  
   useEffect(() => {    //reload pagination to 1 everytime when searching or filtering
    setCurrentPage(1);
   }, [searchTerm, filterType]);

   useEffect(() => {    //pagination implementation
    const tableTop = document.querySelector(".users-table-container");
    if (tableTop && typeof tableTop.scrollIntoView === "function") {
     tableTop.scrollIntoView({ behavior: "smooth", block: "start" });
    }
   }, [currentPage]);


//MANAGING USERS:

  //Onboarding a user
  const handleRegistrationChange = (e) => {    //popup
    setRegistrationFormData({
      ...registrationFormData,
      [e.target.name]: e.target.value,
    });
  };

  const createAccount = async (e) => {
    e.preventDefault();
    setRegistrationError("");

    if (
      !registrationFormData.email ||
      !registrationFormData.password ||
      !registrationFormData.name ||
      !registrationFormData.user_type
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await createAccountRequest(registrationFormData);
      console.log("Account created");
      await fetchAllUsers();
      setShowRegistration(false);
      setRegistrationError("");
      toast.success(`User added successfully!`);
    } catch (error) {
      setRegistrationError(error.message);
      toast.error(`User not onboarded!`);
    }
  };
  
  //Deleting a user
  const confirmDelete = (userId) => {   //popup
    setSelectedUserId(userId);
    setShowPopup(true);
  };

  const handleDelete = async () => { 
    if (!selectedUserId)
       return;

    try {
      await deleteAccount(selectedUserId);
      console.log("User deleted");
      await fetchAllUsers(); 
      setShowPopup(false);
      setSelectedUserId(null);
      setDeleteError(null);
      toast.success(`User deleted successfully!`);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(`Error deleting user!`); 
      setShowPopup(false);
    }
  };


  //Editing user type
  const openEditModal = (user) => {   //popup
    setEditUser(user);
    setNewUserType(user.user_type || "");
  };

  const handleUpdateUserType = async () => {
  try {
    await updateUserType(editUser.uid, newUserType);
    await fetchAllUsers(); 
    setEditUser(null);
    toast.success(`User updated successfully!`);
  } catch (error) {
    console.error("Error updating user:", error);
    toast.error(`Failed To Update User!`);
  }
  };



  return (
    <main className="users-page">
      {deleteError && (
        <section className="error-banner" data-testid="delete-error">
          {deleteError}
          <button onClick={() => setDeleteError(null)}>×</button>
        </section>
      )}

      <header className="user-management-header">
        <h1 className="user-management-title">Manage Users</h1>
        <p className="user-management-subtitle">
          Onboard members, revoke access and assign roles!
        </p>
      
      </header>



{/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <button 
          onClick={() => handleNavigate('/admin-home')} 
          className="breadcrumb-link"
        >
          <span className="home-icon">🏠</span> Dashboard
        </button>
      
      </nav>
      <button
        className="onboard-button"
        onClick={() => {
          setRegistrationError("");
          setShowRegistration(true);
        }}
      >
        <UserPlus className="icon-plus" size={18} />
        Onboard Member
      </button>

      <form
        className="search-filter-container"
        onSubmit={(e) => e.preventDefault()}
      >
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
            <Filter size={16} />
            {filterType === "all" ? "All user types" : filterType}
            <ChevronDown size={16} className="chevron-icon" />
          </button>

          {isFilterOpen && (
            <ul className="filter-dropdown">
              {userTypes.map((type, index) => (
                <li
                  key={`${type}-${index}`}
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
      {isLoading ? (
        <tr>
          <td colSpan="6">
            <section className="spinner-container">
              <svg className="spinner" viewBox="0 0 50 50">
                <circle className="spinner-ring" cx="25" cy="25" r="20" />
              </svg>

              <p>Loading...</p>
            </section>
          </td>
        </tr>
      ) : filteredUsers.length === 0 ? (
        <tr>
          <td colSpan="6" className="no-users-message">
            No users found
          </td>
        </tr>
      ) : (
        currentUsers.map((user, index) => (
          <tr key={user.uid || `user-${index}`}>
            <td>{user.displayName}</td>
            <td>{user.email}</td>
            <td className="user-type-cell">
              <mark className="user-type-badge">
                {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
              </mark>
            </td>
            <td>{formatDate(user.updatedAt)}</td>
            <td>
              <button className="edit-button" onClick={() => openEditModal(user)}>
                <Pencil size={18} className="icon" />
              </button>
            </td>
            <td>
              <button className="delete-button" onClick={() => confirmDelete(user.uid)}>
                <Trash2 size={18} className="icon" />
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</section>


    {/*Popups: delete,edit and onboard respectively*/}

      {showPopup && (
        <>
          <section className="modal-overlay">
            <section className="modal-box">
              <h3>Delete User?</h3>
              <p>This action cannot be undone!</p>
              <section className="modal-buttons">
                <button onClick={handleDelete} className="confirm-btn">
                  Delete
                </button>

                <button
                  onClick={() => setShowPopup(false)}
                  className="cancel-btn">
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
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="resident">Resident</option>
            </select>

            <section className="modal-buttons">
              <button onClick={handleUpdateUserType} className="confirm-btn">
                Save Changes
              </button>
              <button onClick={() => setEditUser(null)} className="cancel-btn">
                Cancel
              </button>
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
                <option value="resident">Resident</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>

              <section className="modal-buttons">
                <button type="submit" className="confirm-btn">
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegistration(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </section>

              {registrationError && (
                <p className="error">{registrationError}</p>
              )}
            </form>
          </section>
        </section>
      )}

      <nav aria-label="Booking pagination">
        <ul className="pagination-list">
          <li>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            >Previous
          </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
            <button
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "active-page" : ""}
              >{i + 1}
            </button>
            </li>
            ))}
          <li>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >Next
            </button>
          </li>
        </ul>
      </nav>

      <footer className="footer">
        <p>Facility Management System • Admin services • Version 1.0.4</p>
      </footer>
    </main>
  );
};

export default ManageUsers;
