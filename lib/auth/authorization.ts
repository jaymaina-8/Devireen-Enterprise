import { User } from '@supabase/supabase-js';

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'USER';

/**
 * Parses the role from the user's app_metadata.
 * Defaults to 'USER' if no specific role is assigned.
 */
export function getUserRole(user: User | null): Role {
  if (!user) return 'USER';

  // Supabase app_metadata is populated in the JWT token
  const role = user.app_metadata?.role;

  if (role === 'admin') return 'ADMIN';
  if (role === 'manager') return 'MANAGER';
  if (role === 'staff') return 'STAFF';

  return 'USER';
}

/**
 * Checks if a user has at least the required role.
 * Hierarchy: ADMIN > MANAGER > STAFF > USER
 */
export function hasRole(user: User | null, requiredRole: Role): boolean {
  const role = getUserRole(user);

  const hierarchy: Record<Role, number> = {
    ADMIN: 4,
    MANAGER: 3,
    STAFF: 2,
    USER: 1,
  };

  return hierarchy[role] >= hierarchy[requiredRole];
}

/**
 * Helper to be used in Server Actions to ensure authorization.
 * Throws an error if the user is not authorized.
 */
export function requireRole(user: User | null, requiredRole: Role) {
  if (!user) {
    throw new Error('Unauthorized: You must be logged in.');
  }

  if (!hasRole(user, requiredRole)) {
    throw new Error(`Forbidden: Requires ${requiredRole} privileges.`);
  }
}

/**
 * Verifies if the current user is an admin by checking user metadata/email or calling the DB.
 * To be used at the top of privileged Server Actions.
 */
export async function verifyAdminServerAction() {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // 1. Check if email matches bootstrap ADMIN_EMAIL
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@devireenenterprice.com';
  if (user.email === adminEmail) {
    return user;
  }

  // 2. Check canonical user_roles via the is_admin() function
  const { data, error } = await supabase.rpc('is_admin');

  if (error || !data) {
    throw new Error('Forbidden: Admin access required.');
  }

  return user;
}
