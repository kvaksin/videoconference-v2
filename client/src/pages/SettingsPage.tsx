import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import type { User } from '../types';

export default function SettingsPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    darkMode: false,
    notifications: true,
    autoJoinAudio: true,
    autoJoinVideo: false,
    defaultVideoQuality: 'hd',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      setUserData(currentUser);
      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.updateProfile(profileForm);
      alert('Profile updated successfully!');
      loadUserData();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }
    
    try {
      await apiService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      alert('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please check your current password and try again.');
    }
  };

  const handlePreferencesUpdate = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    // In a real app, you'd save these to the backend
    localStorage.setItem('userPreferences', JSON.stringify({
      ...preferences,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link 
            to="/dashboard" 
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{ color: 'white', margin: 0 }}>Settings</h1>
        </div>
        <button
          onClick={logout}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      {/* Settings Container */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '16px 24px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                color: activeTab === tab.id ? '#667eea' : '#64748b',
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ marginRight: '8px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '32px' }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>Profile Information</h2>
              <form onSubmit={handleProfileUpdate}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease',
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#f9fafb',
                    }}
                    disabled
                  />
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    Email cannot be changed for security reasons
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Account Type
                  </label>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: userData?.role === 'admin' ? '#3b82f6' : '#6b7280',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {userData?.role.toUpperCase()}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: userData?.license === 'full' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {userData?.license.toUpperCase()} LICENSE
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Update Profile
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>Security Settings</h2>
              
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>🔒 Password Security Tips</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e' }}>
                  <li>Use at least 8 characters with a mix of letters, numbers, and symbols</li>
                  <li>Avoid using personal information or common words</li>
                  <li>Use a unique password for this account</li>
                </ul>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                    required
                    minLength={6}
                  />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Change Password
                </button>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div>
              <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>Application Preferences</h2>
              
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Appearance Settings */}
                <div>
                  <h3 style={{ marginBottom: '16px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                    Appearance
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <strong>Dark Mode</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                        Enable dark theme for better low-light viewing
                      </p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                      <input
                        type="checkbox"
                        checked={preferences.darkMode}
                        onChange={(e) => handlePreferencesUpdate('darkMode', e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: preferences.darkMode ? '#667eea' : '#ccc',
                        borderRadius: '34px',
                        transition: '0.4s',
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '26px',
                          width: '26px',
                          left: preferences.darkMode ? '30px' : '4px',
                          bottom: '4px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: '0.4s',
                        }} />
                      </span>
                    </label>
                  </div>
                </div>

                {/* Meeting Settings */}
                <div>
                  <h3 style={{ marginBottom: '16px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                    Meeting Defaults
                  </h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <strong>Auto-join Audio</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                        Automatically enable microphone when joining meetings
                      </p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                      <input
                        type="checkbox"
                        checked={preferences.autoJoinAudio}
                        onChange={(e) => handlePreferencesUpdate('autoJoinAudio', e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: preferences.autoJoinAudio ? '#667eea' : '#ccc',
                        borderRadius: '34px',
                        transition: '0.4s',
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '26px',
                          width: '26px',
                          left: preferences.autoJoinAudio ? '30px' : '4px',
                          bottom: '4px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: '0.4s',
                        }} />
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <strong>Auto-join Video</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                        Automatically enable camera when joining meetings
                      </p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                      <input
                        type="checkbox"
                        checked={preferences.autoJoinVideo}
                        onChange={(e) => handlePreferencesUpdate('autoJoinVideo', e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: preferences.autoJoinVideo ? '#667eea' : '#ccc',
                        borderRadius: '34px',
                        transition: '0.4s',
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '26px',
                          width: '26px',
                          left: preferences.autoJoinVideo ? '30px' : '4px',
                          bottom: '4px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: '0.4s',
                        }} />
                      </span>
                    </label>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Default Video Quality
                    </label>
                    <select
                      value={preferences.defaultVideoQuality}
                      onChange={(e) => handlePreferencesUpdate('defaultVideoQuality', e.target.value)}
                      style={{
                        width: '200px',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    >
                      <option value="sd">SD (480p)</option>
                      <option value="hd">HD (720p)</option>
                      <option value="fhd">Full HD (1080p)</option>
                    </select>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <h3 style={{ marginBottom: '16px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                    Notifications
                  </h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Browser Notifications</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                        Receive notifications for meeting invites and updates
                      </p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) => handlePreferencesUpdate('notifications', e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: preferences.notifications ? '#667eea' : '#ccc',
                        borderRadius: '34px',
                        transition: '0.4s',
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '26px',
                          width: '26px',
                          left: preferences.notifications ? '30px' : '4px',
                          bottom: '4px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: '0.4s',
                        }} />
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}