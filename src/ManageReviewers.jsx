import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageReviewers = () => {
  const [reviewers, setReviewers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviewers');
      const data = await res.json();

      if (Array.isArray(data)) {
        setReviewers(data);
      } else {
        console.error('Unexpected data format:', data);
      }
    } catch (err) {
      console.error('Failed to fetch reviewers', err);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 min-h-screen">
        <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>
        <nav className="space-y-4">
        <a href="/admin-dashboard" className="block text-white hover:underline">Dashboard</a>
          <a href="/register-reviewer" className="block text-white hover:underline">Register Reviewer</a>
          <a href="/manage-reviewers" className="block text-white underline">Manage Reviewers</a>
          <a href="/manage-papers" className="block text-white hover:underline">Manage Papers</a>

          <button
            className="block text-white hover:underline"
            onClick={() => { window.location.href = '/'; }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-10">
      <div className="flex justify-between items-center mb-4">
  <h2 className="text-2xl font-semibold">Manage Reviewers</h2>
  <input
    type="text"
    placeholder="Search by name, email or keywords..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="border border-gray-400 rounded px-3 py-1 w-72"
  />
</div>


        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2">Full Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Campus</th>
              <th className="py-2">Expertise Keywords</th>
              <th className="py-2">Leaves</th>
              <th className="py-2">Assignments</th>
            </tr>
          </thead>
          <tbody>
          {reviewers
  .filter(r => 
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.keywords.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .map((reviewer, idx) => (

              <tr key={idx} className="border-b hover:bg-gray-100">
                <td className="py-2">{reviewer.full_name}</td>
                <td className="py-2">{reviewer.email}</td>
                <td className="py-2">{reviewer.campus}</td>
                <td className="py-2">{reviewer.keywords}</td>
                <td className="py-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate(`/reviewer-details/${encodeURIComponent(reviewer.email)}`)}
                  >
                    View Leaves
                  </button>
                </td>
                <td className="py-2">
                  <button
                    className="text-green-600 hover:underline"
                    onClick={() => navigate(`/reviewer-assignments/${encodeURIComponent(reviewer.email)}/${encodeURIComponent(reviewer.full_name)}`)}

                  >
                    View Assignments
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default ManageReviewers;
