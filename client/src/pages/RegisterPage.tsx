import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-section">
        <div className="container-small">
          <div className="card text-center">
            <h1 className="card-title">Create Account</h1>
            <p className="card-description mb-3">Join our video conferencing platform</p>
            
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="card" style={{ backgroundColor: '#fee', border: '1px solid #fcc', marginBottom: '1rem' }}>
                  <p style={{ color: '#d00', margin: 0 }}>{error}</p>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              
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
                className={`btn ${loading ? 'btn-secondary' : 'btn-success'} btn-large`}
                style={{ width: '100%' }}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
            
            <p className="card-description mt-3">
              Already have an account? <Link to="/login" className="nav-link" style={{ color: '#667eea' }}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
