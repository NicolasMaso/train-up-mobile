import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { feedbackService, WorkoutFeedback } from '../../services/feedback.service';

export default function MyFeedbacksScreen({ navigation }: any) {
  const [feedbacks, setFeedbacks] = useState<WorkoutFeedback[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeedbacks = async () => {
    try {
      const data = await feedbackService.getAll();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeedbacks();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedbacks();
    setRefreshing(false);
  };

  const renderFeedback = ({ item }: { item: WorkoutFeedback }) => (
    <TouchableOpacity
      style={styles.feedbackCard}
      onPress={() => navigation.navigate('FeedbackDetail', { feedbackId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.workoutName}>{item.workout.name}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'RESOLVED' ? styles.statusResolved : styles.statusOpen
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'RESOLVED' ? 'Resolvido' : 'Aberto'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.message} numberOfLines={2}>
        {item.message}
      </Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
        {item.responses.length > 0 && (
          <View style={styles.responseBadge}>
            <Text style={styles.responseText}>
              {item.responses.length} resposta(s)
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meus Feedbacks</Text>
      </View>

      <FlatList
        data={feedbacks}
        renderItem={renderFeedback}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7C3AED"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Nenhum feedback enviado</Text>
            <Text style={styles.emptySubtitle}>
              Após completar um treino, você pode enviar um feedback para seu personal
            </Text>
          </View>
        }
      />
    </View>
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
  list: {
    padding: 20,
  },
  feedbackCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusResolved: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  message: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  responseBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  responseText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
