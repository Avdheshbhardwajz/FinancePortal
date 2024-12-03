export interface RequestDataPayload {
  table_name: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  maker_id: number;
  comments?: string;
}
