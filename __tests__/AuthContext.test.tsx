// src/contexts/AuthContext.test.tsx
import React from "react";
import '@testing-library/jest-dom';
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth, supabase } from "../src/contexts/AuthContext";

// Mock the Supabase client
jest.mock("./AuthContext", () => ({
  ...jest.requireActual("./AuthContext"), // Keep the actual implementation of other functions
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Helper component to use the useAuth hook in tests
const TestComponent: React.FC = () => {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <div>
      {user ? (
        <button onClick={() => signOut()}>Sign Out</button>
      ) : (
        <button onClick={() => signInWithGoogle()}>Sign In</button>
      )}
      <div data-testid="user-email">{user?.email}</div>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    // Reset mock implementations before each test
    jest.clearAllMocks();
  });

  it("renders children", () => {
    render(
      <AuthProvider>
        <div>Test Children</div>
      </AuthProvider>
    );
    expect(screen.getByText("Test Children")).toBeInTheDocument();
  });

  it("initializes with null user", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId("user-email")).toHaveTextContent("");
  });

  it("signs in with Google", async () => {
    const mockSession = {
      user: { email: "test@example.com" },
      provider_token: "provider-token",
      access_token: "access-token",
    };

    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    // Mock the onAuthStateChange listener to simulate successful sign-in
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
      (callback) => {
        callback("SIGNED_IN", mockSession);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByRole("button", { name: /Sign In/i });
    await act(async () => {
      userEvent.click(signInButton);
    });

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: expect.any(Object),
    });

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com"
      );
    });
  });

  it("handles sign-in error", async () => {
    const signInError = new Error("Sign in failed");
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: signInError,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByRole("button", { name: /Sign In/i });

    // Use act to wrap the asynchronous state update caused by signInWithGoogle
    await act(async () => {
      userEvent.click(signInButton);
    });

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalled();
  });

  it("signs out", async () => {
    const mockSession = {
      user: { email: "test@example.com" },
      provider_token: "provider-token",
      access_token: "access-token",
    };

    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: null,
    });
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    // Mock the onAuthStateChange listener to simulate successful sign-in
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
      (callback) => {
        callback("SIGNED_IN", mockSession);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First, simulate a sign-in
    const signInButton = screen.getByRole("button", { name: /Sign In/i });
    await act(async () => {
      userEvent.click(signInButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com"
      );
    });

    // Then, simulate a sign-out
    const signOutButton = screen.getByRole("button", { name: /Sign Out/i });
    await act(async () => {
      userEvent.click(signOutButton);
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("");
    });
  });
});