// === AUTH ===
export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
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

// === DEPARTMENTS & POSITIONS ===
export interface Department {
  id: number
  name: string
}

export interface Position {
  id: number
  name: string
  category?: string
}

// === TRAINING TYPES ===
export interface TrainingType {
  id: number
  name: string
  description?: string
}

// === EMPLOYEES ===
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

// === COURSES ===
export interface Course {
  id: number
  name: string
  periodMonths: number
  trainingTypeId: number
  trainingType?: TrainingType
  courseAssignments?: CourseAssignment[]
  tests?: Test[]
}

export interface CreateCourseDto {
  name: string
  periodMonths: number
  trainingTypeId: number
}

export interface UpdateCourseDto {
  name?: string
  periodMonths?: number
  trainingTypeId?: number
}

// === COURSE ASSIGNMENTS ===
export type AssignmentStatus = 'planned' | 'in_progress' | 'completed' | 'overdue'

export interface CourseAssignment {
  id: number
  employeeId: number
  employee?: Employee
  courseId: number
  course?: Course
  plannedDate: string
  factDate?: string
  passed?: boolean
  filePath?: string
  status: AssignmentStatus
}

export interface CreateAssignmentDto {
  employeeId: number
  courseId: number
  plannedDate: string
}

export interface CompleteAssignmentDto {
  factDate: string
  passed: boolean
  filePath?: string
}

export interface AssignmentFilters {
  employeeId?: number
  status?: AssignmentStatus
  overdue?: boolean
}

// === TESTS ===
export interface Test {
  id: number
  title: string
  passingScore: number
  courseId?: number
  course?: Course
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
  answers: Record<number, number[]>
}

export interface TestResult {
  id: number
  testId: number
  employeeId: number
  score: number
  passed: boolean
  completedAt: string
}

export interface CreateTestDto {
  title: string
  courseId: number
  passingScore?: number
  questions: CreateQuestionDto[]
}

export interface SubmitAnswerDto {
  questionId: number
  answerId: number
}

export interface SubmitTestDto {
  employeeId: number
  answers: SubmitAnswerDto[]
}

export interface CreateQuestionDto {
  text: string
  answers: { text: string; isCorrect: boolean }[]
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
  employee?: Employee
  message: string
  isRead: boolean
  createdAt: string
  courseAssignmentId?: number
  courseAssignment?: CourseAssignment
}

export interface NotificationFilters {
  employeeId?: number
  isRead?: boolean
}

// === REPORTS ===
export type ReportType = 'employee-card' | 'debtors' | 'by-department' | 'briefing-journal' | 'regulatory'

export interface ReportEmployeeCard {
  id: number
  fullName: string
  tabNumber: string
  department: string
  position: string
  hireDate: string
  totalCourses: number
  completedCourses: number
  overdueCount: number
  isBlocked: string
}

export interface ReportDebtor {
  id: number
  fullName: string
  tabNumber: string
  department: string
  overdueCount: number
  totalDebt: number
}

export interface ReportDepartment {
  id: number
  fullName: string
  tabNumber: string
  position: string
  totalCourses: number
  completedCourses: number
  overdueCount: number
}

export interface ReportBriefing {
  id: number
  employeeName: string
  briefingType: string
  date: string
  result: string
}