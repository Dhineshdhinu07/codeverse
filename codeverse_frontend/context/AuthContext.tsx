"use client";

// context/AuthContext.tsx
import { createContext, useEffect, useState, useContext, ReactNode } from "react";
import api, { checkServerHealth } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username: string;
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
      // Check if we have a token in cookies before making the request
      const hasToken = document.cookie.includes('token=');
      if (!hasToken) {
        console.log('No token found in cookies, skipping user fetch');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Fetching user data...');
      const res = await api.get("/api/users/me");
      console.log('User data response:', res.data);
      
      if (res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      
      // Handle specific error cases
      if (error.message.includes('HTML response')) {
        console.error('Server returned HTML instead of JSON. Please check the API endpoint.');
      } else if (error.message.includes('Authentication failed') || 
                 error.message.includes('Unauthorized') ||
                 error.message.includes('Token expired') ||
                 error.message.includes('Invalid token')) {
        // Clear any existing auth state
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        setUser(null);
      }
      // Don't set user to null immediately on first fetch
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
    let timeoutId: NodeJS.Timeout;
    
    const fetchWithRetry = async () => {
      try {
        await fetchUser();
      } catch (error: any) {
        console.error('Error in fetchWithRetry:', error.message);
        
        // Only retry on connection errors
        if (retryCount < maxRetries && 
            (error.message.includes('Unable to connect') || 
             error.message.includes('timed out') ||
             error.message.includes('HTML instead of JSON'))) {
          retryCount++;
          console.log(`Retrying user fetch (${retryCount}/${maxRetries})...`);
          timeoutId = setTimeout(fetchWithRetry, 1000 * Math.pow(2, retryCount)); // Exponential backoff
        } else {
          setLoading(false);
        }
      }
    };

    fetchWithRetry();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLogin = async (): Promise<User> => {
      try {
        console.log('Attempting login with:', { email });
        const response = await api.post("/api/auth/login", { email, password });
        console.log('Login response:', response.data);
        
        if (response.data.message === 'Login successful') {
          // Wait a short moment to ensure the cookie is set
          await new Promise(resolve => setTimeout(resolve, 100));
          
          try {
            console.log('Fetching user data...');
            const userResponse = await api.get("/api/users/me");
            console.log('User data response:', userResponse.data);
            
            if (userResponse.data) {
              setUser(userResponse.data);
              return userResponse.data;
            }
          } catch (userError: any) {
            console.error("Failed to fetch user after login:", {
              message: userError.message,
              code: userError.code,
              response: userError.response?.data,
              stack: userError.stack
            });
            // Return minimal user data if full fetch fails
            return { 
              id: response.data.user.id,
              email: response.data.user.email,
              username: response.data.user.username,
              createdAt: new Date().toISOString()
            };
          }
        }
        throw new Error("Login failed");
      } catch (error: any) {
        console.error('Login attempt failed:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          stack: error.stack
        });
        
        // If it's a connection error and we haven't exceeded retries, try again
        if ((error.message.includes('Unable to connect') || 
             error.message.includes('timed out')) && 
            retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying login (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          return attemptLogin();
        }
        throw error;
      }
    };

    return attemptLogin();
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/register", { email, password });
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
      await api.post("/api/auth/logout");
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
