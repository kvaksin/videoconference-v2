import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleStartInstantMeeting = async () => {
    try {
      // Create an instant meeting
      const now = new Date();
      const meeting = await apiService.createMeeting({
        title: `Instant Meeting - ${now.toLocaleTimeString()}`,
        description: 'Quick meeting started instantly',
        scheduledAt: now.toISOString(),
        duration: 60, // Default 1 hour
      });

      // Navigate to the meeting page
      navigate(`/meeting/${meeting.id}`);
    } catch (error) {
      console.error('Failed to start instant meeting:', error);
      alert('Failed to start meeting. Please try again.');
    }
  };

  return (
    <div className="home-page">
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">📹</span>
            <span className="logo-text">VideoConnect</span>
          </div>
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link">Admin Panel</Link>
                )}
                <span className="user-greeting">
                  Welcome, {user?.name}! 
                  {user?.role === 'admin' && ' (Administrator)'}
                </span>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Sign In</Link>
                <Link to="/register" className="nav-link-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Connect, Collaborate, Create
              <span className="title-highlight"> Together</span>
            </h1>
            <p className="hero-subtitle">
              {isAuthenticated ? (
                user?.role === 'admin' ? 
                  'Welcome back, Administrator! Manage users, monitor meetings, and oversee your video conferencing platform with comprehensive admin tools.' :
                  'Welcome back! Start an instant meeting, schedule future conferences, or join existing meetings. Your dashboard awaits with all your meeting tools.'
              ) : (
                'Experience crystal-clear video conferencing with advanced features. Host unlimited meetings, share screens, and collaborate seamlessly with teams worldwide.'
              )}
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <button onClick={handleStartInstantMeeting} className="btn btn-primary">
                    Start Instant Meeting
                  </button>
                  <Link to="/dashboard" className="btn btn-secondary">
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">2+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat">
                <span className="stat-number">Real-time</span>
                <span className="stat-label">Video Quality</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="video-grid">
              <div className="video-card">
                <div className="video-avatar">👨‍💼</div>
                <div className="video-name">John Doe</div>
              </div>
              <div className="video-card">
                <div className="video-avatar">👩‍💻</div>
                <div className="video-name">Sarah Smith</div>
              </div>
              <div className="video-card">
                <div className="video-avatar">👨‍🎨</div>
                <div className="video-name">Mike Johnson</div>
              </div>
              <div className="video-card">
                <div className="video-avatar">👩‍🔬</div>
                <div className="video-name">Lisa Chen</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Complete Video Conferencing Solution</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎥</div>
              <h3 className="feature-title">Real-time Video & Audio</h3>
              <p className="feature-description">
                High-quality WebRTC-powered video conferencing with crystal-clear audio and adaptive streaming.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Live Chat</h3>
              <p className="feature-description">
                Real-time messaging during meetings with instant delivery and chat history.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">�</div>
              <h3 className="feature-title">Meeting Scheduling</h3>
              <p className="feature-description">
                Schedule meetings in advance, manage participants, and send calendar invitations.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">User Management</h3>
              <p className="feature-description">
                Complete user authentication system with role-based access control and admin capabilities.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure Authentication</h3>
              <p className="feature-description">
                JWT-based secure authentication with encrypted connections and data protection.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Responsive Design</h3>
              <p className="feature-description">
                Modern, responsive interface that works seamlessly across desktop, tablet, and mobile devices.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">�</div>
              <h3 className="feature-title">Dark Mode Support</h3>
              <p className="feature-description">
                Eye-friendly dark mode interface for comfortable video conferencing in any lighting.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">�</div>
              <h3 className="feature-title">Admin Dashboard</h3>
              <p className="feature-description">
                Comprehensive admin panel with user management, meeting analytics, and system statistics.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">�</div>
              <h3 className="feature-title">Real-time Notifications</h3>
              <p className="feature-description">
                Instant notifications for meeting invitations, participant join/leave events, and chat messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Meetings?</h2>
            <p className="cta-subtitle">
              Join thousands of teams already using VideoConnect for their daily collaboration.
            </p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-icon">📹</span>
              <span className="logo-text">VideoConnect</span>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#security">Security</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Developers</h4>
                <a href="http://localhost:3001/api-docs" target="_blank" rel="noopener noreferrer">API Documentation</a>
                <a href="#help">Help Center</a>
                <a href="#status">System Status</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 VideoConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;