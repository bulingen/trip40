import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";

export function LoginPage() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    if (isSignUp) {
      const { data } = await supabase
        .from("allowed_emails")
        .select("email")
        .eq("email", email.toLowerCase())
        .single();

      if (!data) {
        setError("This email is not on the invite list.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link.");
      }
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-lg">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-2">Trip 40</h1>
          <p className="text-center text-sm text-base-content/60 mb-4">
            {isSignUp ? "Create an account" : "Sign in to continue"}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <div className="text-error text-sm">{error}</div>
            )}
            {message && (
              <div className="text-success text-sm">{message}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting}
            >
              {submitting && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {isSignUp ? "Sign up" : "Sign in"}
            </button>
          </form>

          <div className="text-center text-sm mt-2">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="link link-primary"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
