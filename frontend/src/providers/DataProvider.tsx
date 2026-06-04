import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Family {
  id: string;
  name: string;
  membersCount: number;
}

type DataContextType = {
  user: User | null;
  currentFamily: Family | null;
  setUser: (user: User | null) => void;
  setCurrentFamily: (family: Family | null) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>({ id: '1', name: 'Ярослав', email: 'test@test.com' });
  const [currentFamily, setCurrentFamily] = useState<Family | null>({ id: 'f1', name: 'Моя Сім\'я', membersCount: 3 });

  return (
    <DataContext.Provider value={{ user, currentFamily, setUser, setCurrentFamily }}>
      {children}
    </DataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useAppData must be used within DataProvider');
  return context;
};