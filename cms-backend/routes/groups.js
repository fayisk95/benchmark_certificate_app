const express = require('express');
const db = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validate, groupSchemas } = require('../middleware/validation');

const router = express.Router();

// Get all groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', group_code = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (search) {
      whereClause += ' AND (code_name LIKE ? OR group_name LIKE ? OR description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (group_code) {
      whereClause += ' AND group_code = ?';
      queryParams.push(group_code);
    }

    // Get total count
    const [countRows] = await db.execute(
      `SELECT COUNT(*) as total FROM miscellaneous ${whereClause}`,
      queryParams
    );
    const total = countRows[0].total;

    // Get groups with pagination
    const [rows] = await db.execute(
      `SELECT id, code, code_name, group_code, group_name, description, created_at, updated_at 
       FROM miscellaneous ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ${limit} OFFSET ${offset}`,
      [...queryParams]
    );

    res.json({
      groups: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get group by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      'SELECT id, code, code_name, group_code, group_name, description, created_at, updated_at FROM miscellaneous WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ group: rows[0] });

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create new group
router.post('/', authenticateToken, requirePermission('manage-groups'), validate(groupSchemas.create), async (req, res) => {
  try {
    const { code, code_name, group_code, group_name, description } = req.validatedData;

    // Check if code_name already exists
    const [existingGroups] = await db.execute(
      'SELECT id FROM miscellaneous WHERE code = ?',
      [code]
    );

    if (existingGroups.length > 0) {
      return res.status(400).json({ error: 'Code name already exists' });
    }

    // Insert group
    const [result] = await db.execute(
      'INSERT INTO miscellaneous (code, code_name, group_code, group_name, description) VALUES (?,?, ?, ?, ?)',
      [code, code_name, group_code, group_name, description || null]
    );

    // Get created group
    const [rows] = await db.execute(
      'SELECT id, code,code_name, group_code, group_name, description, created_at, updated_at FROM miscellaneous WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Group created successfully',
      group: rows[0]
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group
router.put('/:id', authenticateToken, requirePermission('manage-groups'), validate(groupSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;

    // Check if group exists
    const [existingGroups] = await db.execute(
      'SELECT id FROM miscellaneous WHERE id = ?',
      [id]
    );

    if (existingGroups.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if code_name is already taken by another group
    if (updateData.code_name) {
      const [codeCheck] = await db.execute(
        'SELECT id FROM miscellaneous WHERE code_name = ? AND id != ?',
        [updateData.code_name, id]
      );

      if (codeCheck.length > 0) {
        return res.status(400).json({ error: 'Code name already exists' });
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
      `UPDATE groups SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated group
    const [rows] = await db.execute(
      'SELECT id, code, code_name, group_code, group_name, description, created_at, updated_at FROM miscellaneous WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Group updated successfully',
      group: rows[0]
    });

  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
router.delete('/:id', authenticateToken, requirePermission('manage-groups'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const [existingGroups] = await db.execute(
      'SELECT id FROM miscellaneous WHERE id = ?',
      [id]
    );

    if (existingGroups.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if group is being used by other entities (optional - add your own business logic)
    // Example: Check if any batches or certificates reference this group
    /*
    const [dependencies] = await db.execute(
      'SELECT COUNT(*) as count FROM some_table WHERE group_id = ?',
      [id]
    );

    if (dependencies[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete group with associated records. Please remove dependencies first.'
      });
    }
    */

    // Delete group
    await db.execute('DELETE FROM miscellaneous WHERE id = ?', [id]);

    res.json({ message: 'Group deleted successfully' });

  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Get groups by group_code (utility endpoint)
router.get('/by-code/:group_code', authenticateToken, async (req, res) => {
  try {
    const { group_code } = req.params;

    const [rows] = await db.execute(
      'SELECT id, code_name, group_code, group_name, description, created_at, updated_at FROM miscellaneous WHERE group_code = ? ORDER BY group_name',
      [group_code]
    );

    res.json({ groups: rows });

  } catch (error) {
    console.error('Get groups by code error:', error);
    res.status(500).json({ error: 'Failed to fetch groups by code' });
  }
});

// Get group statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    // Get total groups count
    const [totalGroups] = await db.execute(
      'SELECT COUNT(*) as total FROM miscellaneous'
    );

    // Get groups by group_code
    const [groupsByCode] = await db.execute(`
      SELECT group_code, COUNT(*) as count 
      FROM miscellaneous 
      GROUP BY group_code
      ORDER BY count DESC
    `);

    // Get recently created groups
    const [recentGroups] = await db.execute(`
      SELECT id, code_name, group_name, created_at
      FROM miscellaneous 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      totalGroups: totalGroups[0].total,
      groupsByCode,
      recentGroups
    });

  } catch (error) {
    console.error('Get group stats error:', error);
    res.status(500).json({ error: 'Failed to fetch group statistics' });
  }
});

module.exports = router;