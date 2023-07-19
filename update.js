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

// Update a resume by ID
router.put("/resume/:id", (req, res) => {
  const resumeId = req.params.id;
  const resumeData = req.body;

  // Process the resumeData as needed before updating

  // Update resume data in the database
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database");
      return res.status(500).json({ error: "Database error" });
    }

    // Update the 'resumes' table
    const updateResumeSql =
      "UPDATE resumes SET name = ?, email = ? WHERE id = ?";
    const updateResumeValues = [resumeData.name, resumeData.email, resumeId];

    connection.query(
      updateResumeSql,
      updateResumeValues,
      (err, updateResult) => {
        connection.release();

        if (err) {
          console.error("Error executing the SQL query");
          return res.status(500).json({ error: "Database error" });
        }

        // Handle other updates, such as degrees, experiences, and skills, if needed

        return res.json({ success: true });
      }
    );
  });
});

module.exports = router;
