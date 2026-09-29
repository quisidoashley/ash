import { supabase } from './supabase';
import type { Role } from './profiles';

export async function getCurrentRole(): Promise<Role | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role as Role;
}

export async function isTeacher(): Promise<boolean> {
  const role = await getCurrentRole();
  return role === 'teacher';
}

export async function isStudent(): Promise<boolean> {
  const role = await getCurrentRole();
  return role === 'student';
}