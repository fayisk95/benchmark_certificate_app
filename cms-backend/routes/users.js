const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      whereClause += ' AND role = ?';
      queryParams.push(role);
    }

    if (status !== '') {
      whereClause += ' AND is_active = ?';
      queryParams.push(status === 'active' ? 1 : 0);
    }

    // Get total count
    const [countRows] = await db.execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );
    const total = countRows[0].total;

    // Get users with pagination
    const [rows] = await db.execute(
      `SELECT id, name, email, role, is_active, created_at, updated_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    res.json({
      users: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: rows[0] });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', authenticateToken, requirePermission('manage-users'), validate(userSchemas.create), async (req, res) => {
  try {
    const { name, email, password, role, is_active } = req.validatedData;

    // Check if email already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, is_active]
    );

    // Get created user
    const [rows] = await db.execute(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: rows[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticateToken, requirePermission('manage-users'), validate(userSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;

    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    if (updateData.email) {
      const [emailCheck] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [updateData.email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);

    await db.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [rows] = await db.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User updated successfully',
      user: rows[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has associated batches or certificates
    const [batches] = await db.execute(
      'SELECT COUNT(*) as count FROM batches WHERE instructor_id = ?',
      [id]
    );

    if (batches[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with associated batches. Please reassign batches first.' 
      });
    }

    // Delete user
    await db.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Toggle user status
router.patch('/:id/toggle-status', authenticateToken, requirePermission('manage-users'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deactivating own account
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    // Get current status
    const [rows] = await db.execute(
      'SELECT is_active FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = !rows[0].is_active;

    // Update status
    await db.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// Get instructors only
router.get('/instructors/list', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email FROM users WHERE role = ? AND is_active = 1 ORDER BY name',
      ['Instructor']
    );

    res.json({ instructors: rows });

  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
});

module.exports = router;