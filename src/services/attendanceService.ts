import { supabase } from '../lib/supabase';
import { Attendance } from '../types';

export const attendanceService = {
  async getByUser(userId: number, startDate?: string, endDate?: string): Promise<Attendance[]> {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getByDate(date: string): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date);

    if (error) throw error;
    return data || [];
  },

  async create(attendance: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>): Promise<Attendance> {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ ...attendance, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, attendance: Partial<Attendance>): Promise<Attendance> {
    const { data, error } = await supabase
      .from('attendance')
      .update({ ...attendance, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAttendance(userId: number, date: string, status: string, notes?: string): Promise<Attendance> {
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      return this.update(existing.id, { status, notes });
    } else {
      return this.create({ user_id: userId, date, status, notes: notes || null });
    }
  }
};
