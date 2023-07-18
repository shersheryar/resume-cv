CREATE DATABASE resume_form;
USE resume_form;
CREATE TABLE resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255) NOT NULL
);
CREATE TABLE degrees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    degree VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
);
CREATE TABLE experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
);
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    skill VARCHAR(255) NOT NULL,
    FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
);
ALTER TABLE resumes
MODIFY COLUMN profile_image VARCHAR(255) NOT NULL DEFAULT '';