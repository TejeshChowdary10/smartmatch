import React, { useEffect, useState } from 'react';

const ManagePapers = () => {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/all-paper-status');  // We'll create this API
      const data = await res.json();
      setPapers(data);
    } catch (err) {
      console.error('Failed to load papers', err);
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
          <a href="/manage-papers" className="block text-white underline">Manage Papers</a>
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
        <h2 className="text-2xl font-semibold mb-6">Manage Papers</h2>

        <table className="w-full text-sm text-left">
        <thead>
  <tr className="border-b text-gray-600">
    <th className="py-2">Paper ID</th>
    <th className="py-2">Paper Title</th>
    <th className="py-2">Reviewer</th>
    <th className="py-2">Status</th>
    <th className="py-2">Decision</th>
    <th className="py-2">Match Score</th>
  </tr>
</thead>

          <tbody>
            {papers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No papers found</td>
              </tr>
            ) : (
              papers.map((paper, idx) => (
<tr key={idx} className="border-b hover:bg-gray-100">
  <td className="py-2">{paper.paper_id}</td>
  <td className="py-2">{paper.title}</td>
  <td className="py-2">{paper.reviewer_username || '-'}</td>
  <td className="py-2">{paper.status || 'Pending'}</td>
  <td className="py-2">{paper.decision || '-'}</td>
  <td className="py-2">{paper.match_score ? `${paper.match_score}%` : '-'}</td>
</tr>

              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default ManagePapers;
