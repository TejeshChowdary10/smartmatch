import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ReviewHistory = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username');
  const email = queryParams.get('email');

  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchReviewHistory();
  }, [username]);  // add dependency
  

  const fetchReviewHistory = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviewer-history/${username}`);
      const data = await res.json();

      // Sort to show most recent first
      const sorted = data.reverse();
      setHistory(sorted);

    } catch (err) {
      console.error('Failed to fetch review history', err);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-xl font-bold mb-6">Reviewer Portal</h1>
        <nav className="space-y-4">
        <a href={`/reviewer-dashboard?username=${username}&email=${email}`} className="block text-white hover:underline">Dashboard</a>
<a href="#" className="block text-white underline">Review History</a>
<a href={`/leave-request?email=${email}`} className="block text-white hover:underline">Submit Leave Request</a>

          <button
            className="block text-white hover:underline"
            onClick={() => { window.location.href = '/'; }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-10">
        <h2 className="text-2xl font-bold mb-6">Review History</h2>

        <table className="w-full text-sm text-left bg-white rounded-xl shadow">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2 px-3">Paper ID</th>
              <th className="py-2 px-3">Title</th>
              <th className="py-2 px-3">Authors</th>
              <th className="py-2 px-3">Submission Date</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Decision</th>
              <th className="py-2 px-3">Comments</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan="7" className="py-4 text-center">No review history found.</td></tr>
            ) : (
              history.map((paper, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{paper.paperId || paper.paper_id}</td>
                  <td className="py-2 px-3">{paper.title}</td>
                  <td className="py-2 px-3">{paper.authors}</td>
                  <td className="py-2 px-3">{paper.submission_date ? new Date(paper.submission_date).toISOString().slice(0,10) : '-'}</td>
                  <td className="py-2 px-3">{paper.review_status}</td>
                  <td className="py-2 px-3">{paper.review_decision}</td>
                  <td className="py-2 px-3">{paper.review_comments}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default ReviewHistory;
