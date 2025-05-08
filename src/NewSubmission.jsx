import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NewSubmission = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('user');

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState(null);
  const [coAuthors, setCoAuthors] = useState('');

  const handleSubmission = async (e) => {
    e.preventDefault();

    if (!title || !abstract || !keywords || !file) {
      alert("❗ Please fill in all required fields: Title, Abstract, Keywords, and upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('abstract', abstract);
    formData.append('keywords', keywords);
    formData.append('coAuthors', coAuthors);
    formData.append('pdf', file);
    formData.append('username', username);

    try {
      const res = await fetch('http://localhost:5000/api/submit-paper', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Submission successful!');
        setTitle('');
        setAbstract('');
        setKeywords('');
        setCoAuthors('');
        setFile(null);
        document.getElementById("pdfInput").value = "";
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while submitting.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#007399]">
      <div className="w-full max-w-5xl bg-white p-8 rounded shadow">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-black mr-2 hover:text-gray-600"
            title="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-xl font-semibold">New Submission</h3>
        </div>
        <form className="space-y-4" onSubmit={handleSubmission} encType="multipart/form-data">
          <input type="text" placeholder="Paper Title *" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" />
          <textarea placeholder="Abstract *" value={abstract} onChange={(e) => setAbstract(e.target.value)} className="w-full p-2 border rounded h-40"></textarea>
          <input type="text" placeholder="Keywords (comma-separated) *" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full p-2 border rounded" />
          <input type="text" placeholder="Co-Author Emails (comma-separated)" value={coAuthors} onChange={(e) => setCoAuthors(e.target.value)} className="w-full p-2 border rounded" />

          <div className="mb-4">
            <input
              id="pdfInput"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              ref={(ref) => (window.pdfRef = ref)}
            />
            <label
              htmlFor="pdfInput"
              className="inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded"
            >
              Choose File
            </label>

            {file && (
              <div className="relative mt-4 flex items-center bg-white border p-3 rounded-lg shadow-sm w-fit">
                <div className="w-10 h-10 flex items-center justify-center bg-pink-500 text-white rounded-full mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">PDF</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (window.pdfRef) window.pdfRef.value = null;
                  }}
                  className="absolute top-0 right-0 -mt-2 -mr-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-700"
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Paper</button>
        </form>
      </div>
    </div>
  );
};

export default NewSubmission;
