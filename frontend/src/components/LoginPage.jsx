import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import logo from '../components/logo.jpeg'; 
import { FiEye, FiEyeOff } from 'react-icons/fi';

function Login() {
  const [supervisorId, setSupervisorId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisorId, password }),
      });

      const data = await response.json();

      if (response.ok) {
       
        localStorage.setItem('token', data.token);
        localStorage.setItem('supervisorId', data.supervisorId);

       
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo-title">
          <img src={logo} alt="logo" className="auth-logo" />
          <h2 className="auth-brand">BuildTrack</h2>
        </div>
        <p className="auth-subtitle">Construction Site Management Platform</p>

        <h3 className="auth-heading">BuildTrack Login</h3>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Supervisor ID</label>
          <input
            type="text"
            placeholder="Enter ID e.g. Super001"
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
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

          <button className="auth-button" type="submit">
            Sign in
          </button>
        </form>

        <div className="auth-footer">
          Don’t have an account?{' '}
          <span onClick={() => navigate('/signup')}>Sign up</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
