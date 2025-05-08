import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import toast, { Toaster } from 'react-hot-toast';
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

const Profile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [editField, setEditField] = useState(null);
  const [updatedValue, setUpdatedValue] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/user/${username}`);
        if (!res.ok) throw new Error('User not found or server error');
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [username]);

  const handleEdit = (field) => {
    setEditField(field);
    setUpdatedValue(userData[field] || '');
  };

  const confirmSave = () => {
    if (editField === 'password') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
      if (!passwordRegex.test(updatedValue)) {
        toast.error('Password must be at least 8 characters long with upper, lower, number & special char');
        return;
      }
    }
    setShowModal(true);
  };

  const handleSaveConfirmed = async () => {
    const updatedUser = { ...userData, [editField]: updatedValue };
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      if (editField === 'username' && !/^[A-Z][a-zA-Z]{4,}$/.test(updatedValue)) {
        toast.error('Username must start with a capital letter and have at least 5 letters.');
        return;
      }
      if ((editField === 'first_name' || editField === 'last_name') && !/^[A-Za-z]+$/.test(updatedValue)) {
        toast.error('First and Last Name must contain only letters.');
        return;
      }
      
      if (!res.ok) throw new Error('Update failed');
      setUserData(updatedUser);
      setEditField(null);
      setShowModal(false);
      toast.success(`${editField.replace('_', ' ')} updated successfully!`);
    } catch (err) {
      setError(err.message);
      setShowModal(false);
    }
  };

  if (error) return <div className="p-10 text-red-600 font-semibold">Error: {error}</div>;
  if (!userData) return <div className="p-10 font-semibold text-blue-600">Loading Profile...</div>;

  return (
    <div className="min-h-screen p-10 flex justify-center items-center bg-[#007399]">
      <Toaster position="top-center" />
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="text-black mr-2 hover:text-gray-600"
            title="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-center w-full">Profile Settings</h2>
        </div>

        {['username', 'email', 'first_name', 'last_name', 'country', 'password', 'date_of_birth', 'campus'].map((field, index) => (
          <div key={index} className="flex justify-between items-center border-b py-3">
            <strong className="w-1/3 capitalize">{field.replace('_', ' ')}</strong>
            {editField === field ? (
  <div className="w-2/3 flex items-center gap-2">
    {field === 'campus' ? (
      <select
        className="w-full border rounded px-2 py-1"
        value={updatedValue}
        onChange={(e) => setUpdatedValue(e.target.value)}
      >
        <option value="">Select Campus</option>
        <option value="Amaravati">Amaravati</option>
        <option value="Amritapuri">Amritapuri</option>
        <option value="Bengaluru">Bengaluru</option>
        <option value="Coimbatore">Coimbatore</option>
      </select>
    ) : field === 'country' ? (
<select
  className="w-full border rounded px-2 py-1"
  value={updatedValue}
  onChange={(e) => setUpdatedValue(e.target.value)}
>
  <option value="">Select Country</option>
  {countries.map((country) => (
    <option key={country} value={country}>
      {country}
    </option>
  ))}
</select>

    ) : field === 'date_of_birth' ? (
      <input
        type="date"
        className="w-full border rounded px-2 py-1"
        value={updatedValue}
        onChange={(e) => setUpdatedValue(e.target.value)}
        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
      />
    ) : field === 'password' ? (
      <>
        <input
          type={showPassword ? 'text' : 'password'}
          className="w-full border rounded px-2 py-1"
          value={updatedValue}
          onChange={(e) => setUpdatedValue(e.target.value)}
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="text-blue-600 text-sm underline"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </>
    ) : (
      <input
        type="text"
        className="w-full border rounded px-2 py-1"
        value={updatedValue}
        onChange={(e) => setUpdatedValue(e.target.value)}
      />
    )}
  </div>
) : (
  <span className="w-2/3 text-right">
  {field === 'password' ? '*******' : 
   field === 'date_of_birth' ? 
    (userData[field] ? new Date(userData[field]).toISOString().split('T')[0] : '') 
    : userData[field]}
</span>

)}

            <div className="ml-4">
              {editField === field ? (
                <button onClick={confirmSave} className="px-4 py-1 border rounded-full hover:bg-green-100">Save</button>
              ) : field !== 'email' ? (
                <button onClick={() => handleEdit(field)} className="px-4 py-1 border rounded-full hover:bg-gray-100">{field === 'country' ? 'Change' : 'Edit'}</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Update</h3>
            <p className="mb-4">Are you sure you want to update your {editField.replace('_', ' ')}?</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleSaveConfirmed} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Yes</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
