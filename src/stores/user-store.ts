import { defineStore } from 'pinia';

interface MockUser {
  username: string;
}

interface UserStoreState {
  accessToken: string;
  user: MockUser | null;
  isAuthenticated: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserStoreState => ({
    accessToken: localStorage.getItem('access_token') || '',
    user: null,
    isAuthenticated: !!localStorage.getItem('access_token'),
  }),

  getters: {
    loggedIn: (state) => state.isAuthenticated,
  },

  actions: {
    login(username: string, password: string): Promise<boolean> {
      return new Promise((resolve) => {
        // 這裡應該是實際的API請求，目前簡化為硬編碼檢查
        if (username === 'admin' && password === 'password') {
          const token = 'dummy_token_' + Math.random().toString(36).substring(2);
          localStorage.setItem('access_token', token);
          this.accessToken = token;
          this.user = { username };
          this.isAuthenticated = true;
          resolve(true);
        } else {
          resolve(false);
        }
      });
    },

    logout() {
      localStorage.removeItem('access_token');
      this.accessToken = '';
      this.user = null;
      this.isAuthenticated = false;
    },

    checkAuth() {
      const token = localStorage.getItem('access_token');
      if (token) {
        this.accessToken = token;
        this.isAuthenticated = true;
        this.user = { username: 'admin' }; // 在實際應用中，應該從後端獲取用戶信息
        return true;
      }
      return false;
    },
  },
});
