import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";

export function HomePage() {
  const { session } = useAuth();

  return (
    <div>
      <h1>Trip 40</h1>
      <p>Welcome, {session?.user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  );
}
