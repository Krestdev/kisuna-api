// ==========================================
// ENUMS
// ==========================================

export type SystemRole = 
  | "SUPER_ADMIN"     // System-wide admin (all companies)
  | "COMPANY_ADMIN"   // Company admin (manages one company)
  | "ADMIN"           // HR role
  | "EMPLOYEE";       // Regular employee

export type Gender = "MALE" | "FEMALE";

export type LeaveType = 
  | "ANNUAL" 
  | "SICK" 
  | "MATERNITY" 
  | "PATERNITY" 
  | "UNPAID" 
  | "OTHER";

export type LeaveStatus = 
  | "PENDING_MANAGER"  // Awaiting manager (SUPER_ADMIN) approval
  | "PENDING_HR"       // Manager approved, awaiting HR (ADMIN) approval
  | "APPROVED"         // Fully approved by both manager and HR
  | "REJECTED"         // Rejected by manager or HR
  | "CANCELLED";       // Cancelled by employee

export type AttendanceStatus = 
  | "PRESENT" 
  | "ABSENT" 
  | "LATE" 
  | "HALF_DAY" 
  | "ON_LEAVE" 
  | "FIELD";

export type ContractStatus = "ACTIVE" | "TERMINATED" | "SUSPENDED";

// ==========================================
// EMPLOYEE
// ==========================================

export type Employee = {
  uuid: string;
  firstName: string;
  lastName: string;
  address?: string;
  phoneNumber?: number;
  gender: Gender;
  birthday?: string; // ISO date string
  nationality?: string;
  countryOfResidence?: string;
  matrimonial_status?: number;
  number_of_children?: number;
  CNPSNumber?: string;
  emergencyContactName?: string;
  EmergencyContactPhone?: string;
  
  // ID Document Information
  idDocumentType?: string;
  idDocumentNumber?: string;
  idDocumentIssueDate?: string; // ISO date string
  idDocumentExpiryDate?: string; // ISO date string
  idDocumentIssuePlace?: string;
  idDocumentFileUrl?: string;
  
  // Professional Information
  hireDate?: string; // ISO date string
  category?: string;
  grade?: string;
  paymentMode?: string;
  workLocation?: string;
  workLocationDetails?: string;
  
  status?: string;
  isActive: boolean;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  companyId?: string;
  role?: SystemRole | null; // Employee's system role
  positions?: Position[];
  user?: {
    uuid: string;
    email: string;
    role: SystemRole;
  };
};

// ==========================================
// PROFILE (GET /me/profile)
// ==========================================

export type EmployeeProfile = {
  uuid: string;
  fullName: string;
  grade: string;
  position: string;
  avatarUrl: string;
  personalInfo: {
    lastName: string;
    firstName: string;
    birthday?: string; // ISO date string
    gender: Gender;
    nationality?: string;
    countryOfResidence?: string;
    address?: string;
    phoneNumber?: string;
    email: string;
    matrimonialStatus?: number;
    numberOfChildren?: number;
    emergencyContactPhone?: string;
  };
  administrativeInfo: {
    cnpsNumber?: string;
    idDocumentType?: string;
    idDocumentNumber?: string;
    idDocumentIssueDate?: string; // ISO date string
    idDocumentExpiryDate?: string; // ISO date string
    idDocumentIssuePlace?: string;
    idDocumentFileUrl: string;
  };
  professionalInfo: {
    position: string;
    department: string;
    manager: string;
    category: string;
    grade: string;
    paymentMode?: string;
    workLocation?: string;
    workLocationDetails?: string;
    hireDate?: string; // ISO date string
  };
};

// ==========================================
// POSITION & DEPARTMENT
// ==========================================

export type Position = {
  uuid: string;
  title: string;
  baseSalary?: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  companyId: string;
  departmentId?: string;
  employeeUuid?: string;
  department?: Department;
};

export type Department = {
  uuid: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  companyId: string;
  employeeUuid?: string;
};

// ==========================================
// LEAVE/HOLIDAY
// ==========================================

export type Leave = {
  uuid: number;
  type: LeaveType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  rejectReason?: string;
  justificatifUrl?: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  employeeId: string;
};

export type LeaveListItem = {
  uuid: number;
  issueDate: string; // ISO date string
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: LeaveStatus;
  reason?: string;
};

export type LeaveCreateResponse = {
  uuid: number;
  status: LeaveStatus;
  createdAt: string; // ISO datetime string
  justificatifUrl: string;
};

export type LeaveBalance = {
  year: number;
  total: number;
  used: number;
  remaining: number;
};

// ==========================================
// ATTENDANCE/PRESENCE
// ==========================================

export type Attendance = {
  uuid: string;
  checkIn: string; // ISO datetime string
  checkOut?: string; // ISO datetime string
  latitude: number;
  longitude: number;
  workedHour?: number;
  overtimes?: number;
  status: AttendanceStatus;
  location?: string;
  mission?: string;
  observations?: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  employeeId: string;
};

export type AttendanceRecord = {
  date: string; // ISO date string
  present: boolean;
  late: boolean;
  absent: boolean;
  exceptional: boolean;
  field: boolean;
  onLeave: boolean;
  arrivalTime: string; // HH:MM format
};

export type FieldPresenceResponse = {
  uuid: string;
  date: string; // ISO date string
  status: "FIELD";
  createdAt: string; // ISO datetime string
};

// ==========================================
// DASHBOARD
// ==========================================

export type DashboardData = {
  leaveBalance: {
    remainingDays: number;
    year: number;
  };
  leaveConsumed: {
    usedDays: number;
    percentageUsed: number;
  };
  lastPayslip: {
    period: string; // YYYY-MM
    label: string; // "Janvier 2026"
    totalBulletins: number;
    payslipId: number;
  } | null;
};

// ==========================================
// PAYSLIP
// ==========================================

export type Payslip = {
  uuid: number;
  netSalary: number;
  grossSalary?: number;
  taxAmount?: number;
  issueDate: string; // ISO date string
  pdfUrl?: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  employeeId: string;
  payrollUuid: string;
};

// ==========================================
// CONTRACT
// ==========================================

export type Contract = {
  uuid: number;
  type: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  salary: number;
  status: ContractStatus;
  terminationDate?: string; // ISO date string
  terminationReason?: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  employeeId: string;
};

// ==========================================
// COMPANY
// ==========================================

export type Company = {
  uuid: string;
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

// ==========================================
// PAGINATION
// ==========================================

export type PaginationMeta = {
  page: number;
  limit: number;
  totalPages: number;
  total?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

// ==========================================
// API REQUEST/RESPONSE TYPES
// ==========================================

// Auth
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  user: {
    uuid: string;
    email: string;
    role: SystemRole;
  };
};

// Leave Requests
export type CreateLeaveRequest = {
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  observation?: string;
  deductFromAnnualBalance: boolean;
  justificatif?: File; // for FormData
};

export type GetLeavesQuery = {
  status?: LeaveStatus;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
};

// Attendance Requests
export type GetAttendanceQuery = {
  statuses?: string; // comma-separated: "PRESENT,LATE,FIELD"
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
};

export type FieldPresenceRequest = {
  location: string;
  mission: string;
  observations?: string;
  latitude: number;
  longitude: number;
};

// Password Change
export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
};

// ==========================================
// HELPER TYPES
// ==========================================

export type ApiError = {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
};
