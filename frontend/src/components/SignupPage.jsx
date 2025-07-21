import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import logo from './logo.jpeg'; 
import { FiEye, FiEyeOff } from 'react-icons/fi';

function SignupPage() {
  const [supervisorId, setSupervisorId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisorId, name, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Signup successful');
        navigate('/login');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error during signup');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo-title">
          <img src={logo} alt="logo" className="auth-logo" />
          <h1 className="auth-brand">BuildTrack</h1>
        </div>
        <p className="auth-subtitle">Construction Site Management Platform</p>

        <h2 className="auth-heading">Create Account</h2>

        <form onSubmit={handleSignup} className="auth-form">
          <label>Supervisor ID</label>
          <input
            type="text"
            placeholder="Enter ID (e.g., Super001)"
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
            required
          />

          <label>Name</label>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Password</label>
                    <div className="auth-password-field">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        className="auth-eye-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </span>
                    </div>

          <button type="submit" className="auth-button">Sign up</button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} style={{ color: '#16a34a', cursor: 'pointer' }}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
