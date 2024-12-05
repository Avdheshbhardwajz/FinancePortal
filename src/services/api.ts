import axios from 'axios';
import { RequestDataPayload } from '../types/requestData';
import { ChangeTrackerResponse, ApproveRejectResponse } from '../types/checkerData';

const API_BASE_URL = 'http://localhost:8080';
const userData = JSON.parse(localStorage.getItem('userData') || '{}');
const checkerId = userData.user_id;

export const submitRequestData = async (payload: RequestDataPayload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/requestdata`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Checker API functions
export const fetchChangeTrackerData = async (): Promise<ChangeTrackerResponse> => {
  try {
    const response = await axios.get<ChangeTrackerResponse>(`${API_BASE_URL}/fetchchangetrackerdata`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const approveChange = async (
  requestId: string,
  comments?: string
): Promise<ApproveRejectResponse> => {
  try {
    const response = await axios.post<ApproveRejectResponse>(`${API_BASE_URL}/approve`, {
      request_id: requestId,
      comments: comments,
      checker: checkerId// Get checker ID from localStorage
    });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to approve change');
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

export const rejectChange = async (
  requestId: string,
  comments: string
): Promise<ApproveRejectResponse> => {
  try {
  
    const response = await axios.post<ApproveRejectResponse>(`${API_BASE_URL}/reject`, {
      request_id: requestId,
      comments: comments,
      checker: checkerId // Get checker ID from localStorage
    });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to reject change');
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

const handleApiError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
  throw error;
};
