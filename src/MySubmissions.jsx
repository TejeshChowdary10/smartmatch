import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MySubmissions = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('user');
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [edited, setEdited] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${username}`);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  }, [username]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleEditChange = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  
  const handleSave = async (id) => {
    const formData = new FormData();
    if (!edited.title || !edited.abstract || !edited.keywords || (!selectedFile && !(edited.pdf_path || submissions.find(s => s.id === id).pdf_path))) {
      alert('All fields are required, including uploading a PDF if no previous file exists.');
      return;
    }
  
    Object.keys(edited).forEach(key => formData.append(key, edited[key]));
  
    if (selectedFile) formData.append('pdf', selectedFile);
  
    try {
      const res = await fetch(`http://localhost:5000/api/submission/${id}`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        alert('✅ Submission updated.');
        setEditingId(null);
        fetchSubmissions();
      } else {
        alert('❌ Failed to update submission.');
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };
  

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/submission/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted');
        fetchSubmissions();
      } else {
        alert('Error deleting.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    
    <div className="min-h-screen bg-[#007399] p-10">
      <div className="flex items-center mb-6">
        {/* Back arrow */}
        <button 
          onClick={() => navigate(-1)} 
          className="text-white mr-2 hover:text-gray-300"
          title="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">My Submissions</h1>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <table className="w-full text-sm text-left">
        <thead>
  <tr className="text-gray-600 border-b">
    <th className="py-3 px-4">Paper ID</th>
    <th className="py-3 px-4">Paper Title</th>
    <th className="py-3 px-4">Abstract</th>
    <th className="py-3 px-4">Keywords</th>
    <th className="py-3 px-4">Co-Authors</th>
    <th className="py-3 px-4">Submission Date</th>
    <th className="py-3 px-4">Status</th>
    <th className="py-3 px-4">Decision</th>
    <th className="py-3 px-4">Comments</th>
    <th className="py-3 px-4">Paper</th>
    <th className="py-3 px-4">Actions</th>
  </tr>
</thead>

          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.id} className="border-b">
  <td className="py-3 px-4">{sub.id}</td> 
  <td className="py-3 px-4">
    {editingId === sub.id ? (
      <input value={edited.title || ''} onChange={(e) => handleEditChange('title', e.target.value)} className="border px-2 py-1 w-full" />
    ) : (
      sub.title
    )}
  </td>

                <td className="py-3 px-4">
                  {editingId === sub.id ? (
                    <textarea value={edited.abstract || ''} onChange={(e) => handleEditChange('abstract', e.target.value)} className="border px-2 py-1 w-full" />
                  ) : (
                    sub.abstract
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingId === sub.id ? (
                    <input value={edited.keywords || ''} onChange={(e) => handleEditChange('keywords', e.target.value)} className="border px-2 py-1 w-full" />
                  ) : (
                    sub.keywords
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingId === sub.id ? (
                    <input value={edited.co_authors || ''} onChange={(e) => handleEditChange('co_authors', e.target.value)} className="border px-2 py-1 w-full" />
                  ) : (
                    sub.co_authors
                  )}
                </td>
                <td className="py-3 px-4">{new Date(sub.submission_date).toLocaleString()}</td>
                <td className="py-3 px-4">{sub.review_status}</td>
<td className="py-3 px-4">{sub.review_decision}</td>
<td className="py-3 px-4">{sub.review_comments}</td>

<td className="py-3 px-4">
  {editingId === sub.id ? (
    <div className="flex flex-col space-y-2 relative">

      {/* EXISTING OR NEW FILE PREVIEW */}
      {!selectedFile && (edited.pdf_path !== undefined ? edited.pdf_path : sub.pdf_path) && (

        <div className="flex items-center bg-white rounded-lg border border-gray-300 shadow-sm px-3 py-2 relative w-max">
          <div className="flex items-center space-x-2">
            <div className="text-pink-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V8l-6-6H6zm5 7V3.5L16.5 9H11z" />
              </svg>
            </div>
            <div className="flex flex-col">
            <a 
  href={`http://localhost:5000/${sub.pdf_path.replace(/\\/g, '/')}`} 
  target="_blank" 
  rel="noreferrer"
  className="text-sm font-semibold text-blue-800 underline truncate max-w-[200px]"
>
  {sub.pdf_path.split(/[\\/]/).pop()}
</a>

              <span className="text-xs text-gray-500">PDF</span>
            </div>
          </div>
          <button 
onClick={() => {
  if (window.confirm("Are you sure you want to remove this file?")) {
    setSelectedFile(null); 
    setEdited(prev => ({ ...prev, pdf_path: '' }));  // <== VERY IMPORTANT
    const fileInput = document.getElementById(`fileInput_${sub.id}`);
    if (fileInput) fileInput.value = "";
  }
}}

            className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600"
            title="Remove file"
          >
            ×
          </button>
        </div>
      )}

      {/* FILE INPUT */}
      <input 
        type="file" 
        accept=".pdf" 
        id={`fileInput_${sub.id}`}
        onChange={handleFileChange} 
      />
    </div>
  ) : (
    <a 
      href={`http://localhost:5000/${sub.pdf_path}`} 
      target="_blank" 
      rel="noreferrer" 
      className="text-blue-600 underline"
    >
      View
    </a>
  )}
</td>



                <td className="py-3 px-4">
  {editingId === sub.id ? (
    <>
      <button onClick={() => handleSave(sub.id)} className="text-green-600 mr-2">Save</button>
      <button onClick={() => setEditingId(null)} className="text-gray-600">Cancel</button>
    </>
  ) : (
    <>
<button 
  onClick={() => {
    setEditingId(sub.id);
    setEdited({
      title: sub.title,
      abstract: sub.abstract,
      keywords: sub.keywords,
      co_authors: sub.co_authors,
      pdf_path: sub.pdf_path || ''
    });
    setSelectedFile(null);
  }} 
  className="text-indigo-600 mr-2"
  disabled={sub.review_status === 'Completed' || sub.alreadyAssigned}
>
  Edit
</button>

<button 
  onClick={() => handleDelete(sub.id)} 
  className="text-red-600" 
  disabled={sub.review_status === 'Completed' || sub.alreadyAssigned}
>
  Delete
</button>

    </>
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MySubmissions;
