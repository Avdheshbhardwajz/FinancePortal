export interface ChangeTrackerResponse {
    success: boolean;
    message: string;
    data: ChangeTrackerData[];
}

export interface ChangeTrackerData {
    id: number;
    table_name: string;
    old_values: Record<string, any>;
    new_values: Record<string, any>;
    maker_id: number;
    comments: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    maker_name?: string;
}

export interface ApproveRejectResponse {
    success: boolean;
    message: string;
    data?: any;
}
