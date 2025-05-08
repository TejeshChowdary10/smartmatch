import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ReviewerDashboard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username');
  const [email, setEmail] = useState(queryParams.get('email'));

  useEffect(() => {
    if (!email) {
      fetch(`http://localhost:5000/api/reviewer-details/${username}`)
        .then(res => res.json())
        .then(data => {
          setEmail(data.email);
          localStorage.setItem('reviewerEmail', data.email);
        });
    } else {
      localStorage.setItem('reviewerEmail', email);
    }
  }, [username, email]);   // Add dependencies
  
  

  const [assignedPapers, setAssignedPapers] = useState([]);
  const [completedReviews, setCompletedReviews] = useState(0);
  const [underReview, setUnderReview] = useState(0);

  useEffect(() => {
    fetchAssignedPapers();
  }, []);

  const fetchAssignedPapers = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviewer-assignments/${username}`);
      const data = await res.json();
  
      if (res.ok) {
        const papersWithStatus = data.map(paper => ({
          paperId: paper.paper_id,
          title: paper.title,
          authors: paper.authors,
          dueDate: new Date(paper.submission_date).toISOString().slice(0, 10),
          pdf_path: paper.pdf_path,
          status: paper.review_status || 'Pending',       // ✅ pull correct backend status
          decision: paper.review_decision || '',           // ✅ pull correct backend decision
          comments: paper.review_comments || '',           // ✅ pull correct backend comments
          isSubmitted: (paper.review_status === 'Completed'), // ✅ Lock if already submitted
        }));
        
  
        setAssignedPapers(papersWithStatus);
  
        const completed = papersWithStatus.filter(p => p.status === 'Completed').length;
        const underRev = papersWithStatus.filter(p => p.status !== 'Completed').length;
        setCompletedReviews(completed);
        setUnderReview(underRev);
      }
    } catch (err) {
      console.error('Failed to fetch assigned papers', err);
    }
  };
  
  // When Status Dropdown Changes
  const handleStatusChange = (index, newStatus) => {
    const updatedPapers = [...assignedPapers];
    updatedPapers[index].status = newStatus;   // 🔥 set status, not reviewDecision
    setAssignedPapers(updatedPapers);
  };
  
  

// When Comments Input Changes
const handleCommentChange = (index, newComment) => {
  const updatedPapers = [...assignedPapers];
  updatedPapers[index].comments = newComment;
  setAssignedPapers(updatedPapers);
};

// View PDF
const handleViewPDF = (pdfPath) => {
  window.open(`http://localhost:5000/${pdfPath}`, "_blank");
};

// Save review
// Save: save but allow editing later
const handleSaveReview = async (paper, index) => {
  try {
    await fetch('http://localhost:5000/api/submit-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paperId: paper.paperId,
        reviewerUsername: username,
        status: paper.status,
        comments: paper.comments,
        reviewDecision: paper.decision,  // <== You are sending reviewDecision
      }),
    });
    

    alert('Saved successfully!');
  } catch (err) {
    console.error('Failed to save review', err);
    alert('Failed to save review');
  }
};

// Submit: save and lock (no future edit)
const handleSubmitReview = async (paper, index) => {
  try {
    await fetch('http://localhost:5000/api/submit-review', {  // 🔥 submit API
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paperId: paper.paperId,
        reviewerUsername: username,
        status: 'Completed',
        comments: paper.comments,
        reviewDecision: paper.decision,
      }),
    });

    const updatedPapers = [...assignedPapers];
    updatedPapers[index].isSubmitted = true; // 🔥 mark submitted
    setAssignedPapers(updatedPapers);

    alert('Review submitted successfully!');
  } catch (err) {
    console.error('Failed to submit review', err);
    alert('Failed to submit review');
  }
};

// n Decision Dropdown Changes
const handleDecisionChange = (index, newDecision) => {
  const updatedPapers = [...assignedPapers];
  updatedPapers[index].decision = newDecision;
  setAssignedPapers(updatedPapers);
};

const deadlineSoon = assignedPapers.filter(p => {
  const dueDate = new Date(p.dueDate);
  const today = new Date();
  const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);
  return diffDays <= 5 && !p.isSubmitted;   // 🔥 skip submitted papers
}).length;

// On-time submissions count
const onTimeSubmissions = assignedPapers.filter(p => {
  if (p.status !== 'Completed') return false;

  // If backend has submission_date, compare it to dueDate.
  // Example:
  // return new Date(p.submission_date) <= new Date(p.dueDate);

  // For now, assume all Completed are on-time:
  return true;
}).length;

// Calculate percentage
const onTimePercentage = assignedPapers.length > 0
  ? Math.round((onTimeSubmissions / assignedPapers.length) * 100)
  : 0;

  return (
    <div className="flex min-h-screen font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold p-6">Reviewer Portal</h1>
          <nav className="space-y-2 px-6">
            <a href="#" className="block py-2 hover:bg-gray-700 rounded px-2">Dashboard</a>


            <a href={`/review-history?email=${email}&username=${username}`} className="block py-2 hover:bg-gray-700 rounded px-2">Review History</a>
            <a href={`/leave-request?username=${username}&email=${email}`} className="block py-2 hover:bg-gray-700 rounded px-2">
  Submit Leave Request
</a>

            <button 
    className="block py-2 hover:bg-gray-700 rounded px-2 text-left w-full"
    onClick={() => { window.location.href = '/'; }}
  >
    Logout
  </button>

          </nav>
        </div>
        <div className="p-6 text-sm text-center border-t border-gray-700">
          <p className="font-semibold">{username}</p>
          <p className="text-gray-400">Reviewer</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

        {/* Top stats */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl text-center shadow">
            <p className="text-sm text-gray-500">Total Assigned</p>
            <p className="text-3xl font-bold">{assignedPapers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl text-center shadow">
            <p className="text-sm text-gray-500">Under Review</p>
            <p className="text-3xl font-bold">{underReview}</p>
          </div>
          <div className="bg-white p-6 rounded-xl text-center shadow">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-3xl font-bold">{completedReviews}</p>
          </div>
          <div className="bg-white p-6 rounded-xl text-center shadow">
            <p className="text-sm text-gray-500">Deadline Soon</p>
            <p className="text-3xl font-bold">{deadlineSoon || 0}</p>

          </div>
        </div>

        {/* Recent Assigned Papers */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Assigned Papers</h3>
          <table className="w-full text-left text-sm">
          <thead>
  <tr className="border-b text-gray-600">
    <th className="py-2">Paper ID</th> {/* New */}
    <th className="py-2">Paper Title</th>
    <th className="py-2">Authors</th>
    <th className="py-2">Due Date</th>
    <th className="py-2">View PDF</th>
    <th className="py-2">Status</th>
    <th className="py-2">Decision</th>
    <th className="py-2">Comments</th>
    <th className="py-2">Action</th>
  </tr>
</thead>

<tbody>
{assignedPapers.slice(-3).map((paper, idx) => (
    <tr key={idx} className="border-b hover:bg-gray-50">
      
      <td className="py-2">{paper.paperId}</td> {/* New Paper ID column */}
      <td className="py-2">{paper.title}</td> {/* Correct title here */}
      <td className="py-2">{paper.authors}</td>
      <td className="py-2">{paper.dueDate}</td>

      {/* View PDF */}
      <td className="py-2">
        <button
          className="text-blue-500 hover:underline"
          onClick={() => handleViewPDF(paper.pdf_path)}
        >
          View
        </button>
      </td>

      {/* Status Dropdown */}
      <td className="py-2">
      <select
  value={paper.status || 'Pending'}
  onChange={(e) => handleStatusChange(idx, e.target.value)}
  className="border p-1 rounded"
  disabled={paper.isSubmitted}  
>

          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </td>

      {/* Review Decision Dropdown */}
      <td className="py-2">
      <select
  value={paper.decision || ''}
  onChange={(e) => handleDecisionChange(idx, e.target.value)}
  className="border p-1 rounded"
  disabled={paper.isSubmitted}  // 🔥 added here
>

          <option value="">Select Decision</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Accepted with Revision">Accepted with Revision</option>
        </select>
      </td>

      {/* Comments Textarea */}
      <td className="py-2">
      <textarea
  rows="3"
  className="border p-2 rounded w-full"
  value={paper.comments || ''}
  onChange={(e) => handleCommentChange(idx, e.target.value)}
  disabled={paper.isSubmitted}  // 🔥 added here
/>

      </td>

      {/* Save Button */}
      <td className="py-2">
  {paper.isSubmitted ? (
    <span className="text-green-600 font-semibold">Submitted</span>  // ✅ locked
  ) : (
    <>
      {paper.status === 'Completed' ? (
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
          onClick={() => handleSubmitReview(paper, idx)}
        >
          Submit
        </button>
      ) : (
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          onClick={() => handleSaveReview(paper, idx)}
        >
          Save
        </button>
      )}
    </>
  )}
</td>


    </tr>
  ))}
</tbody>

          </table>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Deadlines</h3>
            {assignedPapers.filter(p => !p.isSubmitted).map((paper, idx) => (
  <div key={idx} className="flex justify-between items-center border-b py-2">
    <div>
      <p className="font-medium">{paper.title}</p>
      <p className="text-sm text-gray-500">Due: {paper.dueDate}</p>
    </div>
  </div>
))}

          </div>

          {/* Review Progress */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Review Progress</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Completed Reviews</p>
              <div className="h-3 bg-gray-200 rounded-full">
                <div
                  className="h-3 bg-blue-600 rounded-full"
                  style={{ width: `${(completedReviews / assignedPapers.length) * 100 || 0}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">{completedReviews}/{assignedPapers.length}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">On-time Submissions</p>
              <div className="h-3 bg-gray-200 rounded-full">
              <div className="h-3 bg-green-500 rounded-full" style={{ width: `${onTimePercentage}%` }}></div>

              </div>
              <p className="text-sm mt-1">{onTimePercentage}%</p>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ReviewerDashboard;
