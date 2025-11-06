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
            <span className="logo-icon">�</span>
            <span className="logo-text">VaxCall</span>
          </div>
          <div className="nav-links">
            <Link to="/features" className="nav-link">Features</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/contact-center" className="nav-link">Contact Center</Link>
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
              <div className="feature-icon">🔔</div>
              <h3 className="feature-title">Real-time Notifications</h3>
              <p className="feature-description">
                Instant notifications for meeting invitations, participant join/leave events, and chat messages.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3 className="feature-title">Contact Center</h3>
              <p className="feature-description">
                Professional contact center with intelligent call routing, queue management, and agent distribution.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Visual Call Flow Builder</h3>
              <p className="feature-description">
                Drag-and-drop interface to design custom call flows with IVR menus, queues, and routing strategies.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍💼</div>
              <h3 className="feature-title">Multi-Role Support</h3>
              <p className="feature-description">
                Agent, Supervisor, and Admin roles with dedicated interfaces for call handling and monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Center Section */}
      <section className="contact-center-section" style={{
        padding: '80px 0',
        backgroundColor: '#f8f9fa',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title" style={{ fontSize: '36px', marginBottom: '16px' }}>
              Enterprise Contact Center Solution
            </h2>
            <p style={{ fontSize: '18px', color: '#6c757d', maxWidth: '800px', margin: '0 auto' }}>
              Transform customer communications with our integrated contact center platform featuring intelligent routing, real-time analytics, and seamless agent management.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '60px' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Smart Queue Management</h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Create and manage call queues with customizable settings. Control max queue size, wait times, and assign agents dynamically.
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Intelligent Routing</h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Four routing strategies: Round-robin, Longest-idle, Skill-based, and Priority. Choose the best fit for your team.
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Real-time Analytics</h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Monitor queue performance, agent statistics, average wait times, and call volumes in real-time dashboards.
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Visual Flow Designer</h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Build complex call flows visually with drag-and-drop nodes for IVR, transfers, voicemail, time conditions, and more.
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <div style={{ textAlign: 'center' }}>
              <Link to="/contact-center" className="btn btn-primary btn-large">
                Open Contact Center
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Meetings?</h2>
            <p className="cta-subtitle">
              Join thousands of teams already using VaxCall for their daily collaboration.
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
              <span className="logo-text">VaxCall</span>
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
            <p>&copy; 2025 VaxCall. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;