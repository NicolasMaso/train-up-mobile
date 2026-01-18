export enum UserRole {
  PERSONAL = 'PERSONAL',
  STUDENT = 'STUDENT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  personalId?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Student extends User {
  _count?: {
    studentWorkouts: number;
    evaluations: number;
  };
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  videoUrl?: string;
  muscleGroup?: string;
  equipment?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps: string;
  restSeconds?: number;
  weight?: string;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  trainingPlanId?: string;
  studentId: string;
  personalId: string;
  completedAt?: string;
  exercises: WorkoutExercise[];
  student?: { id: string; name: string };
  personal?: { id: string; name: string };
  trainingPlan?: { id: string; name: string; startDate: string; endDate: string };
  createdAt: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  description?: string;
  studentId: string;
  personalId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  workouts: Workout[];
  student?: { id: string; name: string; avatar?: string };
  personal?: { id: string; name: string };
  createdAt: string;
}

export interface Anamnesis {
  id: string;
  studentId: string;
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  previousInjuries?: string;
  surgeries?: string;
  occupation?: string;
  sleepHours?: number;
  stressLevel?: number;
  smokingHabit: boolean;
  alcoholConsumption?: string;
  mainGoal?: string;
  secondaryGoals?: string;
  exerciseExperience?: string;
  currentActivityLevel?: string;
  dietaryRestrictions?: string;
  mealsPerDay?: number;
  waterIntakeLiters?: number;
  notes?: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  studentId: string;
  weight: number;
  height: number;
  bmi?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  restingHeartRate?: number;
  bloodPressure?: string;
  notes?: string;
  evaluationDate: string;
}

export interface Payment {
  id: string;
  studentId: string;
  personalId: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  description?: string;
  student?: { id: string; name: string; email: string };
  personal?: { id: string; name: string };
}

export interface FinancialSummary {
  pendingAmount: number;
  overdueAmount: number;
  totalReceived: number;
  monthlyRevenue: number;
  totalStudentsWithPendingPayments: number;
}
