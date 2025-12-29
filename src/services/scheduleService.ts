import { supabase } from '../lib/supabase';

export interface Schedule {
  id: number;
  class_id: number;
  subject_id: number;
  room: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  academic_year: string;
  semester: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduleWithDetails extends Schedule {
  class_name?: string;
  subject_name?: string;
}

export const scheduleService = {
  async getAll(): Promise<ScheduleWithDetails[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        classes:class_id(name),
        subjects:subject_id(name, code)
      `)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      ...item,
      class_name: item.classes?.name,
      subject_name: item.subjects?.name,
      subject_code: item.subjects?.code
    }));
  },

  async getByClass(classId: number): Promise<ScheduleWithDetails[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        classes:class_id(name),
        subjects:subject_id(name, code)
      `)
      .eq('class_id', classId)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      ...item,
      class_name: item.classes?.name,
      subject_name: item.subjects?.name,
      subject_code: item.subjects?.code
    }));
  },

  async create(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .insert([{ ...schedule, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, schedule: Partial<Omit<Schedule, 'id' | 'created_at' | 'updated_at'>>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .update({ ...schedule, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
