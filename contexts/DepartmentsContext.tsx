import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import departmentList from '@/assets/images/departmentList.json';
import { Department } from '@/types';

const STORAGE_KEY = '@unisquat/departments';

type DepartmentsContextValue = {
  departments: Department[];
  isLoaded: boolean;
  getDepartment: (id: number) => Department | undefined;
  toggleFavorite: (id: number) => void;
  updateDepartment: (updated: Department) => void;
};

const DepartmentsContext = createContext<DepartmentsContextValue | null>(null);

export function DepartmentsProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        setDepartments(stored ? JSON.parse(stored) : (departmentList as unknown as Department[]));
      } catch (error) {
        console.error('Failed to load persisted departments:', error);
        setDepartments(departmentList as unknown as Department[]);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: Department[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(error => {
      console.error('Failed to persist departments:', error);
    });
  }, []);

  const getDepartment = useCallback(
    (id: number) => departments.find(dept => dept.id === id),
    [departments]
  );

  const toggleFavorite = useCallback((id: number) => {
    setDepartments(prev => {
      const next = prev.map(dept =>
        dept.id === id ? { ...dept, isFavorite: !dept.isFavorite } : dept
      );
      persist(next);
      return next;
    });
  }, [persist]);

  const updateDepartment = useCallback((updated: Department) => {
    setDepartments(prev => {
      const next = prev.map(dept => (dept.id === updated.id ? updated : dept));
      persist(next);
      return next;
    });
  }, [persist]);

  const value = useMemo(
    () => ({ departments, isLoaded, getDepartment, toggleFavorite, updateDepartment }),
    [departments, isLoaded, getDepartment, toggleFavorite, updateDepartment]
  );

  return <DepartmentsContext.Provider value={value}>{children}</DepartmentsContext.Provider>;
}

export function useDepartments() {
  const context = useContext(DepartmentsContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentsProvider');
  }
  return context;
}
