const express = require('express');
const db = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validate, batchSchemas } = require('../middleware/validation');

const router = express.Router();

// Generate batch number
const generateBatchNumber = async () => {
  const year = new Date().getFullYear();

  // Get the last batch number for this year
  const [rows] = await db.execute(
    'SELECT batch_number FROM batches WHERE batch_number LIKE ? ORDER BY batch_number DESC LIMIT 1',
    [`BTH-${year}-%`]
  );

  let nextNumber = 1;
  if (rows.length > 0) {
    const lastNumber = rows[0].batch_number.split('-')[2];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `BTH-${year}-${String(nextNumber).padStart(3, '0')}`;
};

// Generate certificate numbers for batch
const generateCertificateNumbers = (count, certificateType) => {
  const year = new Date().getFullYear();
  const prefix = certificateType === 'Fire & Safety' ? 'FS' : 'WS';
  const startNumber = Math.floor(Math.random() * 1000) + 1;

  const numbers = [];
  for (let i = 0; i < count; i++) {
    numbers.push(`${prefix}-${year}-${String(startNumber + i).padStart(4, '0')}`);
  }

  return numbers;
};

// Get all batches
router.get('/', authenticateToken, requirePermission('manage-batches'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type = '', certType = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (search) {
      whereClause += ' AND (b.batch_number LIKE ? OR b.company_name LIKE ? OR u.name LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type) {
      whereClause += ' AND b.batch_type = ?';
      queryParams.push(type);
    }

    if (certType) {
      whereClause += ' AND b.certificate_type = ?';
      queryParams.push(certType);
    }

    // Get total count
    const [countRows] = await db.execute(
      `SELECT COUNT(*) as total 
       FROM batches b 
       LEFT JOIN users u ON b.instructor_id = u.id 
       ${whereClause}`,
      queryParams
    );
    const total = countRows[0].total;

    // Get batches with instructor info
    const [rows] = await db.execute(
      `SELECT b.*, u.name as instructor_name, u.email as instructor_email
       FROM batches b 
       LEFT JOIN users u ON b.instructor_id = u.id 
       ${whereClause}
       ORDER BY b.created_at DESC 
       LIMIT ${limit} OFFSET ${offset}`,
      [...queryParams]
    );
    console.log(rows);
    // Parse JSON fields
    const batches = rows.map(batch => ({
      ...batch,
      reserved_cert_numbers: batch.reserved_cert_numbers ? batch.reserved_cert_numbers : []
    }));

    res.json({
      batches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

// Get batch by ID
router.get('/:id', authenticateToken, requirePermission('manage-batches'), async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT b.*, u.name as instructor_name, u.email as instructor_email
       FROM batches b 
       LEFT JOIN users u ON b.instructor_id = u.id 
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const batch = {
      ...rows[0],
      reserved_cert_numbers: rows[0].reserved_cert_numbers ? JSON.parse(rows[0].reserved_cert_numbers) : []
    };

    res.json({ batch });

  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

// Create new batch
router.post('/', authenticateToken, requirePermission('manage-batches'), validate(batchSchemas.create), async (req, res) => {
  try {
    const batchData = req.validatedData;

    // Generate batch number if not provided
    if (!batchData.batch_number) {
      batchData.batch_number = await generateBatchNumber();
    } else {
      // Check if batch number already exists
      const [existing] = await db.execute(
        'SELECT id FROM batches WHERE batch_number = ?',
        [batchData.batch_number]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Batch number already exists' });
      }
    }

    // Verify instructor exists and is active
    const [instructorRows] = await db.execute(
      'SELECT id FROM users WHERE id = ? AND role = ? AND is_active = 1',
      [batchData.instructor_id, 'Instructor']
    );

    if (instructorRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or inactive instructor' });
    }

    // Generate certificate numbers
    const reservedCertNumbers = generateCertificateNumbers(
      batchData.number_of_participants,
      batchData.certificate_type
    );

    // Insert batch
    const [result] = await db.execute(
      `INSERT INTO batches (
        batch_number, company_name, referred_by, number_of_participants,
        batch_type, certificate_type, start_date, end_date,
        instructor_id, description, reserved_cert_numbers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batchData.batch_number,
        batchData.company_name,
        batchData.referred_by,
        batchData.number_of_participants,
        batchData.batch_type,
        batchData.certificate_type,
        batchData.start_date,
        batchData.end_date,
        batchData.instructor_id,
        batchData.description || '',
        JSON.stringify(reservedCertNumbers)
      ]
    );

    // Get created batch with instructor info
    const [rows] = await db.execute(
      `SELECT b.*, u.name as instructor_name, u.email as instructor_email
       FROM batches b 
       LEFT JOIN users u ON b.instructor_id = u.id 
       WHERE b.id = ?`,
      [result.insertId]
    );

    const batch = {
      ...rows[0],
      reserved_cert_numbers: JSON.parse(rows[0].reserved_cert_numbers)
    };

    res.status(201).json({
      message: 'Batch created successfully',
      batch
    });

  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
});

// Update batch
router.put('/:id', authenticateToken, requirePermission('manage-batches'), validate(batchSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;

    // Check if batch exists
    const [existingBatch] = await db.execute(
      'SELECT id, number_of_participants, certificate_type FROM batches WHERE id = ?',
      [id]
    );

    if (existingBatch.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Verify instructor if provided
    if (updateData.instructor_id) {
      const [instructorRows] = await db.execute(
        'SELECT id FROM users WHERE id = ? AND role = ? AND is_active = 1',
        [updateData.instructor_id, 'Instructor']
      );

      if (instructorRows.length === 0) {
        return res.status(400).json({ error: 'Invalid or inactive instructor' });
      }
    }

    // Check if we need to regenerate certificate numbers
    const batch = existingBatch[0];
    let shouldRegenerateCerts = false;

    if (updateData.number_of_participants && updateData.number_of_participants !== batch.number_of_participants) {
      shouldRegenerateCerts = true;
    }

    if (updateData.certificate_type && updateData.certificate_type !== batch.certificate_type) {
      shouldRegenerateCerts = true;
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

    // Regenerate certificate numbers if needed
    if (shouldRegenerateCerts) {
      const newParticipants = updateData.number_of_participants || batch.number_of_participants;
      const newCertType = updateData.certificate_type || batch.certificate_type;
      const newCertNumbers = generateCertificateNumbers(newParticipants, newCertType);

      updateFields.push('reserved_cert_numbers = ?');
      updateValues.push(JSON.stringify(newCertNumbers));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);

    await db.execute(
      `UPDATE batches SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated batch
    const [rows] = await db.execute(
      `SELECT b.*, u.name as instructor_name, u.email as instructor_email
       FROM batches b 
       LEFT JOIN users u ON b.instructor_id = u.id 
       WHERE b.id = ?`,
      [id]
    );

    const updatedBatch = {
      ...rows[0],
      reserved_cert_numbers: JSON.parse(rows[0].reserved_cert_numbers)
    };

    res.json({
      message: 'Batch updated successfully',
      batch: updatedBatch
    });

  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({ error: 'Failed to update batch' });
  }
});

// Delete batch
router.delete('/:id', authenticateToken, requirePermission('manage-batches'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if batch exists
    const [existingBatch] = await db.execute(
      'SELECT id FROM batches WHERE id = ?',
      [id]
    );

    if (existingBatch.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Check if batch has associated certificates
    const [certificates] = await db.execute(
      'SELECT COUNT(*) as count FROM certificates WHERE batch_id = ?',
      [id]
    );

    if (certificates[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete batch with associated certificates. Please delete certificates first.'
      });
    }

    // Delete batch
    await db.execute('DELETE FROM batches WHERE id = ?', [id]);

    res.json({ message: 'Batch deleted successfully' });

  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ error: 'Failed to delete batch' });
  }
});

// Get batch statistics
router.get('/stats/overview', authenticateToken, requirePermission('manage-batches'), async (req, res) => {
  try {
    // Get batch counts by type
    const [typeStats] = await db.execute(`
      SELECT batch_type, COUNT(*) as count 
      FROM batches 
      GROUP BY batch_type
    `);

    // Get batch counts by certificate type
    const [certStats] = await db.execute(`
      SELECT certificate_type, COUNT(*) as count 
      FROM batches 
      GROUP BY certificate_type
    `);

    // Get monthly batch creation stats
    const [monthlyStats] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM batches 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    // Get total participants
    const [participantStats] = await db.execute(`
      SELECT SUM(number_of_participants) as total_participants
      FROM batches
    `);

    res.json({
      batchesByType: typeStats,
      batchesByCertType: certStats,
      monthlyBatches: monthlyStats,
      totalParticipants: participantStats[0].total_participants || 0
    });

  } catch (error) {
    console.error('Get batch stats error:', error);
    res.status(500).json({ error: 'Failed to fetch batch statistics' });
  }
});

module.exports = router;