import { supabase } from '../lib/supabase';
import { LeaveRequest } from '../types';

export const leaveService = {
  async getByUser(userId: number): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPending(): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByDepartment(departmentId: number): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        users!inner (department_id)
      `)
      .eq('users.department_id', departmentId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(leaveRequest: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at' | 'reviewer_id' | 'reviewed_at' | 'comments'>): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert([{
        ...leaveRequest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({ ...leaveRequest, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approve(id: number, reviewerId: number, comments?: string): Promise<LeaveRequest> {
    return this.update(id, {
      status: 'approved',
      reviewer_id: reviewerId,
      reviewed_at: new Date().toISOString(),
      comments: comments || null
    });
  },

  async reject(id: number, reviewerId: number, comments?: string): Promise<LeaveRequest> {
    return this.update(id, {
      status: 'rejected',
      reviewer_id: reviewerId,
      reviewed_at: new Date().toISOString(),
      comments: comments || null
    });
  },

  async cancel(id: number): Promise<LeaveRequest> {
    return this.update(id, { status: 'cancelled' });
  }
};
