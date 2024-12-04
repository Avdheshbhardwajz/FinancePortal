import axios from 'axios';
import { RequestDataPayload } from '../types/requestData';
import { ChangeTrackerResponse, ApproveRejectResponse } from '../types/checkerData';

const API_BASE_URL = 'http://localhost:8080';

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
  changeId: number, 
  tableName: string, 
  rowId: number | null, 
  newData: Record<string, any>
): Promise<ApproveRejectResponse> => {
  try {
    const response = await axios.post<ApproveRejectResponse>(`${API_BASE_URL}/approve`, {
      table_id: tableName,
      row_id: rowId,
      new_data: newData,
      checker: 1, // TODO: Replace with actual checker ID from auth
      comment: ''
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
  changeId: number, 
  comments: string
): Promise<ApproveRejectResponse> => {
  try {
    const response = await axios.post<ApproveRejectResponse>(`${API_BASE_URL}/reject`, { 
      row_id: changeId,
      checker: 1, // TODO: Replace with actual checker ID from auth
      comment: comments
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
