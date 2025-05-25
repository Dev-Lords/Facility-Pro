// src/services/UserService.js


export const saveUser = async (userData) => {
    const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/saveUser`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to save user');
    }

    return data.user;
  } catch (error) {
    console.error('Error saving user via API:', error);
    throw error;
  }
};


//Admin-functions:

//onboard member
export const createAccountRequest = async (formData) => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/create-account';

  const payload = {
    email: formData.email,
    password: formData.password,
    displayName: formData.name,
    user_type: formData.user_type
  };

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

  return true;
};


//delete user
export const deleteAccount = async (uid) => {
  const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/delete-account/${uid}`;

  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    console.error("Delete account error:", errorResponse);
    throw new Error(errorResponse.error);
  }

  return true;
};

//fetch users
export const fetchAllUsers = async () => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/get-all-users';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const users = await response.json();
  return users;
};


//update a user
export const updateUserType = async (uid, newUserType) => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/update-user-type';
  const payload = {
    uid,
    newType: newUserType,
  };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to update user type');
  }

  return true;
};

export const fetchUser = async (uid) => {
  const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/get-user/${uid}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  const user = await response.json();
  return user;
};

