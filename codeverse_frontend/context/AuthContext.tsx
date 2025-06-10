"use client";

// context/AuthContext.tsx
import { createContext, useEffect, useState, useContext, ReactNode } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      console.log("Fetching user data...");
      const res = await api.get("/me");
      console.log("User data received:", res.data);
      if (res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Don't set user to null immediately on first fetch
      // This prevents flashing of login screen
      if (user !== null) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add retry logic for initial user fetch
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchWithRetry = async () => {
      try {
        await fetchUser();
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying user fetch (${retryCount}/${maxRetries})...`);
          setTimeout(fetchWithRetry, 1000); // Wait 1 second before retry
        } else {
          console.error("Max retries reached for user fetch");
          setLoading(false);
        }
      }
    };

    fetchWithRetry();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", { email, password });
      
      if (response.data.message === 'Login successful') {
        // Wait a short moment to ensure the cookie is set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          // After successful login, fetch the user data
          const userResponse = await api.get("/me");
          if (userResponse.data) {
            setUser(userResponse.data);
            return userResponse.data;
          }
        } catch (userError) {
          console.error("Failed to fetch user after login:", userError);
          // Even if user fetch fails, we can still consider login successful
          // as the cookie is set
          return { email };
        }
      }
      throw new Error("Login failed");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response) {
        throw new Error(error.response.data.error || "Login failed");
      }
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await api.post("/register", { email, password });
      if (response.data.user) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error("Registration failed");
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.error || "Registration failed");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
