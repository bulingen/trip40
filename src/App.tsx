import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { TripsPage } from "./pages/TripsPage";
import { TripView } from "./pages/TripView";

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
            <TripView />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
