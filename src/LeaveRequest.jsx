import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LeaveRequest = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    let usernameQuery = queryParams.get('username');
    let emailQuery = queryParams.get('email');

    const [username, setUsername] = useState(usernameQuery || localStorage.getItem('reviewerUsername') || '');
    const [emailState, setEmailState] = useState(emailQuery || localStorage.getItem('reviewerEmail') || '');

    console.log('username:', username);
    console.log('emailQuery:', emailQuery);
    console.log('emailState (start):', emailState);

    // -------------------- Clear localStorage if email missing -----------------------
    useEffect(() => {
        if (!username || username === '') {
            localStorage.removeItem('reviewerUsername');
            localStorage.removeItem('reviewerEmail');
        }
    }, []);

    // -------------------- Save to localStorage -----------------------
    useEffect(() => {
        if (username) localStorage.setItem('reviewerUsername', username);
        if (emailState) localStorage.setItem('reviewerEmail', emailState);
    }, [username, emailState]);

    // -------------------- Fetch email if missing -----------------------
    useEffect(() => {
        const fetchEmailIfMissing = async () => {
            if (!emailState && username) {
                console.log(`Fetching email for username: ${username}`);
                try {
                    const response = await fetch(`http://localhost:5000/api/reviewer-details/by-username/${username}`);
                    const data = await response.json();
                    console.log('API response:', data);

                    if (data && data.email) {
                        console.log('Fetched email:', data.email);
                        setEmailState(data.email);
                        localStorage.setItem('reviewerEmail', data.email);
                    } else {
                        console.error('No email found in backend response');
                    }
                } catch (err) {
                    console.error('Fetch error:', err);
                }
            }
        };

        fetchEmailIfMissing();
    }, [username]);   // Only run when username changes

    // -------------------- Fetch leave history once email is available -----------------------
    const [leaveHistory, setLeaveHistory] = useState([]);

    const fetchLeaveHistory = async () => {
      if (!username) {
          console.log('Username missing, cannot fetch leave history');
          return;
      }
  
      console.log('Fetching leave history for username:', username);
  
      try {
          const res = await fetch(`http://localhost:5000/api/reviewer-leaves/by-username/${username}`);
          const data = await res.json();
          data.sort((a, b) => new Date(b.from_date) - new Date(a.from_date));
          setLeaveHistory(data);
      } catch (err) {
          console.error('Error fetching leave history:', err);
      }
  };
  
    // 🟢 Fetch leave history whenever emailState updates
    useEffect(() => {
        if (emailState && emailState.trim() !== '') {
            fetchLeaveHistory();
        }
    }, [emailState]);

    // -------------------- Form states -----------------------
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = async () => {
        if (!fromDate || !toDate || !reason) {
            alert('Please fill in all fields.');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const from = new Date(fromDate);
        const to = new Date(toDate);

        if (from <= today) {
            alert('From Date must be after today.');
            return;
        }

        if (to <= from) {
            alert('To Date must be after From Date.');
            return;
        }

        const response = await fetch('http://localhost:5000/api/submit-leave-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewerEmail: emailState, username, fromDate, toDate, reason }),
        });

        if (response.ok) {
            alert('Leave request submitted successfully!');
            setFromDate('');
            setToDate('');
            setReason('');
            fetchLeaveHistory(emailState);
        } else {
            alert('Failed to submit leave request.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="flex min-h-screen font-sans">
            <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between">
                <div>
                    <h1 className="text-xl font-bold p-6">Reviewer Portal</h1>
                    <nav className="space-y-2 px-6">
                        <a href={`/reviewer-dashboard?username=${username}&email=${emailState}`} className="block py-2 hover:bg-gray-700 rounded px-2">Dashboard</a>
                        <a href={`/review-history?username=${username}&email=${emailState}`} className="block py-2 hover:bg-gray-700 rounded px-2">Review History</a>
                        <a href="#" className="block py-2 bg-gray-700 rounded px-2">Submit Leave Request</a>
                        <button onClick={() => {
                            localStorage.clear();
                            window.location.href = '/';
                        }} className="block py-2 hover:bg-gray-700 rounded px-2 w-full text-left">
                            Logout
                        </button>
                    </nav>
                </div>
                <div className="p-6 text-sm text-center border-t border-gray-700">
                    <p className="font-semibold">{username || 'No Username'}</p>
                    <p className="text-gray-400">Reviewer</p>
                </div>
            </aside>

            <main className="flex-1 bg-gray-100 p-8 space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Leave Request</h2>
                <div className="bg-gray-400 p-8 rounded-xl shadow-lg max-w-xl mx-auto space-y-6">
                    <div>
                        <label className="block mb-1 font-semibold">From Date</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">To Date</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Reason</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} rows="4" className="w-full border p-2 rounded" placeholder="Enter reason for leave" />
                    </div>
                    <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                        Submit Request
                    </button>
                </div>

                <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-4">Leave Request History</h3>
                    <table className="w-full text-sm text-left bg-white rounded shadow">
                        <thead>
                            <tr className="border-b text-gray-600">
                                <th className="py-2 px-2">Start Date</th>
                                <th className="py-2 px-2">End Date</th>
                                <th className="py-2 px-2">Reason</th>
                                <th className="py-2 px-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center">No leave history available.</td>
                                </tr>
                            ) : (
                                leaveHistory.map((leave, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-2">{formatDate(leave.from_date)}</td>
                                        <td className="py-2 px-2">{formatDate(leave.to_date)}</td>
                                        <td className="py-2 px-2">{leave.reason}</td>
                                        <td className="py-2 px-2">{leave.status || 'Pending'}</td>
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

export default LeaveRequest;
