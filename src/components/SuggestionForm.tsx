import { useState } from "react";
import { LocationPickerMap } from "./LocationPickerMap";

export interface SuggestionFormState {
  title: string;
  description: string;
  main_image_url: string;
  lat: number | null;
  lng: number | null;
}

const defaultState: SuggestionFormState = {
  title: "",
  description: "",
  main_image_url: "",
  lat: null,
  lng: null,
};

interface SuggestionFormProps {
  initialState?: Partial<SuggestionFormState>;
  defaultMapCenter?: { lat: number; lng: number };
  onSubmit: (data: SuggestionFormState) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function SuggestionForm({
  initialState = {},
  defaultMapCenter,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
}: SuggestionFormProps) {
  const [state, setState] = useState<SuggestionFormState>({
    ...defaultState,
    ...initialState,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(state);
  };

  const position =
    state.lat != null && state.lng != null
      ? { lat: state.lat, lng: state.lng }
      : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="form-control">
        <label className="label" htmlFor="suggestion-title">
          <span className="label-text">Title</span>
        </label>
        <input
          id="suggestion-title"
          type="text"
          className="input input-bordered w-full"
          value={state.title}
          onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
          required
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="suggestion-description">
          <span className="label-text">Description</span>
        </label>
        <textarea
          id="suggestion-description"
          className="textarea textarea-bordered w-full min-h-24"
          value={state.description}
          onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="suggestion-image">
          <span className="label-text">Image URL</span>
        </label>
        <input
          id="suggestion-image"
          type="url"
          className="input input-bordered w-full"
          placeholder="https://..."
          value={state.main_image_url}
          onChange={(e) => setState((s) => ({ ...s, main_image_url: e.target.value }))}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Location on map</span>
        </label>
        <p className="text-sm text-base-content/60 mb-2">
          Click the map to place a pin, or drag the pin to adjust.
        </p>
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-base-300 min-h-[200px]">
          <LocationPickerMap
            position={position}
            onPositionChange={(lat, lng) =>
              setState((s) => ({ ...s, lat, lng }))
            }
            defaultCenter={defaultMapCenter}
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !state.title.trim()}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
