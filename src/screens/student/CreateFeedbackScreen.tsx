import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { feedbackService } from '../../services/feedback.service';

export default function CreateFeedbackScreen({ navigation, route }: any) {
  const { workoutId, workoutName } = route.params;
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Erro', 'Por favor, escreva seu feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.create({
        workoutId,
        message: message.trim(),
      });
      Alert.alert('Sucesso', 'Feedback enviado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o feedback. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Novo Feedback</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutLabel}>Treino:</Text>
          <Text style={styles.workoutName}>{workoutName}</Text>
        </View>

        <Text style={styles.label}>Como foi seu treino?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Conte sobre sua experiência, dificuldades, sugestões ou dúvidas..."
          placeholderTextColor="#666"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Sugestões do que compartilhar:</Text>
          <Text style={styles.suggestionItem}>• Como você se sentiu durante o treino</Text>
          <Text style={styles.suggestionItem}>• Exercícios que foram muito fáceis ou difíceis</Text>
          <Text style={styles.suggestionItem}>• Desconfortos ou dores</Text>
          <Text style={styles.suggestionItem}>• Dúvidas sobre execução</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
          </Text>
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
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    color: '#7C3AED',
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  workoutInfo: {
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 150,
  },
  suggestions: {
    marginTop: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 12,
  },
  suggestionItem: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 6,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
