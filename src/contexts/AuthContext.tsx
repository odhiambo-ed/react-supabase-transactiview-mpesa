import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient, User, Session } from "@supabase/supabase-js";

// Load Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
/* eslint-disable */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Supabase auth event:", event);
        setSession(session);
        setUser(session?.user || null);
        console.log("Session and User updated:", session, session?.user);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            import.meta.env.MODE === "development"
              ? "http://localhost:5173/auth/callback"
              : "https://lceqxhhumahvtzkicksx.supabase.co/auth/v1/callback",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Error during Google sign-in:", error);
        throw error;
      }
    } catch (error) {
      console.error("Unhandled error during Google sign-in:", error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error during sign-out:", error);
    } else {
      console.log("User signed out successfully");
    }
  };

  const value: AuthContextProps = {
    user,
    session,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};