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
    row_id: number;
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

export interface TableData {
    name: string;
    changes: Change[];
}

export interface Change {
    id: number;
    user: string;
    dateTime: string;
    reason: string;
    changes: ColumnChange[];
    fullRow: Record<string, string>;
    tableName: string;
    status: 'pending' | 'approved' | 'rejected';
    newValues?: Record<string, any>;
    oldValues?: Record<string, any>;
    rowData?: Record<string, string>;
    rowId?: number;
}

export interface ColumnChange {
    column: string;
    oldValue: string;
    newValue: string;
}
