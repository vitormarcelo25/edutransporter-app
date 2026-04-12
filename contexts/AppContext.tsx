import React, { createContext, useContext, useState } from 'react';
import { Colors } from '../constants/theme';

export type UserRole = 'aluno' | 'motorista';

// Aqui o nosso contexto tem de ter o selectedSeat e o setSelectedSeat!
const AppContext = createContext({
  isDark: true,
  toggleTheme: () => {},
  theme: Colors.dark,
  userRole: 'aluno' as UserRole,
  setUserRole: (role: UserRole) => {},
  selectedSeat: null as number | null,
  setSelectedSeat: (seat: number | null) => {},
});

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('aluno');
  
  // Estado global para o lugar escolhido do autocarro
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <AppContext.Provider value={{ isDark, toggleTheme, theme, userRole, setUserRole, selectedSeat, setSelectedSeat }}>
      {children}
    </AppContext.Provider>
  );
};
