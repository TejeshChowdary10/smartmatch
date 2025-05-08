import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ReviewerAssignments = () => {
    const { email, full_name } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, [email]);

  const fetchAssignments = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/reviewer-assignments-by-email/${encodeURIComponent(email)}/${encodeURIComponent(full_name)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Sort by assigned_at descending (latest first)
        const sorted = data.sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at));
        setAssignments(sorted);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError('Failed to load assignments');
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
          <a href="/manage-reviewers" className="block text-white hover:underline">Manage Reviewers</a>
          <a href="/manage-papers" className="block text-white hover:underline">Manage Papers</a>


          <button
            className="block text-white hover:underline"
            onClick={() => { window.location.href = '/'; }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-10">
        <h2 className="text-2xl font-semibold mb-6">Assignments for {email}</h2>
        {error && <p className="text-red-600">{error}</p>}

        <table className="w-full text-sm text-left">
        <thead>
  <tr className="border-b text-gray-600">
    <th className="py-2">Paper ID</th>    {/* New */}
    <th className="py-2">Paper Title</th>
    <th className="py-2">Assigned Date</th>
    <th className="py-2">Review Status</th>
    <th className="py-2">Review Decision</th>
  </tr>
</thead>

<tbody>
  {assignments.length === 0 ? (
    <tr>
      <td colSpan="5" className="py-4 text-center">No assignments found</td>
    </tr>
  ) : (
    assignments.map((assignment, idx) => (
      <tr key={idx} className="border-b hover:bg-gray-50">
        <td className="py-2">{assignment.paper_id}</td>
        <td className="py-2">{assignment.title}</td>
        <td className="py-2">{new Date(assignment.assigned_at).toLocaleDateString()}</td>
        <td className="py-2">{assignment.review_status || 'Pending'}</td>
        <td className="py-2">{assignment.review_decision || '-'}</td>
      </tr>
    ))
  )}
</tbody>


        </table>
      </main>
    </div>
  );
};

export default ReviewerAssignments;
