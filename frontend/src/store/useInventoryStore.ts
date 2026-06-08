import { create } from 'zustand';
import { apiClient } from '../api/client';

interface InventoryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  
  fetchInventory: () => Promise<void>;
  updateItemAmount: (id: string, newAmount: number) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/inventory'); 
      set({ items: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Помилка завантаження складу:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  updateItemAmount: async (id, newAmount) => {
    const previousItems = get().items;
    set({ 
      items: previousItems.map(item => item.id === id ? { ...item, amount: newAmount } : item) 
    });

    try {
      await apiClient.patch(`/inventory/${id}`, { amount: newAmount });
    } catch (error) {
      console.error('Помилка оновлення:', error);
      set({ items: previousItems });
    }
  }
}));