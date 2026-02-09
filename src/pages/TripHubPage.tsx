import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LeftChevronIcon } from "../components/LeftChevronIcon";

interface Trip {
  id: string;
  name: string;
}

export function TripHubPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("trips")
      .select("id, name")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setTrip(data ?? null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">Trip not found.</p>
        <Link to="/" className="btn btn-primary btn-sm">
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Link to="/" className="btn btn-ghost btn-sm flex items-center gap-2">
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold">{trip.name}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 flex flex-col gap-3">
        <Link
          to={`/trips/${id}/map`}
          className="btn btn-outline btn-primary btn-lg w-full justify-start gap-2"
        >
          Map view
        </Link>
        <Link
          to={`/trips/${id}/list`}
          className="btn btn-outline btn-primary btn-lg w-full justify-start gap-2"
        >
          List view
        </Link>
        <div className="divider">Available soon</div>
        <button type="button" className="btn btn-lg w-full justify-start gap-2" disabled>
          Play: Swipe
        </button>
        <button type="button" className="btn btn-lg w-full justify-start gap-2" disabled>
          Play: Head 2 head
        </button>
        <button type="button" className="btn btn-lg w-full justify-start gap-2" disabled>
          Play: Rate
        </button>
      </div>
    </div>
  );
}
