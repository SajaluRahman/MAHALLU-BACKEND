// ============================================================
// MAHALLU ERP — Shared Types & Interfaces
// ============================================================

// ---- Enums ----

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SECRETARY = 'secretary',
  TREASURER = 'treasurer',
  IMAM = 'imam',
  MADRASA_PRINCIPAL = 'madrasa_principal',
  USTADH = 'ustadh',
  PARENT = 'parent',
  STUDENT = 'student',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
  MIGRATED = 'migrated',
}

export enum PaymentType {
  DONATION = 'donation',
  SUBSCRIPTION = 'subscription',
  MADRASA_FEE = 'madrasa_fee',
  RENTAL = 'rental',
  ZAKAT = 'zakat',
  EVENT = 'event',
  SALARY = 'salary',
  MAINTENANCE = 'maintenance',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentGateway {
  RAZORPAY = 'razorpay',
  UPI = 'upi',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

export enum CertificateType {
  RESIDENCE = 'residence',
  MEMBERSHIP = 'membership',
  NIKAH = 'nikah',
  STUDENT = 'student',
  COMPLETION = 'completion',
  TRANSFER = 'transfer',
  DEATH = 'death',
}

export enum NotificationChannel {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  HOLIDAY = 'holiday',
}

export enum PropertyType {
  BUILDING = 'building',
  SHOP = 'shop',
  RENTAL_HOUSE = 'rental_house',
  LAND = 'land',
  EQUIPMENT = 'equipment',
}

export enum LeaseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  PENDING = 'pending',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum Language {
  EN = 'en',
  ML = 'ml',
  AR = 'ar',
}

// ---- Base Interfaces ----

export interface BaseDocument {
  _id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  gps?: GeoLocation;
}

export interface FileAttachment {
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  size: number;
}

// ---- Tenant ----

export interface ITenant extends BaseDocument {
  name: string;
  mahalluCode: string;
  domain?: string;
  logo?: string;
  address: Address;
  phone: string;
  email: string;
  plan: 'free' | 'basic' | 'premium';
  settings: TenantSettings;
  isActive: boolean;
}

export interface TenantSettings {
  theme: 'light' | 'dark' | 'system';
  language: Language;
  currency: string;
  timezone: string;
  dateFormat: string;
  prayerTimeMethod: string;
  iqamahTimes?: Record<string, string>;
}

// ---- User ----

export interface IUser extends BaseDocument {
  tenantId: string;
  memberId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
  refreshTokens: string[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  fcmToken?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  permissions: string[];
}

// ---- Member ----

export interface IMember extends BaseDocument {
  memberId: string; // e.g., MHL-2024-001
  name: string;
  nameAr?: string;
  nameML?: string;
  gender: Gender;
  dateOfBirth?: string;
  bloodGroup?: string;
  photo?: FileAttachment;
  aadhaarNumber?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  occupation?: string;
  qualification?: string;
  familyId?: string;
  relationship?: string;
  status: MemberStatus;
  qrCode?: string;
  userId?: string;
}

// ---- Family ----

export interface IFamily extends BaseDocument {
  familyCode: string; // e.g., FAM-001
  headMemberId: string;
  members: FamilyMember[];
  address: Address;
  wardNo?: string;
  outstandingBalance: number;
  qrCode?: string;
  photo?: FileAttachment;
  recurringDonationType?: 'monthly' | 'yearly' | 'none';
  recurringDonationAmount?: number;
}

export interface FamilyMember {
  memberId: string;
  relationship: string;
  isHead: boolean;
}

// ---- Mosque ----

export interface IMosque extends BaseDocument {
  name: string;
  nameAr?: string;
  registrationNo?: string;
  yearEstablished?: number;
  address: Address;
  phone?: string;
  email?: string;
  imamId?: string;
  muazzinId?: string;
  capacity?: number;
  facilities: string[];
  committee: CommitteeMember[];
  assets: MosqueAsset[];
  bankAccounts: BankAccount[];
}

export interface CommitteeMember {
  memberId: string;
  position: string;
  startDate: string;
  endDate?: string;
}

export interface MosqueAsset {
  name: string;
  description?: string;
  value?: number;
  purchasedAt?: string;
  condition: 'good' | 'fair' | 'poor';
}

export interface BankAccount {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  accountType: string;
  balance?: number;
}

// ---- Madrasa ----

export interface IMadrasa extends BaseDocument {
  name: string;
  registrationNo?: string;
  principalId?: string;
  address: Address;
  phone?: string;
  email?: string;
  classes: string[];
  subjects: string[];
  academicYear: string;
  affiliatedTo?: string;
}

// ---- Student ----

export interface IStudent extends BaseDocument {
  admissionNo: string;
  memberId: string;
  madrasaId: string;
  classId: string;
  batchId?: string;
  guardianId: string;
  familyId?: string;
  admissionDate: string;
  status: 'active' | 'promoted' | 'transferred' | 'withdrawn';
  qrCode?: string;
  idCardUrl?: string;
  hifzProgress?: HifzProgress;
  tajweedLevel?: string;
  feePaid: number;
  feeBalance: number;
}

export interface HifzProgress {
  completedJuz: number[];
  currentJuz: number;
  currentSurah: string;
  lastAssessedAt: string;
}

// ---- Teacher ----

export interface ITeacher extends BaseDocument {
  memberId: string;
  madrasaId: string;
  employeeId: string;
  subjects: string[];
  qualification: string;
  experience?: number;
  salary: number;
  joiningDate: string;
  status: 'active' | 'resigned' | 'terminated';
  documents: FileAttachment[];
  bankAccount?: BankAccount;
}

// ---- Attendance ----

export interface IAttendance extends BaseDocument {
  entityType: 'student' | 'teacher' | 'member';
  entityId: string;
  classId?: string;
  date: string;
  status: AttendanceStatus;
  markedById: string;
  note?: string;
}

// ---- Payment ----

export interface IPayment extends BaseDocument {
  paymentNo: string;
  type: PaymentType;
  amount: number;
  paidById: string;
  paidForId?: string;
  gateway: PaymentGateway;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  status: PaymentStatus;
  description?: string;
  receiptId?: string;
  metadata?: Record<string, unknown>;
}

// ---- Donation ----

export interface IDonation extends BaseDocument {
  donorId?: string;
  donorName?: string;
  amount: number;
  campaign?: string;
  purpose?: string;
  paymentId?: string;
  isAnonymous: boolean;
  receiptId?: string;
  status?: 'pending' | 'paid' | 'partial';
  dueDate?: string;
}

// ---- Property ----

export interface IProperty extends BaseDocument {
  propertyCode: string;
  type: PropertyType;
  name: string;
  address: Address;
  area?: number;
  rentAmount?: number;
  status: 'vacant' | 'occupied' | 'maintenance';
  documents: FileAttachment[];
  currentLeaseId?: string;
}

// ---- Zakat ----

export interface IZakat extends BaseDocument {
  year: number;
  totalCollected: number;
  totalDistributed: number;
  applicants: ZakatApplicant[];
  status: 'open' | 'closed';
}

export interface ZakatApplicant {
  memberId: string;
  amountRequested: number;
  amountApproved?: number;
  status: 'pending' | 'approved' | 'rejected' | 'distributed';
  notes?: string;
}

// ---- Nikah ----

export interface INikah extends BaseDocument {
  nikahNo: string;
  brideId?: string;
  brideName: string;
  brideFatherName: string;
  groomId?: string;
  groomName: string;
  groomFatherName: string;
  imamId: string;
  witnesses: NikahWitness[];
  mehr: number;
  mehrCurrency: string;
  date: string;
  venue?: string;
  documents: FileAttachment[];
  certificateId?: string;
}

export interface NikahWitness {
  name: string;
  memberId?: string;
  phone?: string;
  signature?: string;
}

// ---- Death Record ----

export interface IDeathRecord extends BaseDocument {
  memberId: string;
  dateOfDeath: string;
  timeOfDeath?: string;
  causeOfDeath?: string;
  janazahDate?: string;
  janazahVenue?: string;
  imamId?: string;
  burialDate?: string;
  burialPlace?: string;
  cemeteryId?: string;
  plotId?: string;
  expenses: DeathExpense[];
  certificateId?: string;
}

export interface DeathExpense {
  description: string;
  amount: number;
  paidById?: string;
}

// ---- Certificate ----

export interface ICertificate extends BaseDocument {
  certificateNo: string;
  type: CertificateType;
  recipientId: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt?: string;
  pdfUrl?: string;
  publicId?: string;
  data: Record<string, unknown>;
  isRevoked: boolean;
}

// ---- Event ----

export interface IEvent extends BaseDocument {
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  venue?: string;
  capacity?: number;
  registrations: EventRegistration[];
  isFeatured: boolean;
  isPaid: boolean;
  fee?: number;
  banner?: FileAttachment;
}

export interface EventRegistration {
  memberId: string;
  registeredAt: string;
  paymentId?: string;
  attended: boolean;
}

// ---- Survey ----

export interface ISurvey extends BaseDocument {
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  isActive: boolean;
  expiresAt?: string;
}

export interface SurveyQuestion {
  _id: string;
  question: string;
  type: 'text' | 'single_choice' | 'multiple_choice' | 'rating' | 'boolean';
  options?: string[];
  isRequired: boolean;
}

export interface SurveyResponse {
  memberId?: string;
  respondedAt: string;
  answers: { questionId: string; answer: string | string[] }[];
}

// ---- Notification ----

export interface INotification extends BaseDocument {
  channel: NotificationChannel;
  recipientId?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  scheduledAt?: string;
  sentAt?: string;
  error?: string;
}

// ---- Audit Log ----

export interface IAuditLog extends BaseDocument {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  entity: string;
  entityId?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  ip?: string;
  userAgent?: string;
}

// ---- API Response Wrappers ----

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---- Auth ----

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
  tenantCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
  permissions: string[];
}
