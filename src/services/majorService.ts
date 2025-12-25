import { supabase } from '../lib/supabase';
import { Major } from '../types';

export const majorService = {
  async getAll(): Promise<Major[]> {
    const { data, error } = await supabase
      .from('majors')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByDepartment(departmentId: number): Promise<Major[]> {
    const { data, error} = await supabase
      .from('majors')
      .select('*')
      .eq('department_id', departmentId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(major: Omit<Major, 'id' | 'created_at' | 'updated_at'>): Promise<Major> {
    const { data, error } = await supabase
      .from('majors')
      .insert([{ ...major, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
