import axios from 'axios';
import { RequestDataPayload } from '../types/requestData';

const API_BASE_URL = 'http://localhost:8080';

export const submitRequestData = async (payload: RequestDataPayload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/requestdata`, payload);
    return response.data;
  } catch (error) {
    console.error('Error submitting request data:', error);
    throw error;
  }
};

// Checker API functions
export const fetchChangeTrackerData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fetchchangetrackerdata`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const approveChange = async (changeId: number) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/approve`, { changeId });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const rejectChange = async (changeId: number, comments: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reject`, { 
      changeId,
      comments 
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
