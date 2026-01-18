import api from './api';
import { Exercise } from '../types';

export interface CreateExerciseData {
  name: string;
  description?: string;
  videoUrl?: string;
  muscleGroup?: string;
  equipment?: string;
}

export const exercisesService = {
  async getAll(muscleGroup?: string): Promise<Exercise[]> {
    const params = muscleGroup ? { muscleGroup } : {};
    const response = await api.get<Exercise[]>('/exercises', { params });
    return response.data;
  },

  async getById(id: string): Promise<Exercise> {
    const response = await api.get<Exercise>(`/exercises/${id}`);
    return response.data;
  },

  async create(data: CreateExerciseData): Promise<Exercise> {
    const response = await api.post<Exercise>('/exercises', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateExerciseData>): Promise<Exercise> {
    const response = await api.patch<Exercise>(`/exercises/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/exercises/${id}`);
  },
};

export default exercisesService;
