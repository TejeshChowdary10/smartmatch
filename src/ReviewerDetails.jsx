import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ReviewerDetails = () => {
  const { email } = useParams();  // Reviewer email passed as parameter
  const [reviewerData, setReviewerData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviewerDetails();
    fetchLeaveRequests();
  }, [email]);

  // Fetch Reviewer details from server
  const fetchReviewerDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviewer-details/${email}`);
      const data = await res.json();
      setReviewerData(data);
    } catch (err) {
      setError('Error loading reviewer details');
    }
  };

  // Fetch Leave Requests
  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviewer-leaves/${email}`);
      const data = await res.json();
      setLeaveRequests(data);
    } catch (err) {
      setError('Error loading leave requests');
    }
  };

  // Accept Leave Request
  const acceptLeaveRequest = async (leaveId, reason) => {
    try {
      const res = await fetch('http://localhost:5000/api/accept-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveId, admin_reason: reason })

      });
      const data = await res.json();
      if (res.ok) {
        alert('Leave Request Accepted');
        fetchLeaveRequests();  // Refresh the leave requests
      } else {
        alert(data.error);
      }
    } catch (err) {
      setError('Error accepting leave request');
    }
  };

  // Reject Leave Request
  const rejectLeaveRequest = async (leaveId, reason) => {
    try {
      const res = await fetch('http://localhost:5000/api/reject-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveId, status: 'Rejected', reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Leave Request Rejected');
        fetchLeaveRequests();  // Refresh the leave requests
      } else {
        alert(data.error);
      }
    } catch (err) {
      setError('Error rejecting leave request');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
  
    const suffix = (d) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
  
    return `${day}${suffix(day)} ${month} ${year}`;
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
      <main className="flex-1 bg-gray-50 p-10 space-y-8">
        <h2 className="text-2xl font-semibold mb-6">Reviewer Details: {email}</h2>

        {/* Reviewer Info */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h3 className="font-semibold text-lg">Reviewer Info</h3>
          <p><strong>Name:</strong> {reviewerData?.full_name}</p>
          <p><strong>Email:</strong> {reviewerData?.email}</p>
          <p><strong>Campus:</strong> {reviewerData?.campus}</p>
          <p><strong>Expertise:</strong> {reviewerData?.keywords}</p>
        </div>

        {/* Leave Requests */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-4">Leave Requests</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Leave Start Date</th>
                <th className="py-2">Leave End Date</th>
                <th className="py-2">Reason</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
  {leaveRequests.length === 0 ? (
    <tr>
      <td colSpan="4" className="py-4 text-center">No leave requests</td>
    </tr>
  ) : (
    leaveRequests.map((leave, idx) => (
      <tr key={idx} className="border-b hover:bg-gray-50">
        <td className="py-2">{formatDate(leave.from_date)}</td>
        <td className="py-2">{formatDate(leave.to_date)}</td>
        <td className="py-2">{leave.reason}</td>
        <td className="py-2">
          {leave.status === 'Pending' ? (
            <>
              <button
                onClick={() => acceptLeaveRequest(leave.id, 'Approved for leave')}
                className="text-green-600 hover:underline mr-4"
              >
                Accept
              </button>
              <button
                onClick={() => rejectLeaveRequest(leave.id, 'Rejected due to conflicting schedules')}
                className="text-red-600 hover:underline"
              >
                Reject
              </button>
            </>
          ) : leave.status === 'Approved' ? (
            <span className="text-green-600 font-semibold">Approved</span>
          ) : (
            <span className="text-red-600 font-semibold">Rejected</span>
          )}
        </td>
      </tr>
    ))
  )}
</tbody>

          </table>
        </div>
      </main>
    </div>
  );
};

export default ReviewerDetails;