import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
}

export const createUser = async (userData: User) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, {
      email: userData.email,
      password: userData.password,
      role: userData.role,
      first_name: userData.firstName,
      last_name: userData.lastName
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, {
      email: userData.email,
      role: userData.role,
      first_name: userData.firstName,
      last_name: userData.lastName,
      password: userData.password
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};
