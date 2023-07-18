const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql");

const app = express();
const port = 3008;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory to save the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Parse JSON body
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Serve static files from the "uploads" directory
app.use(express.static(path.join(__dirname, "uploads")));

// MySQL database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "resume_form",
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Handle GET request to serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle POST request to /submit
app.post("/submit", upload.single("profileImage"), (req, res) => {
  // Access the submitted resume data
  const resumeData = req.body;
  const profileImage = req.file;

  // Process the resume data and profile image as needed
  // ...

  // Insert resume data into the MySQL database
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database");
      throw err;
    }

    // Insert the resume data into the 'resumes' table
    const resumeSql =
      "INSERT INTO resumes (name, email, profile_image) VALUES (?, ?, ?)";
    const resumeValues = [
      resumeData.name,
      resumeData.email,
      profileImage.filename,
    ];

    connection.query(resumeSql, resumeValues, (err, resumeResult) => {
      if (err) {
        connection.release();
        console.error("Error executing the SQL query");
        throw err;
      }

      // Retrieve the inserted resume ID
      const resumeId = resumeResult.insertId;

      // Insert the degrees data into the 'degrees' table
      if (resumeData.degrees && Array.isArray(resumeData.degrees)) {
        const degrees = resumeData.degrees.map((degree) => [
          resumeId,
          degree.degree,
          degree.university,
        ]);
        // degreesSql.shift();
        console.log(degrees);
        const degreesSql =
          "INSERT INTO degrees (resume_id, degree, university) VALUES ?";

        connection.query(degreesSql, [degrees], (err, degreesResult) => {
          if (err) {
            connection.release();
            console.error("Error executing the SQL query");
            throw err;
          }

          // Insert the experiences data into the 'experiences' table
          if (resumeData.experiences && Array.isArray(resumeData.experiences)) {
            const experiences = resumeData.experiences.map((experience) => [
              resumeId,
              experience.company,
              experience.position,
            ]);
            const experiencesSql =
              "INSERT INTO experiences (resume_id, company, position) VALUES ?";

            connection.query(
              experiencesSql,
              [experiences],
              (err, experiencesResult) => {
                if (err) {
                  connection.release();
                  console.error("Error executing the SQL query");
                  throw err;
                }

                // Insert the skills data into the 'skills' table
                if (resumeData.skills && Array.isArray(resumeData.skills)) {
                  const skills = resumeData.skills.map((skill) => [
                    resumeId,
                    skill,
                  ]);
                  const skillsSql =
                    "INSERT INTO skills (resume_id, skill) VALUES ?";

                  connection.query(skillsSql, [skills], (err, skillsResult) => {
                    connection.release();
                    if (err) {
                      console.error("Error executing the SQL query");
                      throw err;
                    }

                    // Handle other database operations as needed

                    // Send a response back to the client
                    res.send("Resume submitted successfully!");
                  });
                } else {
                  connection.release();
                  // Send a response back to the client
                  res.send("Resume submitted successfully!");
                }
              }
            );
          } else {
            connection.release();
            // Send a response back to the client
            res.send("Resume submitted successfully!");
          }
        });
      } else {
        connection.release();
        // Send a response back to the client
        res.send("Resume submitted successfully!");
      }
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
