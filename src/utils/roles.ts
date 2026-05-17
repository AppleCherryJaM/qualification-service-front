export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

export const PERMISSIONS = {
  // Users
  USERS_VIEW_ALL: ['admin'],
  USERS_CREATE: ['admin'],
  USERS_DELETE: ['admin'],

  // Employees
  EMPLOYEES_CREATE: ['admin', 'hr'],
  EMPLOYEES_UPDATE: ['admin', 'hr'],
  EMPLOYEES_DELETE: ['admin'],

  // Courses
  COURSES_CREATE: ['admin', 'hr', 'manager'],
  COURSES_UPDATE: ['admin', 'hr', 'manager'],
  COURSES_DELETE: ['admin', 'hr'],

  // Course Assignments
  ASSIGNMENTS_CREATE: ['admin', 'hr', 'manager'],
  ASSIGNMENTS_COMPLETE: ['admin', 'hr'],
  ASSIGNMENTS_CHECK_OVERDUE: ['admin', 'hr'],

  // Reports
  REPORTS_EXPORT: ['admin', 'hr'],

  // Tests
  TESTS_CREATE: ['admin', 'hr'],
  TESTS_SUBMIT: ['admin', 'hr', 'manager', 'employee'],
} as const

export function hasRole(userRoles: string[], allowedRoles: readonly string[]): boolean {
  return userRoles.some((role) => allowedRoles.includes(role))
}

export function hasPermission(userRoles: string[], permission: readonly string[]): boolean {
  return hasRole(userRoles, permission)
}
