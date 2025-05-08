import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ADD THIS at the top


const RegisterReviewer = () => {
  const navigate = useNavigate();  // ADD THIS inside your component
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    keywords: '',
    campus: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
  
    const usernamePattern = /^[A-Z][A-Za-z0-9]{4,}$/;  // Starts with capital, no special chars, min 5
  
    if (!formData.full_name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.keywords || !formData.campus) {
      setError('All fields are required');
      return;
    }
  
    if (!usernamePattern.test(formData.username)) {
      setError('Username must start with a capital letter, contain only letters/numbers, and be at least 5 characters long.');
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:5000/api/register-reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          keywords: formData.keywords,
          campus: formData.campus,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Reviewer registered successfully!');
        setFormData({
          full_name: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          keywords: '',
          campus: '',
        });
      } else {
        setError(data.error || 'Server error, try again');
      }
    } catch (err) {
      setError('Server error, try again');
    }
  };
  

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-300 to-purple-300">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        {/* Back Button */}
<button
  className="flex items-center text-blue-800 font-bold mb-4"
  onClick={() => navigate(-1)}  // Go back to previous page
>
  <span className="mr-2 text-xl">&larr;</span> Back
</button>
        <h2 className="text-2xl font-bold text-center mb-4">Register Reviewer</h2>

        {error && <p className="text-red-600 text-center">{error}</p>}
        {success && <p className="text-green-600 text-center">{success}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        {/* Password field with eye */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <span
            className="absolute right-3 top-3 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        {/* Confirm Password with eye */}
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <span
            className="absolute right-3 top-3 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <input
          type="text"
          placeholder="Expertise Keywords (comma separated)"
          value={formData.keywords}
          onChange={(e) => handleChange('keywords', e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        <select
          value={formData.campus}
          onChange={(e) => handleChange('campus', e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">Select Campus</option>
          <option value="Amaravati">Amaravati</option>
          <option value="Amritapuri">Amritapuri</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Coimbatore">Coimbatore</option>
        </select>

        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default RegisterReviewer;
