import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { TripsPage } from "./pages/TripsPage";
import { TripHubPage } from "./pages/TripHubPage";
import { TripMapView } from "./pages/TripMapView";
import { TripListView } from "./pages/TripListView";
import { SuggestionDetailPage } from "./pages/SuggestionDetailPage";
import { AddSuggestionPage } from "./pages/AddSuggestionPage";
import { EditSuggestionPage } from "./pages/EditSuggestionPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TripsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:id"
        element={
          <ProtectedRoute>
            <TripHubPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:id/map"
        element={
          <ProtectedRoute>
            <TripMapView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:id/list"
        element={
          <ProtectedRoute>
            <TripListView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:id/suggestions/new"
        element={
          <ProtectedRoute>
            <AddSuggestionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:id/suggestions/:suggestionId/edit"
        element={
          <ProtectedRoute>
            <EditSuggestionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:id/suggestions/:suggestionId"
        element={
          <ProtectedRoute>
            <SuggestionDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
