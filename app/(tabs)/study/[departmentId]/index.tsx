import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import DepartmentDetail from '@/components/DepartmentDetail';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDepartments } from '@/contexts/DepartmentsContext';
import { StyleSheet } from 'react-native';

export default function DepartmentDetailScreen() {
  const { t } = useTranslation();
  const { departmentId } = useLocalSearchParams<{ departmentId: string }>();
  const { getDepartment, toggleFavorite, updateDepartment } = useDepartments();

  const department = getDepartment(Number(departmentId));

  if (!department) {
    return (
      <ThemedView style={styles.notFound}>
        <ThemedText>{t('study.buildingNotFound')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <DepartmentDetail
      department={department}
      onFavoriteToggle={toggleFavorite}
      onDepartmentUpdate={updateDepartment}
    />
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
