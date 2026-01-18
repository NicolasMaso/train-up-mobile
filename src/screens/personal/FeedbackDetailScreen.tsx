import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { feedbackService, WorkoutFeedback } from '../../services/feedback.service';

export default function FeedbackDetailScreen({ navigation, route }: any) {
  const { feedbackId } = route.params;
  const [feedback, setFeedback] = useState<WorkoutFeedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFeedback = async () => {
    try {
      const data = await feedbackService.getById(feedbackId);
      setFeedback(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
      Alert.alert('Erro', 'Não foi possível carregar o feedback');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeedback();
    }, [feedbackId])
  );

  const handleAddResponse = async () => {
    if (!responseText.trim()) {
      Alert.alert('Erro', 'Digite uma resposta');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.addResponse(feedbackId, { message: responseText.trim() });
      setResponseText('');
      await loadFeedback();
      Alert.alert('Sucesso', 'Resposta enviada!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a resposta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    try {
      await feedbackService.resolve(feedbackId);
      await loadFeedback();
      Alert.alert('Sucesso', 'Feedback marcado como resolvido!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível resolver o feedback');
    }
  };

  const handleReopen = async () => {
    try {
      await feedbackService.reopen(feedbackId);
      await loadFeedback();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível reabrir o feedback');
    }
  };

  if (!feedback) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <View style={[
          styles.statusBadge,
          feedback.status === 'RESOLVED' ? styles.statusResolved : styles.statusOpen
        ]}>
          <Text style={styles.statusText}>
            {feedback.status === 'RESOLVED' ? 'Resolvido' : 'Aberto'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Feedback original */}
        <View style={styles.feedbackSection}>
          <View style={styles.studentRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {feedback.student.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.studentName}>{feedback.student.name}</Text>
              <Text style={styles.workoutName}>{feedback.workout.name}</Text>
            </View>
          </View>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{feedback.message}</Text>
            <Text style={styles.messageDate}>
              {new Date(feedback.createdAt).toLocaleString('pt-BR')}
            </Text>
          </View>
        </View>

        {/* Respostas */}
        {feedback.responses.length > 0 && (
          <View style={styles.responsesSection}>
            <Text style={styles.sectionTitle}>Respostas</Text>
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

        {/* Ações */}
        <View style={styles.actionsSection}>
          {feedback.status === 'OPEN' ? (
            <TouchableOpacity style={styles.resolveButton} onPress={handleResolve}>
              <Text style={styles.resolveButtonText}>✓ Marcar como Resolvido</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.reopenButton} onPress={handleReopen}>
              <Text style={styles.reopenButtonText}>↻ Reabrir Feedback</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Input de resposta */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua resposta..."
          placeholderTextColor="#666"
          value={responseText}
          onChangeText={setResponseText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
          onPress={handleAddResponse}
          disabled={isSubmitting}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  },
  contentContainer: {
    padding: 20,
  },
  feedbackSection: {
    marginBottom: 24,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  workoutName: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  messageBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
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
  responsesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  responseCard: {
    backgroundColor: '#1f1f3a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  responseAuthor: {
    color: '#7C3AED',
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
  actionsSection: {
    marginBottom: 20,
  },
  resolveButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  resolveButtonText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
  reopenButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  reopenButtonText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 30,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
