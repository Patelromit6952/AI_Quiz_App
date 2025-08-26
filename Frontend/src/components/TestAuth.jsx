import React from 'react';
import useAuth from '../hooks/useAuth';

const TestAuth = () => {
  const { user, loading } = useAuth();

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h4>Auth Debug Info</h4>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      <p><strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
      {user && (
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
      )}
      <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
    </div>
  );
};

export default TestAuth;
