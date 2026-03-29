import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
// Using custom backend with MongoDB Atlas + JWT
import { useToast } from "@/hooks/use-toast";
import { getApiBase, getResponseError } from "@/lib/utils";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API_BASE = getApiBase();

  // On mount: check token in localStorage and verify with backend
  useEffect(() => {
    const token = localStorage.getItem("bg_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Invalid token");
        const data = await res.json();
        setUser(data.user);
        setToken(token);
      })
      .catch(() => {
        localStorage.removeItem("bg_token");
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!response.ok) {
        const errorText = await getResponseError(response);
        throw new Error(errorText || "Failed to sign up");
      }

      const data = await response.json();
      localStorage.setItem("bg_token", data.token);
      setToken(data.token);
      setUser(data.user);

      toast({
        title: "Account created!",
        description: "Welcome to AI Blog Generator",
      });
      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Sign up failed",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await getResponseError(response);
        throw new Error(errorText || "Failed to sign in");
      }

      const data = await response.json();
      localStorage.setItem("bg_token", data.token);
      setToken(data.token);
      setUser(data.user);

      toast({ title: "Welcome back!", description: "Successfully signed in" });
      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Sign in failed",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("bg_token");
    setToken(null);
    setUser(null);
    toast({ title: "Signed out", description: "Come back soon!" });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, signUp, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
