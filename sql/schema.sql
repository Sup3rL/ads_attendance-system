-- Drop tables if they already exist to allow easy resetting
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;
DROP TABLE IF EXISTS face_descriptors CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS lecturers CASCADE;

-- 1. Lecturers Table
CREATE TABLE lecturers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) UNIQUE NOT NULL, -- Nomor Induk Mahasiswa (Student ID)
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Face Descriptors Table
CREATE TABLE face_descriptors (
    id SERIAL PRIMARY KEY,
    student_id INT UNIQUE NOT NULL,
    descriptor JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 4. Attendance Sessions Table
CREATE TABLE attendance_sessions (
    id SERIAL PRIMARY KEY,
    lecturer_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- Can be 'active' or 'closed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE
);

-- 5. Attendance Records Table
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_record_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    -- Prevent duplicate attendance for the same student in the same session
    CONSTRAINT unique_attendance UNIQUE(session_id, student_id) 
);

-- Indexes for performance
CREATE INDEX idx_descriptor_student_id ON face_descriptors(student_id);
CREATE INDEX idx_session_lecturer_id ON attendance_sessions(lecturer_id);
CREATE INDEX idx_record_session_id ON attendance_records(session_id);