import { Outlet, Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Questionnaire from "./pages/Questionnaire";
import Results from "./pages/Results";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import DestinationDetails from "./pages/DestinationDetails";

function ProtectedLayout() {
  return (
    <div className="min-h-[100svh] bg-[#07070b] text-white">
      <Navbar />
      <Outlet />
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedLayout />}>
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/questionnaire"
          element={
            <RequireAuth>
              <Questionnaire />
            </RequireAuth>
          }
        />
        <Route
          path="/results"
          element={
            <RequireAuth>
              <Results />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/destination/:id"
          element={
            <RequireAuth>
              <DestinationDetails />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
