const express = require('express');
const db = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validate, groupSchemas } = require('../middleware/validation');

const router = express.Router();

// Get all groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', misc_group_code = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (search) {
      whereClause += ' AND (misc_name LIKE ? OR misc_group_name LIKE ? OR misc_description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (misc_group_code) {
      whereClause += ' AND misc_group_code = ?';
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
      `SELECT id, misc_code, misc_name, misc_group_code, misc_group_name, misc_description, created_at, updated_at 
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
router.get('/group-codes/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT * FROM miscellaneous
      WHERE misc_group_code IS NOT NULL
      GROUP BY misc_group_code
      ORDER BY misc_group_code ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching group codes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Get group by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      'SELECT id, misc_code, misc_name, misc_group_code, misc_group_name, misc_description, created_at, updated_at FROM miscellaneous WHERE id = ?',
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
    const { misc_code, misc_name, misc_group_code, misc_group_name, misc_description } = req.validatedData;

    // Check if misc_code already exists
    const [existingGroups] = await db.execute(
      'SELECT id FROM miscellaneous WHERE misc_code = ? AND misc_group_code = ?',
      [misc_code, misc_group_code]
    );

    if (existingGroups.length > 0) {
      return res.status(400).json({ error: 'Code name already exists' });
    }

    // Insert group
    const [result] = await db.execute(
      'INSERT INTO miscellaneous (misc_code, misc_name, misc_group_code, misc_group_name, misc_description) VALUES (?,?, ?, ?, ?)',
      [misc_code, misc_name, misc_group_code, misc_group_name, misc_description || null]
    );

    // Get created group
    const [rows] = await db.execute(
      'SELECT id, misc_code, misc_name, misc_group_code, misc_group_name, misc_description, created_at, updated_at FROM miscellaneous WHERE id = ?',
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
    if (updateData.misc_code) {
      const [codeCheck] = await db.execute(
        'SELECT id FROM miscellaneous WHERE misc_code = ? AND id != ?',
        [updateData.misc_code, id]
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
      `UPDATE miscellaneous SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated group
    const [rows] = await db.execute(
      'SELECT id, misc_code, misc_name, misc_group_code, misc_group_name, misc_description, created_at, updated_at FROM miscellaneous WHERE id = ?',
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

router.delete('/group/:id', authenticateToken, requirePermission('manage-groups'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const [existingGroups] = await db.execute(
      'SELECT id FROM miscellaneous WHERE misc_group_code = ?',
      [id]
    );

    if (existingGroups.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Delete group
    await db.execute('DELETE FROM miscellaneous WHERE misc_group_code = ?', [id]);

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
      'SELECT id, misc_code, misc_name, misc_group_code, misc_group_name, misc_description, created_at, updated_at FROM miscellaneous WHERE misc_group_code = ? ORDER BY misc_code',
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
      SELECT id, misc_code, misc_name, created_at
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