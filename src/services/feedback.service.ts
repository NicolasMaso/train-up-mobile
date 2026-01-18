import api from './api';

export interface WorkoutFeedback {
  id: string;
  workoutId: string;
  studentId: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  workout: {
    id: string;
    name: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  responses: FeedbackResponse[];
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  personalId: string;
  message: string;
  createdAt: string;
  personal: {
    id: string;
    name: string;
  };
}

export interface CreateFeedbackDto {
  workoutId: string;
  message: string;
}

export interface CreateResponseDto {
  message: string;
}

export const feedbackService = {
  // Criar feedback (aluno)
  create: async (data: CreateFeedbackDto): Promise<WorkoutFeedback> => {
    const response = await api.post('/feedback', data);
    return response.data;
  },

  // Listar feedbacks
  getAll: async (status?: 'OPEN' | 'RESOLVED'): Promise<WorkoutFeedback[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/feedback', { params });
    return response.data;
  },

  // Obter detalhes de um feedback
  getById: async (id: string): Promise<WorkoutFeedback> => {
    const response = await api.get(`/feedback/${id}`);
    return response.data;
  },

  // Adicionar resposta (personal)
  addResponse: async (feedbackId: string, data: CreateResponseDto): Promise<FeedbackResponse> => {
    const response = await api.post(`/feedback/${feedbackId}/response`, data);
    return response.data;
  },

  // Marcar como resolvido (personal)
  resolve: async (feedbackId: string): Promise<WorkoutFeedback> => {
    const response = await api.patch(`/feedback/${feedbackId}/resolve`);
    return response.data;
  },

  // Reabrir feedback (personal)
  reopen: async (feedbackId: string): Promise<WorkoutFeedback> => {
    const response = await api.patch(`/feedback/${feedbackId}/reopen`);
    return response.data;
  },
};

export default feedbackService;
