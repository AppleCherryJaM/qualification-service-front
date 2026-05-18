// src/api/dashboard.ts — агрегация из существующих API
import { apiClient } from './client'
import type { Employee, CourseAssignment, Course, TestResult } from '../types/api'

export interface DashboardStats {
  totalEmployees: number
  activeCourses: number
  overdueCount: number
  passRate: number
  blockedEmployees: number
  completedAssignments: number
  totalAssignments: number
}

export const dashboardApi = {
  // Собираем статистику параллельно
  getStats: async (): Promise<DashboardStats> => {
    const [employeesRes, coursesRes, assignmentsRes, resultsRes] = await Promise.all([
      apiClient.get<Employee[]>('/employees'),
      apiClient.get<Course[]>('/courses'),
      apiClient.get<CourseAssignment[]>('/course-assignments'),
      apiClient.get<TestResult[]>('/tests/results/all'),
    ])

    const employees = employeesRes.data
    const courses = coursesRes.data
    const assignments = assignmentsRes.data
    const results = resultsRes.data

    const overdueCount = assignments.filter((a) => a.status === 'overdue').length
    const completedAssignments = assignments.filter((a) => a.status === 'completed').length
    const blockedEmployees = employees.filter((e) => e.isBlocked).length

    const passedTests = results.filter((r) => r.passed).length
    const passRate = results.length > 0 ? Math.round((passedTests / results.length) * 100) : 0

    return {
      totalEmployees: employees.length,
      activeCourses: courses.length,
      overdueCount,
      passRate,
      blockedEmployees,
      completedAssignments,
      totalAssignments: assignments.length,
    }
  },

  // Для manager — только своё подразделение
  getManagerStats: async (departmentId: number): Promise<DashboardStats> => {
    const [employeesRes, assignmentsRes] = await Promise.all([
      apiClient.get<Employee[]>('/employees', { params: { departmentId } }),
      apiClient.get<CourseAssignment[]>('/course-assignments'),
    ])

    const employees = employeesRes.data
    const employeeIds = new Set(employees.map((e) => e.id))
    const assignments = assignmentsRes.data.filter((a) => employeeIds.has(a.employeeId))

    const overdueCount = assignments.filter((a) => a.status === 'overdue').length
    const completedAssignments = assignments.filter((a) => a.status === 'completed').length

    return {
      totalEmployees: employees.length,
      activeCourses: 0, // manager не видит все курсы
      overdueCount,
      passRate: 0, // TODO: фильтровать результаты по сотрудникам отдела
      blockedEmployees: employees.filter((e) => e.isBlocked).length,
      completedAssignments,
      totalAssignments: assignments.length,
    }
  },

  // Для employee — только свои данные
  getEmployeeStats: async (employeeId: number): Promise<Partial<DashboardStats>> => {
    const [empRes, assignmentsRes, resultsRes] = await Promise.all([
      apiClient.get<Employee>(`/employees/${employeeId}`),
      apiClient.get<CourseAssignment[]>('/course-assignments', { params: { employeeId } }),
      apiClient.get<TestResult[]>('/tests/results', { params: { employeeId } }),
    ])

    const assignments = assignmentsRes.data
    const results = resultsRes.data

    const overdueCount = assignments.filter((a) => a.status === 'overdue').length
    const completedAssignments = assignments.filter((a) => a.status === 'completed').length

    const passedTests = results.filter((r) => r.passed).length
    const passRate = results.length > 0 ? Math.round((passedTests / results.length) * 100) : 0

    return {
      totalEmployees: 1,
      activeCourses: assignments.length,
      overdueCount,
      passRate,
      blockedEmployees: empRes.data.isBlocked ? 1 : 0,
      completedAssignments,
      totalAssignments: assignments.length,
    }
  },
}