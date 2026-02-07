import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";

interface Trip {
  id: string;
  name: string;
  created_at: string;
}

export function TripsPage() {
  const { session } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTrips(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <span className="text-xl font-bold px-4">Trip 40</span>
        </div>
        <div className="flex-none gap-2 px-4">
          <span className="text-sm opacity-70">
            {session?.user.email}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">My trips</h2>
        {loading ? (
          <span className="loading loading-spinner loading-md" />
        ) : trips.length === 0 ? (
          <p className="text-base-content/60">No trips yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="card-body p-4">
                  <h3 className="card-title text-lg">{trip.name}</h3>
                  <p className="text-sm opacity-50">
                    Created {new Date(trip.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
