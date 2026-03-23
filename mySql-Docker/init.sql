CREATE DATABASE IF NOT EXISTS articulo140;
USE articulo140;

CREATE TABLE degrees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    faculty VARCHAR(100) NOT NULL,
    isDisabled ENUM('true', 'false') NOT NULL DEFAULT 'false',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO degrees (code, name, faculty) VALUES
('IS001', 'Ingenieria en Sistemas', 'Facultad de Ingenieria');


CREATE TABLE users (
    id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    accountNumber BIGINT,
    identityNumber VARCHAR(20),
    role ENUM('admin', 'student', 'supervisor') NOT NULL,
    degreeId INT NOT NULL DEFAULT 1,
    isDeleted ENUM('true', 'false') NOT NULL DEFAULT 'false',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD CONSTRAINT pk_users PRIMARY KEY (id);

ALTER TABLE users
ADD CONSTRAINT fk_users_degree FOREIGN KEY (degreeId) REFERENCES degrees(id);

ALTER TABLE users
ADD CONSTRAINT uq_email UNIQUE (email);

ALTER TABLE users
ADD CONSTRAINT uq_accountNumber UNIQUE (accountNumber);

ALTER TABLE users
ADD CONSTRAINT uq_identityNumber UNIQUE (identityNumber);

CREATE TABLE activities (
    id CHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    degreeId INT NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME,
    voaeHours INT NOT NULL,
    availableSpots INT NOT NULL,
    supervisorId CHAR(36) NOT NULL,
    status ENUM('pending', 'inProgress', 'finished', 'submittedToSudecad', 'approvedBySudecad','external') NOT NULL DEFAULT 'pending',
    isDisabled ENUM('true', 'false') NOT NULL DEFAULT 'false',
    isDeleted ENUM('true', 'false') NOT NULL DEFAULT 'false',
    access ENUM('all', 'restricted') NOT NULL DEFAULT 'all',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE activities
ADD CONSTRAINT pk_activities PRIMARY KEY (id);

ALTER TABLE activities
ADD CONSTRAINT fk_activities_supervisor FOREIGN KEY (supervisorId) REFERENCES users(id);

ALTER TABLE activities
ADD CONSTRAINT fk_activities_degree FOREIGN KEY (degreeId) REFERENCES degrees(id);

CREATE TABLE activityScopes (
    activityId CHAR(36) NOT NULL,
    scope ENUM('cultural', 'cientificoAcademico', 'deportivo', 'social') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE activityScopes
ADD CONSTRAINT pk_activityScopes PRIMARY KEY (activityId, scope);

ALTER TABLE activityScopes
ADD CONSTRAINT fk_activityScopes_activity FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE;

CREATE TABLE registrations (
    studentId CHAR(36) NOT NULL,
    activityId CHAR(36) NOT NULL,
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE registrations
ADD CONSTRAINT pk_registrations PRIMARY KEY (studentId, activityId);

ALTER TABLE registrations
ADD CONSTRAINT fk_registrations_activity FOREIGN KEY (activityId) REFERENCES activities(id);

ALTER TABLE registrations
ADD CONSTRAINT fk_registrations_student FOREIGN KEY (studentId) REFERENCES users(id);

CREATE TABLE attendances (
    id CHAR(36) NOT NULL,
    studentId CHAR(36) NOT NULL,
    activityId CHAR(36) NOT NULL,
    entryTime DATETIME NOT NULL,
    exitTime DATETIME,
    observations TEXT,
    hoursAwarded INT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
 
ALTER TABLE attendances
ADD CONSTRAINT pk_attendances PRIMARY KEY (id);

ALTER TABLE attendances
ADD CONSTRAINT uq_attendances_student_activity UNIQUE (studentId, activityId);

ALTER TABLE attendances
ADD CONSTRAINT fk_attendances_registration FOREIGN KEY (studentId, activityId) REFERENCES registrations(studentId, activityId);

CREATE TABLE files (
    id CHAR(36) NOT NULL,
    activityId CHAR(36) NOT NULL,
    fileName VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    fileType VARCHAR(50),
    fileSize BIGINT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE files
ADD CONSTRAINT pk_files PRIMARY KEY (id);

ALTER TABLE files
ADD CONSTRAINT fk_files_activity FOREIGN KEY (activityId) REFERENCES activities(id);

create table about_sections (
  id            INT PRIMARY KEY DEFAULT 1,
  carousel      BOOLEAN DEFAULT TRUE,
  mision_vision BOOLEAN DEFAULT TRUE,
  competencies  BOOLEAN DEFAULT TRUE,
  goals     BOOLEAN DEFAULT TRUE,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO about_sections (id) VALUES (1);

create table about_posts(
  id          VARCHAR(36)  PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  content     varchar(200)         NOT NULL,
  image_url   VARCHAR(500) NULL,
  category    ENUM('VOAE', 'Academico', 'General', 'Convocatoria') NOT NULL DEFAULT 'General',
  is_pinned   BOOLEAN      DEFAULT FALSE,
  is_visible  BOOLEAN      DEFAULT TRUE,
  event_date  DATETIME     NULL,        
  event_place VARCHAR(255) NULL,        
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


create table about_post_views (
  id         VARCHAR(36) PRIMARY KEY,
  post_id    VARCHAR(36) NOT NULL,
  viewer_key VARCHAR(36) NOT NULL,  
  viewed_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES about_posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_view (post_id, viewer_key) 
);


