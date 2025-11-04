import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-section">
        <div className="container-small">
          <div className="card text-center">
            <h1 className="card-title">Welcome Back</h1>
            
            {/* Demo credentials info */}
            <div className="card-glass mb-3" style={{ background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.1), rgba(40, 167, 69, 0.1))' }}>
              <h4 className="card-title-white" style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Demo Credentials</h4>
              <p className="card-description-white" style={{ margin: '0', fontSize: '14px' }}>
                <strong>Admin:</strong> admin@example.com / admin123<br/>
                <strong>User:</strong> kv@ex.com (register or use existing)
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="card" style={{ backgroundColor: '#fee', border: '1px solid #fcc', marginBottom: '1rem' }}>
                  <p style={{ color: '#d00', margin: 0 }}>{error}</p>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`btn ${loading ? 'btn-secondary' : 'btn-primary'} btn-large`}
                style={{ width: '100%' }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
            <p className="card-description mt-3">
              Don't have an account? <Link to="/register" className="nav-link" style={{ color: '#667eea' }}>Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
