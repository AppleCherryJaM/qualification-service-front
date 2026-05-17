// === AUTH ===
export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    email: string
    roles: string[]
    employeeId: number | null
  }
}

// === ROLES ===
export interface Role {
  id: number
  name: string
  description?: string
}

export interface UserRole {
  id: number
  userId: number
  roleId: number
  role?: Role
}

// === USERS ===
export interface User {
  id: number
  email: string
  employeeId?: number
  employee?: Employee
  roles?: UserRole[]
}

export interface CreateUserDto {
  email: string
  password: string
  employeeId?: number
}

export interface UpdateUserDto {
  email?: string
  password?: string
  employeeId?: number
}

export interface RegisterEmployeeDto {
  tabNumber: string
  fullName: string
  hireDate: string
  departmentId: number
  positionId: number
  email: string
  password: string
  roleId?: number
}

// === EMPLOYEES ===
export interface Department {
  id: number
  name: string
}

export interface Position {
  id: number
  name: string
  category?: string
}

export interface Employee {
  id: number
  tabNumber: string
  fullName: string
  hireDate: string | Date
  departmentId?: number
  department?: Department
  positionId?: number
  position?: Position
  isBlocked: boolean
  user?: User
  courseAssignments?: CourseAssignment[]
  briefings?: Briefing[]
  internships?: Internship[]
  testResults?: TestResult[]
  notifications?: Notification[]
}

export interface WorkAllowanceResponse {
  allowed: boolean
  overdueCount: number
  overdueAssignments: {
    courseName?: string
    plannedDate?: string
    factDate?: string
  }[]
}

// === COURSES & ASSIGNMENTS (заглушки — заполнишь позже) ===
export interface Course {
  id: number
  name: string
  description?: string
  periodMonths?: number
  passingScore?: number
}

export interface CourseAssignment {
  id: number
  employeeId: number
  courseId: number
  course?: Course
  plannedDate?: string
  factDate?: string
  status: 'pending' | 'completed' | 'overdue'
  result?: string
}

// === TESTS ===
export interface Test {
  id: number
  title: string
  passingScore: number
  questions?: Question[]
}

export interface Question {
  id: number
  text: string
  type: 'single' | 'multiple'
  answers: Answer[]
}

export interface Answer {
  id: number
  text: string
  isCorrect: boolean
}

export interface TestSubmitDto {
  answers: Record<number, number[]> // questionId -> answerIds
}

export interface TestResult {
  id: number
  testId: number
  employeeId: number
  score: number
  passed: boolean
  completedAt: string
}

// === BRIEFINGS ===
export interface Briefing {
  id: number
  employeeId: number
  type: string
  date: string
  instructorId?: number
}

// === INTERNSHIPS ===
export interface Internship {
  id: number
  employeeId: number
  startDate: string
  endDate: string
  shifts: number
  mentorId?: number
  result?: string
}

// === NOTIFICATIONS ===
export interface Notification {
  id: number
  employeeId: number
  type: string
  message: string
  read: boolean
  createdAt: string
}

// === REPORTS ===
export type ReportType = 'employees' | 'overdue' | 'department' | 'briefings' | 'regulatory'
