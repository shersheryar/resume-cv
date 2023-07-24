const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql");

const app = express();
const port = 3006;
const updateRoute = require("./update");
const deleteRoute = require("./delete");
const viewRoute = require("./view");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
// Serve static files from the "public" directory

// Use the route files for respective APIs
app.use("/", updateRoute);
app.use("/", deleteRoute);
app.use("/", viewRoute);

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
app.get("/resumes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "resumes.html"));
});
app.get("/resumeViews", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "frontPage.html"));
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

////-------------------------------------------get Data------------------------------------
// Handle GET request to fetch all resumes
app.get("/resumess", (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database");
      throw err;
    }

    // Query to fetch all resumes from the 'resumes' table
    const selectResumesSql = "SELECT * FROM resumes";

    // Execute the SQL query
    connection.query(selectResumesSql, (err, resumes) => {
      // Release the connection back to the pool
      connection.release();

      if (err) {
        console.error("Error executing the SQL query");
        throw err;
      }

      // Send the resumes data as the response
      res.send(resumes);
      // console.log(resumes);
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
