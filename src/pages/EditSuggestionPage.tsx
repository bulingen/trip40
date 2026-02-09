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

interface SuggestionRow {
  id: string;
  trip_id: string;
  title: string;
  description: string;
  main_image_url: string | null;
  lat: number | null;
  lng: number | null;
}

export function EditSuggestionPage() {
  const { id: tripId, suggestionId } = useParams<{ id: string; suggestionId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tripId || !suggestionId) return;

    Promise.all([
      supabase.from("trips").select("id, name").eq("id", tripId).single(),
      supabase
        .from("suggestions")
        .select("id, trip_id, title, description, main_image_url, lat, lng")
        .eq("id", suggestionId)
        .eq("trip_id", tripId)
        .single(),
    ]).then(([tripRes, suggestionRes]) => {
      setTrip(tripRes.data as Trip | null);
      setSuggestion(suggestionRes.data as SuggestionRow | null);
      setLoading(false);
    });
  }, [tripId, suggestionId]);

  const handleSubmit = async (data: SuggestionFormState) => {
    if (!suggestionId) return;

    setSubmitting(true);
    const { error } = await supabase
      .from("suggestions")
      .update({
        title: data.title.trim(),
        description: data.description.trim() || "",
        main_image_url: data.main_image_url.trim() || null,
        lat: data.lat,
        lng: data.lng,
      })
      .eq("id", suggestionId);

    setSubmitting(false);
    if (error) {
      console.error(error);
      return;
    }
    navigate(`/trips/${tripId}/suggestions/${suggestionId}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!trip || !suggestion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">Suggestion not found.</p>
        <Link to={tripId ? `/trips/${tripId}/list` : "/"} className="btn btn-primary btn-sm">
          Back to list
        </Link>
      </div>
    );
  }

  const initialState: Partial<SuggestionFormState> = {
    title: suggestion.title,
    description: suggestion.description ?? "",
    main_image_url: suggestion.main_image_url ?? "",
    lat: suggestion.lat,
    lng: suggestion.lng,
  };

  const defaultMapCenter =
    suggestion.lat != null && suggestion.lng != null
      ? { lat: suggestion.lat, lng: suggestion.lng }
      : { lat: 45, lng: 15 };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Link
            to={`/trips/${tripId}/suggestions/${suggestionId}`}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold">Edit suggestion</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <SuggestionForm
          initialState={initialState}
          defaultMapCenter={defaultMapCenter}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
