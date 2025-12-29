import { supabase } from '../lib/supabase';
import { Major } from '../types';

export interface MajorWithDepartment extends Major {
  department_name?: string;
  department_short_name?: string;
}

export const majorService = {
  async getAll(): Promise<MajorWithDepartment[]> {
    const { data, error } = await supabase
      .from('majors')
      .select(`
        *,
        departments:department_id(name, short_name)
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      ...item,
      department_name: item.departments?.name,
      department_short_name: item.departments?.short_name
    }));
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
  },

  async update(id: number, major: Partial<Omit<Major, 'id' | 'created_at' | 'updated_at'>>): Promise<Major> {
    const { data, error } = await supabase
      .from('majors')
      .update({ ...major, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('majors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
