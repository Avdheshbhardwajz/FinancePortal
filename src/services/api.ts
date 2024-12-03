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
