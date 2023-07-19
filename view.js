const express = require("express");
const router = express.Router();
const mysql = require("mysql");

// MySQL database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "resume_form",
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Get a resume by ID
router.get("/resume/:id", (req, res) => {
  const resumeId = req.params.id;

  // Fetch resume data from the database
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database");
      return res.status(500).json({ error: "Database error" });
    }

    // Query to fetch the resume from the 'resumes' table
    const selectResumeSql = "SELECT * FROM resumes WHERE id = ?";
    const selectResumeValues = [resumeId];

    connection.query(selectResumeSql, selectResumeValues, (err, resume) => {
      connection.release();

      if (err) {
        console.error("Error executing the SQL query");
        return res.status(500).json({ error: "Database error" });
      }

      if (resume.length === 0) {
        return res.status(404).json({ error: "Resume not found" });
      }

      // Fetch other related data (degrees, experiences, skills) if needed
      // ...

      return res.json(resume[0]);
    });
  });
});

module.exports = router;
