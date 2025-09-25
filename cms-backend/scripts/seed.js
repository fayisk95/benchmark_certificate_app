const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    await db.execute('TRUNCATE TABLE certificate_attachments');
    await db.execute('TRUNCATE TABLE certificates');
    await db.execute('TRUNCATE TABLE batches');
    await db.execute('TRUNCATE TABLE users');
    await db.execute('TRUNCATE TABLE settings');
    await db.execute('TRUNCATE TABLE role_permissions');
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Seed users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      ['System Admin', 'admin@cms.com', hashedPassword, 'Admin', true],
      ['John Supervisor', 'supervisor@cms.com', hashedPassword, 'Supervisor', true],
      ['Jane Instructor', 'instructor@cms.com', hashedPassword, 'Instructor', true],
      ['Mike Staff', 'staff@cms.com', hashedPassword, 'Staff', true],
      ['Sarah Wilson', 'sarah.wilson@cms.com', hashedPassword, 'Instructor', true]
    ];

    for (const user of users) {
      await db.execute(
        'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
        user
      );
    }
    console.log('✅ Users seeded');

    // Seed batches
    const batches = [
      ['BTH-2024-001', 'ABC Construction Ltd', 'John Smith', 25, 'Onsite', 'Fire & Safety', '2024-01-15', '2024-01-17', 3, 'Fire safety training for construction workers', JSON.stringify(['FS-2024-001', 'FS-2024-002', 'FS-2024-003'])],
      ['BTH-2024-002', 'Marine Services Co', 'Sarah Johnson', 15, 'Hybrid', 'Water Safety', '2024-02-01', '2024-02-03', 5, 'Water safety training for marine workers', JSON.stringify(['WS-2024-001', 'WS-2024-002'])],
      ['BTH-2024-003', 'Tech Solutions Inc', 'Mike Davis', 30, 'Online', 'Fire & Safety', '2024-03-01', '2024-03-05', 3, 'Online fire safety training', JSON.stringify(['FS-2024-004', 'FS-2024-005'])]
    ];

    for (const batch of batches) {
      await db.execute(
        'INSERT INTO batches (batch_number, company_name, referred_by, number_of_participants, batch_type, certificate_type, start_date, end_date, instructor_id, description, reserved_cert_numbers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        batch
      );
    }
    console.log('✅ Batches seeded');

    // Seed certificates
    const certificates = [
      ['FS-2024-001', 1, 'Ahmed Al Mansouri', 'UAE', '784-1234-1234567-1', 'ABC Construction Ltd', 'Fire Safety Training', '2024-01-15', '2024-01-17', '2025-01-17', 'Active'],
      ['FS-2024-002', 1, 'Mohammed Hassan', 'UAE', '784-1234-1234567-2', 'ABC Construction Ltd', 'Fire Safety Training', '2024-01-15', '2024-01-17', '2025-01-17', 'Active'],
      ['WS-2024-001', 2, 'John Smith', 'UK', 'DL-12345678', 'Marine Services Co', 'Water Safety Training', '2024-02-01', '2024-02-03', '2024-03-03', 'Expiring Soon'],
      ['WS-2024-002', 2, 'David Wilson', 'USA', 'DL-87654321', 'Marine Services Co', 'Water Safety Training', '2024-02-01', '2024-02-03', '2023-12-03', 'Expired'],
      ['FS-2024-004', 3, 'Lisa Chen', 'Singapore', 'SG-123456789', 'Tech Solutions Inc', 'Fire Safety Training', '2024-03-01', '2024-03-05', '2025-03-05', 'Active']
    ];

    for (const certificate of certificates) {
      await db.execute(
        'INSERT INTO certificates (certificate_number, batch_id, name, nationality, eid_license, employer, training_name, training_date, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        certificate
      );
    }
    console.log('✅ Certificates seeded');

    // Seed settings
    const settings = [
      ['certificate_number_format', 'FS-{YYYY}-{####}', 'Format for certificate numbers'],
      ['certificate_start_number', '1', 'Starting number for certificates'],
      ['batch_number_format', 'BTH-{YYYY}-{###}', 'Format for batch numbers'],
      ['batch_start_number', '1', 'Starting number for batches'],
      ['expiry_warning_days', '30', 'Days before expiry to show warning'],
      ['notification_email', 'admin@cms.com', 'Email for notifications']
    ];

    for (const setting of settings) {
      await db.execute(
        'INSERT INTO settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
        setting
      );
    }
    console.log('✅ Settings seeded');

    // Seed role permissions
    const rolePermissions = [
      // Admin permissions
      ['Admin', 'manage-users'],
      ['Admin', 'manage-batches'],
      ['Admin', 'issue-certificates'],
      ['Admin', 'view-reports'],
      ['Admin', 'manual-number-entry'],
      ['Admin', 'dashboard-access'],
      
      // Supervisor permissions
      ['Supervisor', 'manage-batches'],
      ['Supervisor', 'issue-certificates'],
      ['Supervisor', 'view-reports'],
      ['Supervisor', 'manual-number-entry'],
      ['Supervisor', 'dashboard-access'],
      
      // Instructor permissions
      ['Instructor', 'manage-batches'],
      ['Instructor', 'issue-certificates'],
      ['Instructor', 'dashboard-access'],
      
      // Staff permissions
      ['Staff', 'issue-certificates'],
      ['Staff', 'dashboard-access']
    ];

    for (const [role, permission] of rolePermissions) {
      await db.execute(
        'INSERT INTO role_permissions (role, permission) VALUES (?, ?)',
        [role, permission]
      );
    }
    console.log('✅ Role permissions seeded');

    // Seed groups
    const groups = [
      ['FIRE_BASIC', 'FIRE_SAFETY', 'Basic Fire Safety', 'Basic fire safety training and certification'],
      ['FIRE_ADV', 'FIRE_SAFETY', 'Advanced Fire Safety', 'Advanced fire safety training for supervisors'],
      ['WATER_BASIC', 'WATER_SAFETY', 'Basic Water Safety', 'Basic water safety and rescue training'],
      ['WATER_ADV', 'WATER_SAFETY', 'Advanced Water Safety', 'Advanced water safety for marine professionals'],
      ['FIRST_AID', 'MEDICAL', 'First Aid Training', 'Basic first aid and CPR certification'],
      ['SAFETY_OFFICER', 'SAFETY', 'Safety Officer Training', 'Comprehensive safety officer certification'],
      ['CONFINED_SPACE', 'SAFETY', 'Confined Space Entry', 'Confined space entry and rescue procedures'],
      ['HEIGHT_SAFETY', 'SAFETY', 'Working at Heights', 'Safety procedures for working at elevated positions']
    ];
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    process.exit(0);
  }
}

    for (const group of groups) {
      await db.execute(
        'INSERT INTO groups (code_name, group_code, group_name, description) VALUES (?, ?, ?, ?)',
        group
      );
    }
    console.log('✅ Groups seeded');

seedDatabase();