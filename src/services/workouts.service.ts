import api from './api';
import { Workout, WorkoutExercise } from '../types';

export interface CreateWorkoutData {
  name: string;
  description?: string;
  studentId: string;
  scheduledDate?: string;
  expiresAt?: string;
  exercises: Omit<WorkoutExercise, 'id' | 'exercise'>[];
}

export const workoutsService = {
  async getAll(studentId?: string): Promise<Workout[]> {
    const params = studentId ? { studentId } : {};
    const response = await api.get<Workout[]>('/workouts', { params });
    return response.data;
  },

  async getExpiring(days: number = 7): Promise<Workout[]> {
    const response = await api.get<Workout[]>('/workouts/expiring', { params: { days } });
    return response.data;
  },

  async getById(id: string): Promise<Workout> {
    const response = await api.get<Workout>(`/workouts/${id}`);
    return response.data;
  },

  async create(data: CreateWorkoutData): Promise<Workout> {
    const response = await api.post<Workout>('/workouts', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateWorkoutData>): Promise<Workout> {
    const response = await api.patch<Workout>(`/workouts/${id}`, data);
    return response.data;
  },

  async markAsCompleted(id: string): Promise<Workout> {
    const response = await api.patch<Workout>(`/workouts/${id}/complete`);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/workouts/${id}`);
  },
};

export default workoutsService;

