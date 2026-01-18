import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { feedbackService, WorkoutFeedback } from '../../services/feedback.service';

export default function StudentFeedbackDetailScreen({ navigation, route }: any) {
  const { feedbackId } = route.params;
  const [feedback, setFeedback] = useState<WorkoutFeedback | null>(null);

  const loadFeedback = async () => {
    try {
      const data = await feedbackService.getById(feedbackId);
      setFeedback(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeedback();
    }, [feedbackId])
  );

  if (!feedback) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <View style={[
          styles.statusBadge,
          feedback.status === 'RESOLVED' ? styles.statusResolved : styles.statusOpen
        ]}>
          <Text style={styles.statusText}>
            {feedback.status === 'RESOLVED' ? 'Resolvido' : 'Aguardando resposta'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Treino info */}
        <View style={styles.workoutCard}>
          <Text style={styles.workoutLabel}>Treino:</Text>
          <Text style={styles.workoutName}>{feedback.workout.name}</Text>
        </View>

        {/* Seu feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seu Feedback</Text>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{feedback.message}</Text>
            <Text style={styles.messageDate}>
              {new Date(feedback.createdAt).toLocaleString('pt-BR')}
            </Text>
          </View>
        </View>

        {/* Respostas do Personal */}
        {feedback.responses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Respostas do Personal</Text>
            {feedback.responses.map((response) => (
              <View key={response.id} style={styles.responseCard}>
                <View style={styles.responseHeader}>
                  <Text style={styles.responseAuthor}>{response.personal.name}</Text>
                  <Text style={styles.responseDate}>
                    {new Date(response.createdAt).toLocaleString('pt-BR')}
                  </Text>
                </View>
                <Text style={styles.responseText}>{response.message}</Text>
              </View>
            ))}
          </View>
        )}

        {feedback.responses.length === 0 && feedback.status === 'OPEN' && (
          <View style={styles.waitingBox}>
            <Text style={styles.waitingIcon}>⏳</Text>
            <Text style={styles.waitingText}>
              Aguardando resposta do seu personal trainer
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    color: '#7C3AED',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusResolved: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  workoutLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  messageBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderLeftWidth: 3,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  messageDate: {
    color: '#666',
    fontSize: 11,
    marginTop: 12,
  },
  responseCard: {
    backgroundColor: '#1f1f3a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  responseAuthor: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '600',
  },
  responseDate: {
    color: '#666',
    fontSize: 11,
  },
  responseText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  waitingBox: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  waitingIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  waitingText: {
    color: '#f59e0b',
    fontSize: 14,
    textAlign: 'center',
  },
});
