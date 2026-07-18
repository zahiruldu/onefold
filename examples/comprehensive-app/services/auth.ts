/**
 * Authentication service.
 * Demonstrates: Dependency Injection (createToken, provide, inject)
 */
import { createSignal, createToken, provide } from '../../../src/index';

export interface User {
  name: string;
  role: string;
}

export interface AuthState {
  user: ReturnType<typeof createSignal<User | null>>;
  login: (name: string, role: string) => void;
  logout: () => void;
}

export const AuthToken = createToken<AuthState>('AuthService');

const authUser = createSignal<User | null>({ name: 'Admin User', role: 'admin' });

export const authService: AuthState = {
  user: authUser,
  login: (name, role) => authUser.set({ name, role }),
  logout: () => authUser.set(null),
};

provide(AuthToken, authService);
