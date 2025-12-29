import { supabase } from '../lib/supabase';
import { Subject } from '../types';

export const subjectService = {
  async getAll(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ ...subject, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, subject: Partial<Omit<Subject, 'id' | 'created_at' | 'updated_at'>>): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .update({ ...subject, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
