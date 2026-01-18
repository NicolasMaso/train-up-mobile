import api from './api';
import { TrainingPlan, Workout } from '../types';

export interface WorkoutExerciseData {
  exerciseId: string;
  order: number;
  sets: number;
  reps: string;
  restSeconds?: number;
  weight?: string;
  notes?: string;
}

export interface WorkoutData {
  name: string;
  description?: string;
  exercises: WorkoutExerciseData[];
}

export interface CreateTrainingPlanData {
  name: string;
  description?: string;
  studentId: string;
  startDate: string;
  endDate: string;
  workouts: WorkoutData[];
}

export const trainingPlansService = {
  async getAll(studentId?: string): Promise<TrainingPlan[]> {
    const params = studentId ? { studentId } : {};
    const response = await api.get<TrainingPlan[]>('/training-plans', { params });
    return response.data;
  },

  async getExpiring(days: number = 7): Promise<TrainingPlan[]> {
    const response = await api.get<TrainingPlan[]>('/training-plans/expiring', { params: { days } });
    return response.data;
  },

  async getById(id: string): Promise<TrainingPlan> {
    const response = await api.get<TrainingPlan>(`/training-plans/${id}`);
    return response.data;
  },

  async create(data: CreateTrainingPlanData): Promise<TrainingPlan> {
    const response = await api.post<TrainingPlan>('/training-plans', data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/training-plans/${id}`);
  },

  async toggleActive(id: string): Promise<{ message: string; isActive: boolean }> {
    const response = await api.patch<{ message: string; isActive: boolean }>(`/training-plans/${id}/toggle-active`);
    return response.data;
  },
};

export default trainingPlansService;
