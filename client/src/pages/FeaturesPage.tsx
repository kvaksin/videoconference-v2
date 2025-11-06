import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function FeaturesPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#667eea', fontWeight: 'bold', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📹</span>
            <span>VaxCall</span>
          </Link>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#6b7280' }}>Home</Link>
            <Link to="/features" style={{ textDecoration: 'none', color: '#667eea', fontWeight: '600' }}>Features</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: '#6b7280' }}>Dashboard</Link>
                <Link to="/contact-center" style={{ textDecoration: 'none', color: '#6b7280' }}>Contact Center</Link>
              </>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none', color: '#6b7280' }}>Sign In</Link>
                <Link to="/register" style={{
                  textDecoration: 'none',
                  padding: '8px 16px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '6px',
                }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px' }}>
            Everything You Need for Modern Communication
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, lineHeight: '1.6' }}>
            VaxCall combines powerful video conferencing with enterprise contact center capabilities, all in one unified platform.
          </p>
        </div>
      </section>

      {/* Video Conferencing Features */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
            Video Conferencing
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>
            Enterprise-grade video meetings with HD quality and real-time collaboration
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <FeatureCard
            icon="🎥"
            title="HD Video & Audio"
            description="Crystal-clear video and audio with WebRTC technology. Adaptive streaming adjusts to network conditions for optimal quality."
            features={['1080p HD video', 'Echo cancellation', 'Noise suppression', 'Bandwidth optimization']}
          />
          <FeatureCard
            icon="💬"
            title="Real-time Chat"
            description="Built-in messaging during meetings with instant delivery. Share links, files, and collaborate seamlessly."
            features={['Instant messaging', 'Chat history', 'File sharing', 'Emoji reactions']}
          />
          <FeatureCard
            icon="🖥️"
            title="Screen Sharing"
            description="Share your entire screen or specific windows. Perfect for presentations, demos, and collaborative work."
            features={['Full screen sharing', 'Window selection', 'Annotation tools', 'Remote control']}
          />
          <FeatureCard
            icon="📅"
            title="Meeting Scheduling"
            description="Schedule meetings in advance with calendar integration. Send invitations and manage participants easily."
            features={['Calendar sync', 'Email invitations', 'Recurring meetings', 'Time zone support']}
          />
          <FeatureCard
            icon="🔐"
            title="Secure & Private"
            description="End-to-end encryption and secure authentication. Your conversations stay private and protected."
            features={['JWT authentication', 'Encrypted connections', 'Role-based access', 'Guest access control']}
          />
          <FeatureCard
            icon="📱"
            title="Cross-Platform"
            description="Works seamlessly across all devices. Desktop, tablet, or mobile - join from anywhere."
            features={['Web-based', 'No downloads', 'Responsive design', 'Mobile optimized']}
          />
        </div>
      </section>

      {/* Contact Center Features */}
      <section style={{ padding: '80px 24px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              Enterprise Contact Center
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              Professional call center solution with intelligent routing and agent management
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <FeatureCard
              icon="📞"
              title="Call Queue Management"
              description="Create and manage multiple call queues with customizable settings for different departments or services."
              features={['Unlimited queues', 'Max queue size control', 'Wait time limits', 'Queue priority']}
            />
            <FeatureCard
              icon="🔄"
              title="Intelligent Routing"
              description="Four routing strategies to optimize call distribution and minimize wait times for customers."
              features={['Round-robin routing', 'Longest-idle first', 'Skill-based matching', 'Priority routing']}
            />
            <FeatureCard
              icon="👨‍💼"
              title="Agent Management"
              description="Comprehensive agent dashboard with status tracking, performance metrics, and workload balancing."
              features={['Agent status tracking', 'Performance metrics', 'Skill assignment', 'Multi-queue support']}
            />
            <FeatureCard
              icon="📊"
              title="Real-time Analytics"
              description="Monitor queue performance and agent productivity with live dashboards and detailed reports."
              features={['Queue statistics', 'Agent metrics', 'Wait time tracking', 'Call volume reports']}
            />
            <FeatureCard
              icon="🎯"
              title="Visual Flow Builder"
              description="Design custom call flows with an intuitive drag-and-drop interface. No coding required."
              features={['IVR menus', 'Queue routing', 'Time conditions', 'Agent transfers']}
            />
            <FeatureCard
              icon="👁️"
              title="Supervisor Tools"
              description="Real-time monitoring and management tools for supervisors to oversee operations and assist agents."
              features={['Live monitoring', 'Call listening', 'Agent assistance', 'Performance tracking']}
            />
          </div>
        </div>
      </section>

      {/* Admin Features */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
            Administration & Management
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>
            Complete control and visibility for administrators
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <FeatureCard
            icon="👥"
            title="User Management"
            description="Complete user lifecycle management with role-based permissions and access control."
            features={['User creation', 'Role assignment', 'Permission control', 'Bulk operations']}
          />
          <FeatureCard
            icon="📈"
            title="Analytics Dashboard"
            description="Comprehensive analytics and reporting for meetings, users, and system performance."
            features={['Usage statistics', 'Meeting reports', 'User activity', 'System health']}
          />
          <FeatureCard
            icon="🔒"
            title="Security Controls"
            description="Enterprise-grade security features to protect your organization's communications."
            features={['Access controls', 'Audit logs', 'IP restrictions', 'Session management']}
          />
          <FeatureCard
            icon="⚙️"
            title="System Configuration"
            description="Flexible configuration options to customize the platform for your organization's needs."
            features={['Branding options', 'Feature toggles', 'Integration settings', 'Email templates']}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>
            Join thousands of teams using VaxCall for video conferencing and contact center operations.
          </p>
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link to="/dashboard" style={{
                padding: '14px 32px',
                backgroundColor: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
              }}>
                Go to Dashboard
              </Link>
              <Link to="/contact-center" style={{
                padding: '14px 32px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                border: '2px solid white',
              }}>
                Contact Center
              </Link>
            </div>
          ) : (
            <Link to="/register" style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
            }}>
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '32px' }}>📹</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>VaxCall</span>
          </div>
          <p style={{ color: '#9ca3af' }}>&copy; 2025 VaxCall. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

function FeatureCard({ icon, title, description, features }: FeatureCardProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '32px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>
        {title}
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '16px', lineHeight: '1.6' }}>
        {description}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {features.map((feature, index) => (
          <li key={index} style={{
            color: '#059669',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>✓</span>
            <span style={{ color: '#4b5563' }}>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
