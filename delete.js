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

// Delete a resume by ID
router.delete("/resume/:id", (req, res) => {
  const resumeId = req.params.id;

  // Delete resume data from the database
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database");
      return res.status(500).json({ error: "Database error" });
    }

    // Delete the resume from the 'resumes' table
    const deleteResumeSql = "DELETE FROM resumes WHERE id = ?";
    const deleteResumeValues = [resumeId];

    connection.query(
      deleteResumeSql,
      deleteResumeValues,
      (err, deleteResult) => {
        connection.release();

        if (err) {
          console.error("Error executing the SQL query");
          return res.status(500).json({ error: "Database error" });
        }

        // Handle other deletions, such as degrees, experiences, and skills, if needed

        return res.json({ success: true });
      }
    );
  });
});

module.exports = router;
