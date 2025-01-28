import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient, User, Session } from "@supabase/supabase-js";

// Load Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Supabase auth event:", event);

        // Log the session details for debugging
        console.log("Supabase session details:", session);

        setSession(session);
        setUser(session?.user || null);

        // Additional logging to check if state is updated
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
      });

      if (error) {
        console.error("Error during Google sign-in:", error);
        throw error; // Re-throw the error to be caught by the caller
      }

      // Optionally, you can handle successful sign-in here if needed
    } catch (error) {
      console.error("Unhandled error during Google sign-in:", error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error during sign-out:", error);
      // Handle the error appropriately, e.g., show an error message to the user
    } else {
      console.log("User signed out successfully");
      // Perform any additional cleanup or state reset if necessary
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