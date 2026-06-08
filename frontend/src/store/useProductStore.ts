import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface Product {
  _id: string; 
  householdId: string;
  name: string;
  defaultUnit: 'g' | 'ml' | 'pcs';
  isDivisible: boolean;
  inStockAmount: number;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  fetchProducts: () => Promise<void>;
  addProduct: (productData: { name: string; defaultUnit: string; isDivisible?: boolean; inStockAmount?: number }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Product[]>('/products');
      set({ products: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Помилка завантаження продуктів:', error);
      set({ error: error.message || 'Сталася помилка', isLoading: false });
    }
  },

  addProduct: async (productData) => {
    try {
      const response = await apiClient.post<{ message: string; product: Product }>('/products', productData);
      const newProduct = response.data.product;
      
      set((state) => ({
        products: [newProduct, ...state.products]
      }));
    } catch (error: any) {
      console.error('Помилка додавання продукту:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    const previousProducts = get().products;
    set({ products: previousProducts.filter(p => p._id !== id) });

    try {
      await apiClient.delete(`/products/${id}`);
    } catch (error) {
      console.error('Помилка видалення продукту:', error);
      set({ products: previousProducts });
      throw error;
    }
  }
}));