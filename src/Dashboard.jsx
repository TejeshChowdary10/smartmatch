import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username');  // ✅ match exactly
  const [editingId] = useState(null);
  const [editedSubmission, setEditedSubmission] = useState({});
  const handleEditChange = (field, value) => {
    setEditedSubmission(prev => ({
      ...prev,
      [field]: value,
    }));
  };
    
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${username}`);
      const data = await res.json();
      if (res.ok) {
        // Sort by submission_date descending
        const sorted = data.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));
  
        const updatedData = sorted.map(sub => ({
          ...sub,
          status: sub.review_status || 'To Be Reviewed',
          decision: sub.review_decision || '-',
          comments: sub.review_comments || '-',
        }));
  
        setSubmissions(updatedData);
      }
  
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  }, [username]);
  

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleProfileSettings = () => {
    navigate(`/profile/${username}`);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Accepted with Revision': return 'bg-yellow-100 text-yellow-700';
      case 'To Be Reviewed': return 'bg-gray-100 text-gray-700';
      default: return '';
    }
  };

  const formatDateIST = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-6">Conference Hub</h1>
        <nav className="space-y-4">
          <button onClick={() => navigate(`/new-submission?user=${username}`)} className="block text-white hover:underline w-full text-left">
            New Submission
          </button>
          <button onClick={() => navigate(`/my-submissions?user=${username}`)} className="block text-white hover:underline w-full text-left">
  My Submissions
</button>

          <button onClick={handleProfileSettings} className="block text-white hover:underline text-left w-full">Profile Settings</button>
          <button 
  className="block text-white hover:underline w-full text-left"
  onClick={() => { window.location.href = '/'; }}
>
  Logout
</button>

        </nav>
      </aside>

      <main className="flex-1 bg-gray-100 p-10 flex justify-center">
        <div className="w-full max-w-6xl">
          <h2 className="text-xl font-semibold mb-6">Welcome, {username}</h2>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-gray-700 text-sm">Total Submissions</h3>
              <p className="text-2xl font-bold">{submissions.length}</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-700 text-sm">Accepted with Revision</h3>
<p className="text-2xl font-bold">{submissions.filter(s => s.decision === 'Accepted with Revision').length}</p>

            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-gray-700 text-sm">Accepted</h3>
              <p className="text-2xl font-bold">{submissions.filter(s => s.decision === 'Accepted').length}</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-gray-700 text-sm">Rejected</h3>
              <p className="text-2xl font-bold">{submissions.filter(s => s.decision === 'Rejected').length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
            <table className="w-full text-sm text-left">
            <thead>
  <tr className="text-gray-600 border-b">
    <th className="py-3 px-4 text-left w-[50%]">Paper Title</th>
    <th className="py-3 px-4 text-left w-[15%]">Submission Date</th>
    <th className="py-3 px-4 text-left w-[15%]">Status</th>
    <th className="py-3 px-4 text-left w-[15%]">Decision</th>
    <th className="py-3 px-4 text-left w-[20%]">Comments</th>
    <th className="py-3 px-4 text-left w-[10%]">Paper</th>

  </tr>
</thead>

<tbody>
{submissions.slice(-4).map((submission, idx) => (


    <tr key={idx} className="border-b hover:bg-gray-50">
      {/* Title Cell */}
      <td className="py-4 px-4">
        {editingId === submission.id ? (
          <input
            type="text"
            className="border px-2 py-1 w-full"
            value={editedSubmission.title}
            onChange={(e) => handleEditChange('title', e.target.value)}
          />
        ) : (
          submission.title
        )}
      </td>

      {/* Submission Date */}
      <td className="py-4 px-4">{formatDateIST(submission.submission_date)}</td>

      {/* Status */}
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(submission.status)}`}>
          {submission.status}
        </span>
      </td>

      {/* Decision */}
      <td className="py-4 px-4">{submission.decision}</td>

      {/* Comments Cell (Editable Abstract Field) */}
      <td className="py-4 px-4">
        {editingId === submission.id ? (
          <textarea
            className="border px-2 py-1 w-full"
            value={editedSubmission.abstract}
            onChange={(e) => handleEditChange('abstract', e.target.value)}
          />
        ) : (
          <div className="border p-3 rounded bg-gray-50 text-gray-700 text-sm min-w-[250px] max-w-[350px] overflow-x-auto">
            {submission.comments}
          </div>
        )}
      </td>

      {/* Actions */}
{/* Paper View Only */}
<td className="py-4 px-4">
  <a
    href={`http://localhost:5000/${submission.pdf_path}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:underline font-medium"
  >
    View
  </a>
</td>

    </tr>
  ))}
</tbody>




            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
