const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'cms_database'}`);
    console.log('✅ Database created successfully');
    
    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'cms_database'}`);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'Supervisor', 'Instructor', 'Staff') NOT NULL DEFAULT 'Staff',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create batches table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS batches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        batch_number VARCHAR(50) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        referred_by VARCHAR(255) NOT NULL,
        number_of_participants INT NOT NULL,
        batch_type ENUM('Onsite', 'Hybrid', 'Online') NOT NULL,
        certificate_type ENUM('Fire & Safety', 'Water Safety') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        instructor_id INT,
        description TEXT,
        reserved_cert_numbers JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Batches table created');

    // Create certificates table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        certificate_number VARCHAR(100) UNIQUE NOT NULL,
        batch_id INT,
        name VARCHAR(255) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        eid_license VARCHAR(100) NOT NULL,
        employer VARCHAR(255) NOT NULL,
        training_name VARCHAR(255) NOT NULL,
        training_date DATE NOT NULL,
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('Active', 'Expired', 'Expiring Soon') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Certificates table created');

    // Create certificate_attachments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS certificate_attachments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        certificate_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type ENUM('EID', 'Driving License', 'Signed Certificate') NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Certificate attachments table created');

    // Create settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Settings table created');

    // Create role_permissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role ENUM('Admin', 'Supervisor', 'Instructor', 'Staff') NOT NULL,
        permission VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_role_permission (role, permission)
      )
    `);
    console.log('✅ Role permissions table created');

    console.log('🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

createDatabase();