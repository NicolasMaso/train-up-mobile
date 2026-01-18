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

type FilterStatus = 'ALL' | 'OPEN' | 'RESOLVED';

export default function FeedbackListScreen({ navigation }: any) {
  const [feedbacks, setFeedbacks] = useState<WorkoutFeedback[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('OPEN');

  const loadFeedbacks = async () => {
    try {
      const status = filter === 'ALL' ? undefined : filter as 'OPEN' | 'RESOLVED';
      const data = await feedbackService.getAll(status);
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeedbacks();
    }, [filter])
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
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.student.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.studentName}>{item.student.name}</Text>
            <Text style={styles.workoutName}>{item.workout.name}</Text>
          </View>
        </View>
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
        <Text style={styles.responses}>
          {item.responses.length} resposta(s)
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feedbacks</Text>
      </View>

      <View style={styles.filterContainer}>
        {(['OPEN', 'RESOLVED', 'ALL'] as FilterStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filter === status && styles.filterButtonActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
              {status === 'OPEN' ? 'Abertos' : status === 'RESOLVED' ? 'Resolvidos' : 'Todos'}
            </Text>
          </TouchableOpacity>
        ))}
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
            <Text style={styles.emptyTitle}>Nenhum feedback encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Os feedbacks dos seus alunos aparecerão aqui
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  filterText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 20,
    paddingTop: 0,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  workoutName: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
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
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  responses: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '500',
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
