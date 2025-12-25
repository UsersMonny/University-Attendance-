import { supabase } from '../lib/supabase';
import { Class } from '../types';

export const classService = {
  async getAll(): Promise<Class[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Class | null> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>): Promise<Class> {
    const { data, error } = await supabase
      .from('classes')
      .insert([{ ...classData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, classData: Partial<Class>): Promise<Class> {
    const { data, error } = await supabase
      .from('classes')
      .update({ ...classData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getByMajor(majorId: number): Promise<Class[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('major_id', majorId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }
};
