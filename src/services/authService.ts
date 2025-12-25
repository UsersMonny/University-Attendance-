import { supabase } from '../lib/supabase';
import { User } from '../types';

export const authService = {
  // src/services/authService.ts

async login(uniqueId: string, password: string): Promise<User | null> {
  console.log('Attempting login for:', uniqueId); // Debug log

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('unique_id', uniqueId)
    .eq('password', password)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Supabase Error:', error.message); // This tells us if the DB connection is broken
    throw new Error('Database connection failed');
  }

  if (!data) {
    console.warn('Login Failed: No active user found with these credentials.');
    throw new Error('Invalid credentials');
  }

  console.log('Login successful! User found:', data.name);
  localStorage.setItem('currentUser', JSON.stringify(data));
  return data;
},

  logout() {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
};
