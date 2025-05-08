import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalReviewers: 0,
    pendingAssignments: 0,
    loginActivities: 0
  });

  const [assignments, setAssignments] = useState([]);


  useEffect(() => {
    fetchStats();
    fetchAssignments();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin-stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };


  const fetchAssignments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/match-scores');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssignments(data); // If success
      } else {
        console.error('Assignments API returned invalid data:', data);
        setAssignments([]); // fallback to empty array
      }
    } catch (err) {
      console.error('Failed to load paper assignments', err);
      setAssignments([]);
    }
  };
  
  
  const handleAssign = async (paperId, reviewerUsername, matchScore) => {

    try {
      const res = await fetch('http://localhost:5000/api/assign-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, reviewerUsername, matchScore }),
      });
      
  
      const data = await res.json();
      if (res.ok) {
        alert('Paper assigned successfully!');
        fetchAssignments(); // Refresh the list after assignment
      } else {
        alert('Assignment failed: ' + data.error);
      }
    } catch (err) {
      console.error('Error assigning:', err);
    }
  };
  
  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 min-h-screen">
        <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>
        <nav className="space-y-4">

<Link to="/admin-dashboard" className="block text-white hover:underline">Dashboard</Link>
<Link to="/register-reviewer" className="block text-white hover:underline">Register Reviewer</Link>
<Link to="/manage-reviewers" className="block text-white hover:underline">Manage Reviewers</Link>
<Link to="/manage-papers" className="block text-white hover:underline">Manage Papers</Link>
<button 
  className="block text-white hover:underline"
  onClick={() => { window.location.href = '/'; }}
>
  Logout
</button>

</nav>


      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-10 space-y-8">
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-sm font-medium text-gray-500">Active Users</p>
            <p className="text-3xl font-bold text-blue-800">{stats.activeUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-sm font-medium text-gray-500">Total Reviewers</p>
            <p className="text-3xl font-bold text-blue-800">{stats.totalReviewers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-sm font-medium text-gray-500">Pending Assignments</p>
            <p className="text-3xl font-bold text-blue-800">{stats.pendingAssignments}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-sm font-medium text-gray-500">Login Activities</p>
            <p className="text-3xl font-bold text-blue-800">{stats.loginActivities}</p>
          </div>
        </div>

        {/* Login Activities */}


        {/* Paper Assignments */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Paper Assignments</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Paper Title</th>
                <th className="py-2">Suggested Reviewers</th>
                <th className="py-2">Match Score</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
  {assignments.map((paper, i) => (
    paper.matches.length > 0 ? (
      <React.Fragment key={i}>
        {paper.matches.map((reviewer, idx) => (
          <tr key={idx} className="border-b hover:bg-gray-100">
            {idx === 0 && (
              <td className="py-2" rowSpan={paper.matches.length}>{paper.title}</td>
            )}
            <td className="py-2">{reviewer.reviewerUsername}</td>
            <td className="py-2">{reviewer.matchScore}%</td>
            <td className="py-2">
              {paper.alreadyAssigned ? (
                <span className="text-gray-500">Already Assigned</span>
              ) : (
                <button 
                  onClick={() => handleAssign(paper.paperId, reviewer.reviewerUsername, reviewer.matchScore)}
                  className="text-blue-600 hover:underline"
                >
                  Assign
                </button>
              )}
            </td>
          </tr>
        ))}
      </React.Fragment>
    ) : (
      <tr key={i} className="border-b hover:bg-gray-100">
        <td className="py-2">{paper.title}</td>
        <td className="py-2 text-gray-500" colSpan={3}>No eligible reviewers found</td>
      </tr>
    )
  ))}
</tbody>



          </table>
        </div>

        {/* Reviewer List */}

      </main>
    </div>
  );
};

export default AdminDashboard;
