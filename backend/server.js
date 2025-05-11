// server.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config for storing PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${name}${ext}`);
  }
});
const upload = multer({ storage });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tejeshchowdary919@gmail.com',
    pass: 'xnau iswe fzel recg',
  },
  port: 587,
  secure: false,
});
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smartmatch',
  password: 'Chinnu62@',
  port: 5432,
});
// Temporary stores
let emailVerifications = {}; // key: email, value: 4-digit code
const resetTokens = new Map(); // key: token, value: email



// Signup
app.post('/api/signup', async (req, res) => {
  const { email, username, password, firstName, lastName, dateOfBirth, campus, country } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (email, username, password, first_name, last_name, date_of_birth, campus, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [email, username, password, firstName, lastName, dateOfBirth, campus, country]
    );
    
    res.status(201).json({ message: 'Signup successful!', user: result.rows[0] });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Updated Login for Both Users and Reviewers
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // First try normal users table
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];

      // ✅ Log login activity
      await pool.query(
        'INSERT INTO login_activities (username, role, login_time) VALUES ($1, $2, CURRENT_TIMESTAMP)',
        [username, 'author']
      );

      return res.json({ username: user.username, first_name: user.first_name, role: 'author' });
    }

    // If not found in users, try reviewers table
    const reviewerResult = await pool.query(
      'SELECT * FROM reviewers WHERE username = $1 AND password = $2',
      [username, password]
    );
    

    if (reviewerResult.rows.length > 0) {
      const reviewer = reviewerResult.rows[0];

      // ✅ Log reviewer login too
      await pool.query(
        'INSERT INTO login_activities (username, role, login_time) VALUES ($1, $2, CURRENT_TIMESTAMP)',
        [username, 'reviewer']
      );

      return res.json({ username: reviewer.username, full_name: reviewer.full_name, role: 'reviewer' });

    }

    // ❌ If not found in both tables
    return res.status(401).json({ error: 'Invalid username or password' });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});



app.post('/api/submit-paper', upload.single('pdf'), async (req, res) => {
  const { title, abstract, username, keywords, coAuthors } = req.body;
  const file = req.file;
  const originalFilename = file.originalname;  // 👈 Get the real uploaded filename

  if (!title || !abstract || !username || !file || !keywords) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Sanity check: Validate co-author emails
  let invalidEmails = [];
  if (coAuthors) {
    const emails = coAuthors.split(',').map(email => email.trim());
    for (const email of emails) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        invalidEmails.push(email);
      }
    }
  }

  if (invalidEmails.length > 0) {
    return res.status(400).json({
      error: `The following co-author emails are not registered: ${invalidEmails.join(', ')}`
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO submissions 
       (title, abstract, pdf_path, pdf_original_name, username, keywords, co_authors, status, submission_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
       [title, abstract, file.path, originalFilename, username, keywords, coAuthors, 'To Be Reviewed']
    );
    
    

    res.status(201).json({ message: 'Paper submitted successfully!', submission: result.rows[0] });
  } catch (err) {
    console.error('Submission error:', err.message);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// Get submissions by username
// Get submissions by username
app.get('/api/submissions/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const submissionResult = await pool.query('SELECT * FROM submissions WHERE username = $1', [username]);

    const submissions = submissionResult.rows;

    const updatedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        const reviewResult = await pool.query('SELECT status, decision, comments FROM reviews WHERE paper_id = $1', [submission.id]);

        // 🔥 ADD THIS — check if assigned to any reviewer
        const assignCheck = await pool.query(
          'SELECT COUNT(*) FROM assignments WHERE paper_id = $1',
          [submission.id]
        );

        const alreadyAssigned = parseInt(assignCheck.rows[0].count) >= 1;

        if (reviewResult.rows.length > 0) {
          const review = reviewResult.rows[0];
          return {
            ...submission,
            review_status: review.status,
            review_decision: review.decision,
            review_comments: review.comments,
            alreadyAssigned   // ✅ Add this key to the response
          };
        } else {
          return {
            ...submission,
            review_status: 'To Be Reviewed',
            review_decision: '-',
            review_comments: '-',
            alreadyAssigned   // ✅ Add this key to the response
          };
        }
      })
    );

    res.json(updatedSubmissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// Send verification code
app.post('/api/send-verification', async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  emailVerifications[email] = code;
  try {
    await transporter.sendMail({
      from: 'SmartMatch <no-reply@smartmatch.com>',
      to: email,
      subject: 'SmartMatch Email Verification Code',
      text: `Your verification code is: ${code}`,
    });
    res.json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Verify code
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (emailVerifications[email] === code) {
    delete emailVerifications[email];
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid verification code' });
  }
});

const otpStorage = {}; // Store OTPs temporarily

// Send OTP
app.post('/api/send-reset-otp', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email exists in users table
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Email not registered' });
    }

    // Proceed if user exists
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStorage[email] = otp;

    await transporter.sendMail({
      from: 'SmartMatch <no-reply@smartmatch.com>',
      to: email,
      subject: 'SmartMatch Password Reset OTP',
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ message: 'OTP sent' });

  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/api/verify-reset-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStorage[email] === otp) {
    delete otpStorage[email];
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

// Final Password Reset
app.post('/api/reset-password-final', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [newPassword, email]);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// GET user profile
app.get('/api/user/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// UPDATE user profile
app.put('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  const { first_name, last_name, email, country, password, date_of_birth, campus } = req.body;

  try {
 await pool.query(
  'UPDATE users SET first_name=$1, last_name=$2, email=$3, country=$4, password=$5, date_of_birth=$6, campus=$7 WHERE username=$8',
  [first_name, last_name, email, country, password, date_of_birth, campus, username]
);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Start server
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
app.put('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  const { first_name, last_name, email, country, password, date_of_birth, campus } = req.body;

  try {
    await pool.query(
      "UPDATE users SET first_name=$1, last_name=$2, email=$3, country=$4, password=$5, date_of_birth=$6, campus=$7 WHERE username=$8"
,
      [first_name, last_name, email, country, password, date_of_birth, campus, username]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating profile' });
  }
});
app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Admin' && password === 'Amma@123') {
    res.json({ success: true, role: 'admin' });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Get all login activities
app.get('/api/admin/login-activities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM login_activities ORDER BY login_time DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Dashboard metrics
app.get('/api/admin/metrics', async (req, res) => {
  try {
    const users = await pool.query(`SELECT COUNT(*) FROM users`);
    const reviewers = await pool.query(`SELECT COUNT(*) FROM reviewers`);
    const pending = await pool.query(`SELECT COUNT(*) FROM submissions WHERE status='To Be Reviewed'`);
    const logins = await pool.query(`SELECT COUNT(*) FROM login_activities`);
    
    res.json({
      activeUsers: parseInt(users.rows[0].count),
      totalReviewers: parseInt(reviewers.rows[0].count),
      pendingAssignments: parseInt(pending.rows[0].count),
      loginActivities: parseInt(logins.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load metrics' });
  }
});
// Get admin dashboard stats
app.get('/api/admin-stats', async (req, res) => {
  try {
    const activeUsersRes = await pool.query(`SELECT COUNT(*) FROM users`);
    const reviewersRes = await pool.query(`SELECT COUNT(*) FROM reviewers`);
    const pendingAssignmentsRes = await pool.query(`SELECT COUNT(*) FROM submissions WHERE status = 'To Be Reviewed'`);
    const loginActivityRes = await pool.query(`SELECT COUNT(*) FROM login_activities`);

    res.json({
      activeUsers: parseInt(activeUsersRes.rows[0].count),
      totalReviewers: parseInt(reviewersRes.rows[0].count),
      pendingAssignments: parseInt(pendingAssignmentsRes.rows[0].count),
      loginActivities: parseInt(loginActivityRes.rows[0].count)
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});
// Add this route in server.js
app.post('/api/register-reviewer', async (req, res) => {
  const { full_name, username, email, password, keywords, campus } = req.body;

  try {
    // 1️⃣ Check if email already exists
    const emailCheck = await pool.query(
      'SELECT * FROM reviewers WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // 2️⃣ Check if username already exists
    const usernameCheck = await pool.query(
      'SELECT * FROM reviewers WHERE username = $1',
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // 3️⃣ Validate username constraints
    const usernameRegex = /^[A-Z][a-zA-Z0-9]{4,}$/;  // Capital first letter, no special chars, min length 5
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username must start with a capital letter, no special characters, min 5 characters' });
    }

    // If all good → insert
    await pool.query(
      `INSERT INTO reviewers (full_name, username, email, password, keywords, campus)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [full_name, username, email, password, keywords, campus]
    );

    res.status(201).json({ message: 'Reviewer registered successfully' });
  } catch (err) {
    console.error('Error registering reviewer:', err.message);
    res.status(500).json({ error: 'Server error while registering reviewer' });
  }
});


// Get all reviewers
app.get('/api/reviewers', async (req, res) => {
  try {
    const result = await pool.query('SELECT full_name, email, campus, keywords FROM reviewers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reviewers:', err.message);
    res.status(500).json({ error: 'Failed to fetch reviewers' });
  }
});

const axios = require('axios'); // <== Add at top of server.js if not already imported

// Embed function

// Match API
app.get('/api/paper-assignments', async (req, res) => {
  try {
    const papers = await pool.query('SELECT id, title, keywords FROM submissions');
    const reviewers = await pool.query('SELECT id, full_name, keywords FROM reviewers');

    let assignments = [];

    for (let paper of papers.rows) {
      const paperKeywords = paper.keywords.split(',').map(k => k.trim());

      let reviewerMatches = [];

      for (let reviewer of reviewers.rows) {
        const reviewerKeywords = reviewer.keywords.split(',').map(k => k.trim());   // correct variable name
        const similarityScore = await computeSimilarityScore(paperKeywords, reviewerKeywords);
      

        const matchScore = Math.round(similarityScore * 100);
        reviewerMatches.push({
          reviewerName: reviewer.full_name,
          matchScore: matchScore,
        });
      }

      reviewerMatches.sort((a, b) => b.matchScore - a.matchScore);

      assignments.push({
        title: paper.title,
        keywords: paper.keywords,
        reviewers: reviewerMatches.map(r => r.reviewerName).join(', '),
        matchScore: reviewerMatches.length ? reviewerMatches[0].matchScore : 0
      });
    }

    res.json(assignments);

  } catch (err) {
    console.error('Error fetching paper assignments:', err);
    res.status(500).json({ error: 'Failed to fetch paper assignments' });
  }
});
// server.js



// Endpoint for computing match scores
app.get('/api/match-scores', async (req, res) => {
  try {
    const papersResult = await pool.query('SELECT id, title, keywords FROM submissions WHERE status = $1', ['To Be Reviewed']);
    const reviewersResult = await pool.query('SELECT id, username, keywords, email FROM reviewers');

    const papers = papersResult.rows;
    const reviewers = reviewersResult.rows;

    const paperMatches = [];

    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday

    // If today is Saturday or Sunday, don't assign reviewers at all
    if (currentDay === 0 || currentDay === 6) {
      return res.json([]); // No matches on weekends
    }

    for (const paper of papers) {
      const paperKeywords = paper.keywords.split(',').map(k => k.trim());

      const matches = [];

      for (const reviewer of reviewers) {
        const reviewerKeywords = reviewer.keywords ? reviewer.keywords.split(',').map(k => k.trim()) : [];
        if (reviewerKeywords.length === 0) continue;

        // ----- Check if reviewer is on leave -----
        const leaveRes = await pool.query(
          `SELECT * FROM leave_requests 
           WHERE email = $1 AND status = 'Approved' 
           AND from_date <= $2 AND to_date >= $2`,
          [reviewer.email, today]
        );

        if (leaveRes.rows.length > 0) {
          continue; // reviewer is on leave today
        }

        // ----- Check weekly load -----
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1); // Monday
        monday.setHours(0, 0, 0, 0);

        const loadRes = await pool.query(
          `SELECT COUNT(*) FROM assignments 
           WHERE reviewer_username = $1 AND assigned_at >= $2`,
          [reviewer.username, monday]
        );

        const weeklyLoad = parseInt(loadRes.rows[0].count);
        if (weeklyLoad >= 3) {
          continue; // reviewer already has 3 papers
        }

        const similarityScore = await computeSimilarityScore(paperKeywords, reviewerKeywords);
        const matchScore = Math.round(similarityScore * 100);

        matches.push({
          reviewerId: reviewer.id,
          reviewerUsername: reviewer.username,
          matchScore: matchScore
        });
      }

      // ✅ Skip papers already assigned
      const assignmentCheck = await pool.query(
        'SELECT COUNT(*) FROM assignments WHERE paper_id = $1',
        [paper.id]
      );

      if (parseInt(assignmentCheck.rows[0].count) >= 1) {
        continue;
      }

      matches.sort((a, b) => b.matchScore - a.matchScore);

      paperMatches.push({
        paperId: paper.id,
        title: paper.title,
        matches: matches,
        alreadyAssigned: false
      });
    }

    res.json(paperMatches);

  } catch (error) {
    console.error('Error computing match scores:', error.message);
    res.status(500).json({ error: 'Error computing match scores' });
  }
});


// Helper function for computing cosine similarity using HuggingFace
const natural = require('natural');
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// Cosine similarity between two keyword sets
function computeSimilarityScore(set1, set2) {
  const tfidf = new TfIdf();

  // Normalize keywords to lowercase and trim spaces
  const normSet1 = set1.map(k => k.trim().toLowerCase());
  const normSet2 = set2.map(k => k.trim().toLowerCase());

  const doc1 = normSet1.join(' ');
  const doc2 = normSet2.join(' ');

  tfidf.addDocument(doc1);
  tfidf.addDocument(doc2);

  const vec1 = [];
  const vec2 = [];
  const allTerms = tfidf.documents[0] ? Object.keys(tfidf.documents[0]) : [];

  allTerms.forEach(term => {
    vec1.push(tfidf.tfidf(term, 0));
    vec2.push(tfidf.tfidf(term, 1));
  });

  const similarity = cosineSimilarity(vec1, vec2);
  return similarity;  // Return between 0 and 1
}



// Pure cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}


// Assign paper to reviewer
app.post('/api/assign-paper', async (req, res) => {
  const { paperId, reviewerUsername, matchScore } = req.body;


  if (!paperId || !reviewerUsername) {
    return res.status(400).json({ error: 'Paper ID and Reviewer Username are required' });
  }
    // --- Extra: Don’t allow assigning on weekends ---
    const now = new Date();
    const todayDay = now.getDay();
    if (todayDay === 0 || todayDay === 6) {
      return res.status(400).json({ error: 'Cannot assign papers on weekends' });
    }

  try {
    // --- 1. Check if already assigned ---
    const existing = await pool.query(
      'SELECT * FROM assignments WHERE paper_id = $1',
      [paperId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Paper already assigned' });
    }

    // --- 2. Check reviewer weekly load ---
    const now = new Date();
    const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    monday.setHours(0, 0, 0, 0);

    const weeklyLoadRes = await pool.query(
      `SELECT COUNT(*) FROM assignments 
       WHERE reviewer_username = $1 AND assigned_at >= $2`,
      [reviewerUsername, monday]
    );

    if (parseInt(weeklyLoadRes.rows[0].count) >= 3) {
      return res.status(400).json({ error: 'Reviewer has reached weekly load limit (3 papers)' });
    }

    // --- 3. Check for leave overlap ---
    const reviewerEmailRes = await pool.query(
      'SELECT email FROM reviewers WHERE username = $1',
      [reviewerUsername]
    );
    const reviewerEmail = reviewerEmailRes.rows[0].email;

    const today = new Date();
    const leaveRes = await pool.query(
      `SELECT * FROM leave_requests 
       WHERE email = $1 AND status = 'Approved'
       AND from_date <= $2 AND to_date >= $2`,
      [reviewerEmail, today]
    );
    

    if (leaveRes.rows.length > 0) {
      return res.status(400).json({ error: 'Reviewer is on leave during this period' });
    }

    // --- 4. All clear → Assign paper ---
// --- Compute due date (Sunday 23:59 of current week) ---
const sunday = new Date(now);
sunday.setDate(now.getDate() + (7 - now.getDay()) % 7); // Sunday
sunday.setHours(23, 59, 0, 0);  // 23:59

await pool.query(
  `INSERT INTO assignments 
   (paper_id, reviewer_username, assigned_at, match_score, due_date) 
   VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)`,
  [paperId, reviewerUsername, matchScore, sunday]
);

    

    res.status(201).json({ message: 'Reviewer assigned successfully!' });

  } catch (err) {
    console.error('Error assigning paper:', err.message);
    res.status(500).json({ error: 'Failed to assign paper' });
  }
});


// API to get assigned papers for a reviewer
// Add this to server.js
app.get('/api/reviewer-assignments/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // 1. Get assigned papers
    const papersResult = await pool.query(`
      SELECT 
        submissions.id AS paper_id, 
        submissions.title, 
        submissions.pdf_path,
        submissions.username AS authors,
        submissions.submission_date
      FROM assignments
      JOIN submissions ON assignments.paper_id = submissions.id
      WHERE assignments.reviewer_username = $1
    `, [username]);

    const papers = papersResult.rows;

    // 2. Get existing reviews by this reviewer
    const reviewsResult = await pool.query(`
      SELECT 
        paper_id, status, decision, comments
      FROM reviews
      WHERE reviewer_username = $1
    `, [username]);

    const reviews = reviewsResult.rows;

    // 3. Map reviews: { paper_id: {status, decision, comments} }
    const reviewMap = {};
    reviews.forEach(r => {
      reviewMap[r.paper_id] = {
        review_status: r.status,
        review_decision: r.decision,
        review_comments: r.comments
      };
    });

    // 4. Merge papers + review info
    const combinedData = papers.map(paper => {
      const review = reviewMap[paper.paper_id] || {};
      return {
        ...paper,
        review_status: review.review_status || 'Pending',
        review_decision: review.review_decision || '',
        review_comments: review.review_comments || '',
      };
    });

    res.json(combinedData);

  } catch (err) {
    console.error('Failed to fetch reviewer assignments:', err.message);
    res.status(500).json({ error: 'Failed to load assigned papers' });
  }
});

app.post('/api/submit-review', async (req, res) => {
  const { paperId, reviewerUsername, status, comments, reviewDecision } = req.body;

  try {
    // Check if review already exists
    const check = await pool.query(
      'SELECT id FROM reviews WHERE paper_id = $1 AND reviewer_username = $2',
      [paperId, reviewerUsername]
    );

    if (check.rows.length > 0) {
      // UPDATE existing review
      await pool.query(
        `UPDATE reviews 
         SET status = $1, comments = $2, decision = $3, reviewed_at = CURRENT_TIMESTAMP
         WHERE paper_id = $4 AND reviewer_username = $5`,
        [status, comments, reviewDecision, paperId, reviewerUsername]
      );
    } else {
      // INSERT new review
      await pool.query(
        `INSERT INTO reviews (paper_id, reviewer_username, status, comments, decision)
         VALUES ($1, $2, $3, $4, $5)`,
        [paperId, reviewerUsername, status, comments, reviewDecision]
      );
    }

    res.status(201).json({ message: 'Review submitted successfully!' });
  } catch (err) {
    console.error('Error saving review:', err.message);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Update paper submission only if no review exists

app.put('/api/submission/:id', upload.single('pdf'), async (req, res) => {
  const { id } = req.params;
  const { title, abstract, keywords, coAuthors, pdf_path } = req.body;  // ✅ pdf_path added here
  const file = req.file;

  try {
    // 1. Check if review already exists
    const reviewCheck = await pool.query('SELECT * FROM reviews WHERE paper_id = $1', [id]);

    if (reviewCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot edit after review has been submitted.' });
    }

    // 2. Handle file update or removal
    if (file) {
      // ✅ Case 1: New file uploaded
      await pool.query(
        `UPDATE submissions 
         SET title = $1, abstract = $2, keywords = $3, co_authors = $4, pdf_path = $5
         WHERE id = $6`,
        [title, abstract, keywords, coAuthors, file.path, id]
      );

    } else if (pdf_path === '') {
      // ✅ Case 2: User removed the existing file (pdf_path sent as empty string)
      await pool.query(
        `UPDATE submissions 
         SET title = $1, abstract = $2, keywords = $3, co_authors = $4, pdf_path = ''
         WHERE id = $5`,
        [title, abstract, keywords, coAuthors, id]
      );

    } else {
      // ✅ Case 3: No new file, no removal request → Keep old file
      await pool.query(
        `UPDATE submissions 
         SET title = $1, abstract = $2, keywords = $3, co_authors = $4
         WHERE id = $5`,
        [title, abstract, keywords, coAuthors, id]
      );
    }

    res.json({ message: 'Submission updated successfully' });
  } catch (err) {
    console.error('Error updating submission:', err.message);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});


app.get('/api/reviewer/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(
      'SELECT full_name, email, campus, keywords FROM reviewers WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reviewer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Reviewer fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/reviewer-assignments-by-email/:email/:full_name', async (req, res) => {
  const { email, full_name } = req.params;
  
  // Find reviewer username matching both email and full name
  const reviewerRes = await pool.query(
    'SELECT username FROM reviewers WHERE email = $1 AND full_name = $2',
    [email, full_name]
  );

  if (reviewerRes.rows.length === 0)
    return res.status(404).json({ error: 'Reviewer not found' });

  const reviewerUsername = reviewerRes.rows[0].username;

    const result = await pool.query(
      `SELECT 
          s.id AS paper_id,     -- ✅ add this line
          s.title, 
          a.assigned_at, 
          r.status AS review_status, 
          r.decision AS review_decision
       FROM assignments a
       JOIN submissions s ON a.paper_id = s.id
       LEFT JOIN reviews r ON a.paper_id = r.paper_id 
         AND r.reviewer_username = $1
       WHERE a.reviewer_username = $1
       ORDER BY a.assigned_at DESC`,
      [reviewerUsername]
  );
  

  res.json(result.rows);
});

app.get('/api/reviewer-leaves/by-username/:username', async (req, res) => {
  const username = req.params.username;
  try {
      const result = await pool.query(
          'SELECT * FROM leave_requests WHERE username = $1 ORDER BY from_date DESC',
          [username]
      );
      res.json(result.rows);
  } catch (err) {
      console.error('Error fetching leave history', err);
      res.status(500).json({ error: 'Failed to fetch leave history' });
  }
});


app.get('/api/reviewer-details/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(
      'SELECT full_name, email, campus, keywords, username FROM reviewers WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reviewer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Reviewer fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Accept Leave Request
// Accept Leave Request
app.post('/api/accept-leave', async (req, res) => {
  const { leaveId, admin_reason } = req.body;
  try {
    await pool.query(
      'UPDATE leave_requests SET status = $1, admin_reason = $2 WHERE id = $3',
      ['Approved', admin_reason, leaveId]
    );
    res.status(200).json({ message: 'Leave request accepted' });
  } catch (err) {
    console.error('Error accepting leave request', err.message);
    res.status(500).json({ error: 'Failed to accept leave request' });
  }
});

// Reject Leave Request
app.post('/api/reject-leave', async (req, res) => {
  const { leaveId, admin_reason } = req.body;
  try {
    await pool.query(
      'UPDATE leave_requests SET status = $1, admin_reason = $2 WHERE id = $3',
      ['Rejected', admin_reason, leaveId]
    );
    res.status(200).json({ message: 'Leave request rejected' });
  } catch (err) {
    console.error('Error rejecting leave request', err.message);
    res.status(500).json({ error: 'Failed to reject leave request' });
  }
});



app.get('/api/all-paper-status', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id AS paper_id, 
        s.title, 
        a.reviewer_username, 
        a.match_score,
        r.status, 
        r.decision 
      FROM submissions s
      LEFT JOIN assignments a ON s.id = a.paper_id
      LEFT JOIN reviews r ON s.id = r.paper_id
      ORDER BY s.id DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching paper statuses:', err.message);
    res.status(500).json({ error: 'Failed to fetch paper statuses' });
  }
});

app.post('/api/submit-leave-request', async (req, res) => {
  const { reviewerEmail, fromDate, toDate, reason } = req.body;
  const overlapCheck = await pool.query(
    `SELECT * FROM leave_requests 
     WHERE email = $1 
     AND (from_date, to_date) OVERLAPS ($2, $3)`,
    [reviewerEmail, fromDate, toDate]
  );
  
  if (overlapCheck.rows.length > 0) {
    return res.status(400).json({ error: 'Overlapping leave request already exists' });
  }
  
  try {
    // 🔥 Verify reviewer exists with this email
    const reviewer = await pool.query(
      'SELECT email FROM reviewers WHERE email = $1',
      [reviewerEmail]
    );

    if (reviewer.rows.length === 0) {
      return res.status(404).json({ error: 'Reviewer not found' });
    }

    const email = reviewer.rows[0].email;

    // Insert leave request
    await pool.query(
      `INSERT INTO leave_requests (email, username, from_date, to_date, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'Pending', NOW())`,
      [reviewerEmail, username, fromDate, toDate, reason]
    );
    

    res.json({ message: 'Leave request submitted successfully' });

  } catch (err) {
    console.error('Error submitting leave request:', err.message);
    res.status(500).json({ error: 'Failed to submit leave request' });
  }
});

app.get('/api/all-leave-requests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leave_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leave requests:', err.message);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

app.get('/api/reviewer-details/by-username/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query(
      'SELECT full_name, email, campus, keywords, username FROM reviewers WHERE username = $1',
      [username]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reviewer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Reviewer fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/reviewer-history/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        s.id AS paper_id, 
        s.title, 
        s.username AS authors, 
        s.submission_date, 
        r.status AS review_status, 
        r.decision AS review_decision, 
        r.comments AS review_comments 
      FROM reviews r
      JOIN submissions s ON r.paper_id = s.id 
      WHERE r.reviewer_username = $1
      ORDER BY s.submission_date DESC`,
      [username]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching review history:', err.message);
    res.status(500).json({ error: 'Failed to fetch review history' });
  }
});


