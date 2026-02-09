import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { SuggestionForm } from "../components/SuggestionForm";
import type { SuggestionFormState } from "../components/SuggestionForm";
import { LeftChevronIcon } from "../components/LeftChevronIcon";

interface Trip {
  id: string;
  name: string;
}

export function AddSuggestionPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tripId) return;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [tripRes, profileRes] = await Promise.all([
        supabase.from("trips").select("id, name").eq("id", tripId).single(),
        supabase.from("profiles").select("display_name").eq("id", user.id).single(),
      ]);

      setTrip(tripRes.data as Trip | null);
      setProfileDisplayName((profileRes.data as { display_name: string } | null)?.display_name ?? null);
      setLoading(false);
    };

    void load();
  }, [tripId]);

  const handleSubmit = async (data: SuggestionFormState) => {
    if (!tripId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSubmitting(true);
    const { error } = await supabase.from("suggestions").insert({
      trip_id: tripId,
      created_by: user.id,
      title: data.title.trim(),
      description: data.description.trim() || "",
      main_image_url: data.main_image_url.trim() || null,
      lat: data.lat,
      lng: data.lng,
      author_label: profileDisplayName ?? null,
    });

    setSubmitting(false);
    if (error) {
      console.error(error);
      return;
    }
    navigate(`/trips/${tripId}/list`, { replace: true });
  };

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
          <Link
            to={`/trips/${tripId}/list`}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold">Add suggestion</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <SuggestionForm
          defaultMapCenter={{ lat: 45, lng: 15 }}
          onSubmit={handleSubmit}
          submitLabel="Add suggestion"
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
