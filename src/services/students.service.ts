import api from './api';
import { Student } from '../types';

export interface CreateStudentData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export const studentsService = {
  async getAll(): Promise<Student[]> {
    const response = await api.get<Student[]>('/students');
    return response.data;
  },

  async getById(id: string): Promise<Student> {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  },

  async create(data: CreateStudentData): Promise<Student> {
    const response = await api.post<Student>('/students', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateStudentData>): Promise<Student> {
    const response = await api.patch<Student>(`/students/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};

export default studentsService;
