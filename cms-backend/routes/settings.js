const express = require('express');
const db = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get all settings
router.get('/', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT setting_key, setting_value, description, updated_at FROM settings ORDER BY setting_key'
    );

    // Convert to key-value object for easier frontend consumption
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = {
        value: row.setting_value,
        description: row.description,
        updated_at: row.updated_at
      };
    });

    res.json({ settings });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get specific setting
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;

    const [rows] = await db.execute(
      'SELECT setting_key, setting_value, description, updated_at FROM settings WHERE setting_key = ?',
      [key]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ setting: rows[0] });

  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Update settings
router.put('/', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    // Validate settings
    const validSettings = [
      'certificate_number_format',
      'certificate_start_number',
      'batch_number_format',
      'batch_start_number',
      'expiry_warning_days',
      'notification_email'
    ];

    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      if (!validSettings.includes(key)) {
        return res.status(400).json({ error: `Invalid setting key: ${key}` });
      }

      // Validate specific settings
      if (key === 'certificate_start_number' || key === 'batch_start_number' || key === 'expiry_warning_days') {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1) {
          return res.status(400).json({ error: `${key} must be a positive number` });
        }
      }

      if (key === 'notification_email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return res.status(400).json({ error: 'Invalid email format for notification_email' });
        }
      }

      updates.push([key, value.toString()]);
    }

    // Update settings in database
    for (const [key, value] of updates) {
      await db.execute(
        `INSERT INTO settings (setting_key, setting_value, updated_at) 
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value), 
         updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      );
    }

    // Get updated settings
    const [rows] = await db.execute(
      'SELECT setting_key, setting_value, description, updated_at FROM settings ORDER BY setting_key'
    );

    const updatedSettings = {};
    rows.forEach(row => {
      updatedSettings[row.setting_key] = {
        value: row.setting_value,
        description: row.description,
        updated_at: row.updated_at
      };
    });

    res.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Reset settings to defaults
router.post('/reset', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const defaultSettings = [
      ['certificate_number_format', 'FS-{YYYY}-{####}', 'Format for certificate numbers'],
      ['certificate_start_number', '1', 'Starting number for certificates'],
      ['batch_number_format', 'BTH-{YYYY}-{###}', 'Format for batch numbers'],
      ['batch_start_number', '1', 'Starting number for batches'],
      ['expiry_warning_days', '30', 'Days before expiry to show warning'],
      ['notification_email', 'admin@cms.com', 'Email for notifications']
    ];

    // Clear existing settings
    await db.execute('DELETE FROM settings');

    // Insert default settings
    for (const [key, value, description] of defaultSettings) {
      await db.execute(
        'INSERT INTO settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
        [key, value, description]
      );
    }

    // Get reset settings
    const [rows] = await db.execute(
      'SELECT setting_key, setting_value, description, updated_at FROM settings ORDER BY setting_key'
    );

    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = {
        value: row.setting_value,
        description: row.description,
        updated_at: row.updated_at
      };
    });

    res.json({
      message: 'Settings reset to defaults successfully',
      settings
    });

  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

// Get role permissions
router.get('/permissions/roles', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT role, permission FROM role_permissions ORDER BY role, permission'
    );

    // Group permissions by role
    const rolePermissions = {};
    rows.forEach(row => {
      if (!rolePermissions[row.role]) {
        rolePermissions[row.role] = [];
      }
      rolePermissions[row.role].push(row.permission);
    });

    res.json({ rolePermissions });

  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
});

// Update role permissions
router.put('/permissions/roles', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const { rolePermissions } = req.body;

    if (!rolePermissions || typeof rolePermissions !== 'object') {
      return res.status(400).json({ error: 'Role permissions object is required' });
    }

    const validRoles = ['Admin', 'Supervisor', 'Instructor', 'Staff'];
    const validPermissions = [
      'manage-users',
      'manage-batches',
      'issue-certificates',
      'view-reports',
      'manual-number-entry',
      'dashboard-access',
      'manage-groups'
    ];

    // Validate input
    for (const [role, permissions] of Object.entries(rolePermissions)) {
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role: ${role}` });
      }

      if (!Array.isArray(permissions)) {
        return res.status(400).json({ error: `Permissions for ${role} must be an array` });
      }

      for (const permission of permissions) {
        if (!validPermissions.includes(permission)) {
          return res.status(400).json({ error: `Invalid permission: ${permission}` });
        }
      }
    }

    // Clear existing permissions
    await db.execute('DELETE FROM role_permissions');

    // Insert new permissions
    for (const [role, permissions] of Object.entries(rolePermissions)) {
      for (const permission of permissions) {
        await db.execute(
          'INSERT INTO role_permissions (role, permission) VALUES (?, ?)',
          [role, permission]
        );
      }
    }

    // Get updated permissions
    const [rows] = await db.execute(
      'SELECT role, permission FROM role_permissions ORDER BY role, permission'
    );

    const updatedRolePermissions = {};
    rows.forEach(row => {
      if (!updatedRolePermissions[row.role]) {
        updatedRolePermissions[row.role] = [];
      }
      updatedRolePermissions[row.role].push(row.permission);
    });

    res.json({
      message: 'Role permissions updated successfully',
      rolePermissions: updatedRolePermissions
    });

  } catch (error) {
    console.error('Update role permissions error:', error);
    res.status(500).json({ error: 'Failed to update role permissions' });
  }
});

// Reset role permissions to defaults
router.post('/permissions/reset', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const defaultPermissions = [
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
      ['Staff', 'dashboard-access'],

      // Group management permissions (add to existing roles as needed)
      ['Admin', 'manage-groups'],
      ['Supervisor', 'manage-groups']
    ];

    // Clear existing permissions
    await db.execute('DELETE FROM role_permissions');

    // Insert default permissions
    for (const [role, permission] of defaultPermissions) {
      await db.execute(
        'INSERT INTO role_permissions (role, permission) VALUES (?, ?)',
        [role, permission]
      );
    }

    // Get reset permissions
    const [rows] = await db.execute(
      'SELECT role, permission FROM role_permissions ORDER BY role, permission'
    );

    const rolePermissions = {};
    rows.forEach(row => {
      if (!rolePermissions[row.role]) {
        rolePermissions[row.role] = [];
      }
      rolePermissions[row.role].push(row.permission);
    });

    res.json({
      message: 'Role permissions reset to defaults successfully',
      rolePermissions
    });

  } catch (error) {
    console.error('Reset role permissions error:', error);
    res.status(500).json({ error: 'Failed to reset role permissions' });
  }
});

module.exports = router;