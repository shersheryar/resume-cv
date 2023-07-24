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
const pool = mysql.createPool(dbConfig);
let resumeId;

router.post("/view/:id", (req, res) => {
  resumeId = req.params.id.slice(3);

  // return res.send("data submitted successfully..", resumeId);
  console.log("view:", resumeId);
});

// ==================================================================
// Create a MySQL connection pool
// Get a resume by ID
router.get("/resumeView/", (req, res) => {
  // resumeId = req.params.id.slice(3);

  console.log("view:", resumeId);
  // Fetch resume data from the database
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database");
      return res.status(500).json({ error: "Database error" });
    }

    // Query to fetch the resume from the 'resumes' table
    const selectResumeSql = "SELECT * FROM resumes WHERE id = ?";
    const selectResumeValues = resumeId;

    connection.query(selectResumeSql, selectResumeValues, (err, resume) => {
      if (err) {
        connection.release();

        console.error("Error executing the SQL query");
        return res.status(500).json({ error: "Database error" });
      }
      // console.log("result......:", resume);
      //   console.log(resume);
      if (resume.length === 0) {
        connection.release();
        return res.status(404).json({ error: "Resume not found" });
      }

      const resumeData = {
        id: resume[0].id,
        name: resume[0].name,
        email: resume[0].email,
        image: resume[0].profile_image,
      };
      //   console.log(resumeData);
      // Fetch education data from the 'education' table
      const selectEducationSql = "SELECT * FROM degrees WHERE resume_id = ?";
      connection.query(
        selectEducationSql,
        selectResumeValues,
        (err, education) => {
          if (err) {
            connection.release();
            console.error("Error executing the SQL query");
            return res.status(500).json({ error: "Database error" });
          }
          // console.log("education:", selectResumeValues);
          resumeData.education = education;
          //   console.log(resumeData);
          // Fetch experience data from the 'experience' table
          const selectExperienceSql =
            "SELECT * FROM experiences   WHERE resume_id = ?";
          connection.query(
            selectExperienceSql,
            selectResumeValues,
            (err, experience) => {
              if (err) {
                connection.release();
                console.error("Error executing the SQL query");
                return res.status(500).json({ error: "Database error" });
              }

              resumeData.experience = experience;

              // Fetch skills data from the 'skills' table
              const selectSkillsSql =
                "SELECT * FROM skills WHERE resume_id = ?";
              connection.query(
                selectSkillsSql,
                selectResumeValues,
                (err, skills) => {
                  connection.release();

                  if (err) {
                    console.error("Error executing the SQL query");
                    return res.status(500).json({ error: "Database error" });
                  }

                  resumeData.skills = skills;

                  // Return the resume data to the frontend
                  console.log(resumeData);
                  return res.json(resumeData);
                }
              );
            }
          );
        }
      );
    });
  });
});

module.exports = router;
