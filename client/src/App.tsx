import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MeetingPage from './pages/MeetingPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage';
import GuestJoinPage from './pages/GuestJoinPage';
import GuestMeetingPage from './pages/GuestMeetingPage';
import BookingPage from './pages/BookingPage';
import AvailabilityPage from './pages/AvailabilityPage';
import RequestMeetingPage from './pages/RequestMeetingPage';
import './styles/global.css';

// Component to redirect legacy guest URLs
function LegacyGuestRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/guest/join/${id}`} replace />;
}

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Guest access routes */}
      <Route path="/guest/join/:id" element={<GuestJoinPage />} />
      <Route path="/guest/meeting/:id" element={<GuestMeetingPage />} />
      <Route path="/book/:id" element={<BookingPage />} />
      <Route path="/request/:userId" element={<RequestMeetingPage />} />
      {/* Legacy route for backward compatibility */}
      <Route path="/join/:id" element={<LegacyGuestRedirect />} />
      <Route path="/meeting/:id/guest" element={<GuestMeetingPage />} />
      
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <CalendarPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/availability"
        element={
          <PrivateRoute>
            <AvailabilityPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/meeting/:id"
        element={
          <PrivateRoute>
            <MeetingPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Load and apply dark mode preference on app start
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.darkMode) {
          document.documentElement.classList.add('dark-mode');
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
