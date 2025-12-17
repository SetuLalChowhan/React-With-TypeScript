import { createContext } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
