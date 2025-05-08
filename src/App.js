import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './Welcome';
import Dashboard from './Dashboard';
import SplashScreen from './SplashScreen'; // <-- import splash
import ForgotPassword from './ForgotPassword';
import Profile from './Profile';
import NewSubmission from './NewSubmission';
import AdminDashboard from './AdminDashboard'; // <-- import admin dashboard
import RegisterReviewer from './RegisterReviewer';
import ReviewerDashboard from './ReviewerDashboard';
import MySubmissions from './MySubmissions';
import ManageReviewers from './ManageReviewers';
import ReviewerDetails from './ReviewerDetails';  
import ReviewerAssignments from './ReviewerAssignments';  // Adjust path as per your structure
import ManagePapers from './ManagePapers'; // Adjust path as per your structure
import LeaveRequest from './LeaveRequest'; // ADD THIS
import ReviewHistory from './ReviewHistory';

// Inside <Routes> component:


// Inside <Routes>



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} /> {/* splash shows first */}
        <Route path="/login" element={<Welcome />} /> {/* login page follows */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/new-submission" element={<NewSubmission />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/register-reviewer" element={<RegisterReviewer />} />
        <Route path="/reviewer-dashboard" element={<ReviewerDashboard />} />
        <Route path="/my-submissions" element={<MySubmissions />} />
        <Route path="/manage-reviewers" element={<ManageReviewers />} />
        <Route path="/reviewer-details/:email" element={<ReviewerDetails />} />
        <Route path="/reviewer-assignments/:email/:full_name" element={<ReviewerAssignments />} />
        <Route path="/manage-papers" element={<ManagePapers />} />
        <Route path="/leave-request" element={<LeaveRequest />} /> 
        <Route path="/review-history" element={<ReviewHistory />} />    
      </Routes>
    </Router>
  );
}

export default App;
