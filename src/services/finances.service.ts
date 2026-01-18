import api from './api';
import { Payment, PaymentStatus, FinancialSummary } from '../types';

export interface CreatePaymentData {
  studentId: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export interface PaymentsResponse {
  payments: Payment[];
  summary: FinancialSummary | { pendingAmount: number; overdueAmount: number; totalDue: number };
}

export const financesService = {
  async getPayments(studentId?: string, status?: PaymentStatus): Promise<PaymentsResponse> {
    const params: { studentId?: string; status?: PaymentStatus } = {};
    if (studentId) params.studentId = studentId;
    if (status) params.status = status;
    const response = await api.get<PaymentsResponse>('/finances/payments', { params });
    return response.data;
  },

  async getSummary(): Promise<FinancialSummary> {
    const response = await api.get<FinancialSummary>('/finances/summary');
    return response.data;
  },

  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get<Payment>(`/finances/payments/${id}`);
    return response.data;
  },

  async createPayment(data: CreatePaymentData): Promise<Payment> {
    const response = await api.post<Payment>('/finances/payments', data);
    return response.data;
  },

  async updatePayment(id: string, data: Partial<CreatePaymentData & { status: PaymentStatus }>): Promise<Payment> {
    const response = await api.patch<Payment>(`/finances/payments/${id}`, data);
    return response.data;
  },

  async markAsPaid(id: string): Promise<Payment> {
    const response = await api.patch<Payment>(`/finances/payments/${id}/pay`);
    return response.data;
  },

  async deletePayment(id: string): Promise<void> {
    await api.delete(`/finances/payments/${id}`);
  },
};

export default financesService;
