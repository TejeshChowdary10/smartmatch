import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo, Democratic Republic of the', 'Congo, Republic of the', 'Costa Rica', 'Côte d’Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'East Timor (Timor-Leste)', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia, Federated States of', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar (Burma)',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Sudan, South', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
];

const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

const Welcome = () => {
  const [generatedCaptcha, setGeneratedCaptcha] = useState(generateCaptcha());
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  
  const [signupInfo, setSignupInfo] = useState({
    email: '', username: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', dateOfBirth: '', campus: '', country: '',
    captcha: '', captchaInput: '', verificationCodeInput: '',
    emailVerified: false, emailCodeSent: false
  });
  

  React.useEffect(() => {
    const canvas = document.getElementById('captchaCanvas');
    if (canvas && generatedCaptcha && showSignup) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '24px Times New Roman';
      ctx.fillStyle = '#333';
      ctx.fillText(generatedCaptcha, 10, 28);
    }
  }, [generatedCaptcha, showSignup]);

  const handleLogin = async () => {
    if (!username || !password) return alert('Please enter both username and password.');
  
    // ✅ Check for Admin login
    if (username === 'Admin' && password === 'Amma@123') {
      try {
        const res = await fetch('http://localhost:5000/api/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          navigate('/admin-dashboard');
        } else {
          alert('Unauthorized');
        }
      } catch (err) {
        alert('Admin login failed.');
        console.error(err);
      }
      return; // 👈 Prevent further login flow
    }
  
    // ✅ Normal author login
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.role === 'author') {
          navigate(`/dashboard?username=${data.username}&fullname=${data.full_name}`);
        } else if (data.role === 'reviewer') {
          navigate(`/reviewer-dashboard?username=${data.username}&fullName=${data.full_name}`);

        }
      }
      
      else alert('Login failed: ' + data.error);
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };
  

  const handleSignup = async () => {
    const { email, username, password, confirmPassword, firstName, lastName, organization, country, captchaInput, emailVerified } = signupInfo;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

    if (!email || !username || !password || !confirmPassword || !firstName || !lastName || !organization || !country)
      return alert('Please fill all fields.');
    if (!passwordRegex.test(password))
      return alert('Password must include uppercase, lowercase, numbers, and special characters.');
    if (password !== confirmPassword) return alert('Passwords do not match.');
    if (captchaInput !== generatedCaptcha) return alert('Captcha does not match.');

    if (!emailVerified) {
      try {
        const res = await fetch('http://localhost:5000/api/send-verification', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Verification code sent to your email. Please enter it below.');
          setSignupInfo(prev => ({ ...prev, emailCodeSent: true }));
        } else alert('Failed to send verification code: ' + data.error);
      } catch (error) {
        alert('Error sending verification email.');
      }
      return;
    }
    if (!/^[A-Z][a-zA-Z0-9]{4,}$/.test(username)) {
      return alert('Username must start with a capital letter and have at least 5 characters (letters and numbers only).');
    }
    if (!/^[A-Za-z]+$/.test(firstName)) {
      return alert('First Name must contain only letters.');
    }
    if (!/^[A-Za-z]+$/.test(lastName)) {
      return alert('Last Name must contain only letters.');
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, firstName, lastName, organization, country })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowSignup(false);
        setSignupInfo({ email: '', username: '', password: '', confirmPassword: '', firstName: '', lastName: '', organization: '', country: '', captcha: '', captchaInput: '', verificationCodeInput: '', emailVerified: false, emailCodeSent: false });
        setGeneratedCaptcha(generateCaptcha());
      } else alert('Signup failed: ' + data.error);
    } catch (error) {
      alert('Error connecting to backend.');
    }
  };

  const handleInputChange = (field, value) => setSignupInfo(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400">
      <div className="w-full max-w-6xl mx-auto p-6 flex rounded-3xl bg-white shadow-xl overflow-hidden">
        <div className="w-1/2 bg-slate-900 text-white p-10 flex flex-col justify-center items-center relative">
          <h1 className="text-4xl font-bold mb-2">SmartMatch</h1>
          <p className="text-gray-300 mb-4">Powered by AI Technology</p>
          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-10 text-2xl font-semibold">
            Welcome to SmartMatch
          </motion.div>
        </div>

        <div className="w-1/2 bg-white p-10">
          {showSignup ? (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Sign Up</h2>
              <input type="text" placeholder="Username" value={signupInfo.username} onChange={(e) => handleInputChange('username', e.target.value)} className="mb-2 p-2 w-full border rounded" />
              <input type="email" placeholder="Email" value={signupInfo.email} onChange={(e) => handleInputChange('email', e.target.value)} className="mb-2 p-2 w-full border rounded" />
              <div className="relative">
  <input 
    type={showSignupPassword ? 'text' : 'password'} 
    placeholder="Password" 
    value={signupInfo.password} 
    onChange={(e) => handleInputChange('password', e.target.value)} 
    className="mb-2 p-2 w-full border rounded" 
  />
  <button 
    type="button" 
    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm" 
    onClick={() => setShowSignupPassword(!showSignupPassword)}
  >
    {showSignupPassword ? '🙈' : '👁️'}
  </button>
</div>

<div className="relative">
  <input 
    type={showSignupConfirmPassword ? 'text' : 'password'} 
    placeholder="Confirm Password" 
    value={signupInfo.confirmPassword} 
    onChange={(e) => handleInputChange('confirmPassword', e.target.value)} 
    className="mb-2 p-2 w-full border rounded" 
  />
  <button 
    type="button" 
    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm" 
    onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
  >
    {showSignupConfirmPassword ? '🙈' : '👁️'}
  </button>
</div>

              <input type="text" placeholder="First Name" value={signupInfo.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className="mb-2 p-2 w-full border rounded" />
              <input type="text" placeholder="Last Name" value={signupInfo.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className="mb-2 p-2 w-full border rounded" />
              <input 
  type="date" 
  value={signupInfo.dateOfBirth} 
  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} 
  className="mb-2 p-2 w-full border rounded" 
  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
/>

              <select value={signupInfo.campus} onChange={(e) => handleInputChange('campus', e.target.value)} className="mb-2 p-2 w-full border rounded">
  <option value="">Select Campus</option>
  <option value="Amaravati">Amaravati</option>
  <option value="Amritapuri">Amritapuri</option>
  <option value="Bengaluru">Bengaluru</option>
  <option value="Coimbatore">Coimbatore</option>
</select>

              <select value={signupInfo.country} onChange={(e) => handleInputChange('country', e.target.value)} className="mb-2 p-2 w-full border rounded">
                <option value="">Select Country</option>
                {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
              <canvas id="captchaCanvas" width="120" height="40" className="mb-2 bg-gray-100 rounded"></canvas>
              <button
  onClick={() => setGeneratedCaptcha(generateCaptcha())}
  className="text-sm text-blue-600 underline hover:text-blue-800 mb-2"
>
  Regenerate Captcha
</button>

              <input type="text" placeholder="Enter Captcha" value={signupInfo.captchaInput} onChange={(e) => handleInputChange('captchaInput', e.target.value)} className="mb-2 p-2 w-full border rounded" />
              {signupInfo.emailCodeSent && !signupInfo.emailVerified && (
                <>
                  <input type="text" placeholder="Enter Verification Code" value={signupInfo.verificationCodeInput} onChange={(e) => handleInputChange('verificationCodeInput', e.target.value)} className="mb-2 p-2 w-full border rounded" />
                  <button onClick={async () => {
                    const res = await fetch('http://localhost:5000/api/verify-code', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: signupInfo.email, code: signupInfo.verificationCodeInput })
                    });
                    const result = await res.json();
                    if (res.ok && result.success) {
                      alert('Email verified! Click Sign Up again.');
                      setSignupInfo(prev => ({ ...prev, emailVerified: true }));
                    } else alert('Invalid code.');
                  }} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full">Verify Email</button>
                </>
              )}
              <button onClick={handleSignup} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full">Sign Up</button>
              <p className="mt-2 text-sm">Already have an account? <button className="text-blue-600 hover:underline" onClick={() => setShowSignup(false)}>Login</button></p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Login</h2>
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-2 p-2 w-full border rounded" />
              <div className="relative">
  <input 
    type={showLoginPassword ? 'text' : 'password'} 
    placeholder="Password" 
    value={password} 
    onChange={(e) => setPassword(e.target.value)} 
    className="mb-2 p-2 w-full border rounded" 
  />
  <button 
    type="button" 
    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm" 
    onClick={() => setShowLoginPassword(!showLoginPassword)}
  >
    {showLoginPassword ? '🙈' : '👁️'}
  </button>
</div>


              <button onClick={handleLogin} className="bg-slate-800 hover:bg-slate-900 text-white py-2 px-4 rounded w-full">Login</button>
              <div className="flex items-center justify-between mt-2 text-sm">
  <button
    className="text-blue-600 hover:underline"
    onClick={() => navigate('/forgot-password')}
  >
    Forgot Password?
  </button>
  <p className="text-right">
    Don't have an account? 
    <button 
      className="text-blue-600 hover:underline" 
      onClick={() => setShowSignup(true)}
    >
      Sign Up
    </button>
  </p>
</div>

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome;