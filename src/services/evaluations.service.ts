import api from './api';
import { Evaluation } from '../types';

export interface CreateEvaluationData {
  studentId: string;
  weight: number;
  height: number;
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
  evaluationDate?: string;
}

export interface ProgressData {
  evaluations: Evaluation[];
  progress: {
    weightChange: number;
    bodyFatChange: number | null;
    bmiChange: number | null;
    periodDays: number;
  } | null;
}

export const evaluationsService = {
  async getAll(studentId: string): Promise<Evaluation[]> {
    const response = await api.get<Evaluation[]>('/evaluations', { params: { studentId } });
    return response.data;
  },

  async getById(id: string): Promise<Evaluation> {
    const response = await api.get<Evaluation>(`/evaluations/${id}`);
    return response.data;
  },

  async getProgress(studentId: string): Promise<ProgressData> {
    const response = await api.get<ProgressData>('/evaluations/progress', { params: { studentId } });
    return response.data;
  },

  async create(data: CreateEvaluationData): Promise<Evaluation> {
    const response = await api.post<Evaluation>('/evaluations', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateEvaluationData>): Promise<Evaluation> {
    const response = await api.patch<Evaluation>(`/evaluations/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/evaluations/${id}`);
  },
};

export default evaluationsService;
