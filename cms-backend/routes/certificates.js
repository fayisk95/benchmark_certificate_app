const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validate, certificateSchemas } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'certificates');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed'));
    }
  }
});

// Generate certificate number
const generateCertificateNumber = async (certificateType) => {
  const year = new Date().getFullYear();
  const prefix = certificateType === 'Fire & Safety' ? 'FS' : 'WS';
  
  // Get the last certificate number for this type and year
  const [rows] = await db.execute(
    'SELECT certificate_number FROM certificates WHERE certificate_number LIKE ? ORDER BY certificate_number DESC LIMIT 1',
    [`${prefix}-${year}-%`]
  );

  let nextNumber = 1;
  if (rows.length > 0) {
    const lastNumber = rows[0].certificate_number.split('-')[2];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// Calculate certificate status based on due date
const calculateStatus = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  if (due < now) {
    return 'Expired';
  } else if (due < thirtyDaysFromNow) {
    return 'Expiring Soon';
  }
  return 'Active';
};

// Get all certificates
router.get('/', authenticateToken, requirePermission('issue-certificates'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', batchId = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (search) {
      whereClause += ' AND (c.certificate_number LIKE ? OR c.name LIKE ? OR c.employer LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ' AND c.status = ?';
      queryParams.push(status);
    }

    if (batchId) {
      whereClause += ' AND c.batch_id = ?';
      queryParams.push(batchId);
    }

    // Get total count
    const [countRows] = await db.execute(
      `SELECT COUNT(*) as total 
       FROM certificates c 
       LEFT JOIN batches b ON c.batch_id = b.id 
       ${whereClause}`,
      queryParams
    );
    const total = countRows[0].total;

    // Get certificates with batch info
    const [rows] = await db.execute(
      `SELECT c.*, b.batch_number, b.company_name
       FROM certificates c 
       LEFT JOIN batches b ON c.batch_id = b.id 
       ${whereClause}
       ORDER BY c.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    // Get attachments for each certificate
    const certificateIds = rows.map(cert => cert.id);
    let attachments = [];
    
    if (certificateIds.length > 0) {
      const placeholders = certificateIds.map(() => '?').join(',');
      const [attachmentRows] = await db.execute(
        `SELECT * FROM certificate_attachments WHERE certificate_id IN (${placeholders})`,
        certificateIds
      );
      attachments = attachmentRows;
    }

    // Group attachments by certificate ID
    const attachmentsByCert = attachments.reduce((acc, attachment) => {
      if (!acc[attachment.certificate_id]) {
        acc[attachment.certificate_id] = [];
      }
      acc[attachment.certificate_id].push(attachment);
      return acc;
    }, {});

    // Add attachments to certificates
    const certificates = rows.map(cert => ({
      ...cert,
      attachments: attachmentsByCert[cert.id] || []
    }));

    res.json({
      certificates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Get certificate by ID
router.get('/:id', authenticateToken, requirePermission('issue-certificates'), async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT c.*, b.batch_number, b.company_name
       FROM certificates c 
       LEFT JOIN batches b ON c.batch_id = b.id 
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Get attachments
    const [attachments] = await db.execute(
      'SELECT * FROM certificate_attachments WHERE certificate_id = ?',
      [id]
    );

    const certificate = {
      ...rows[0],
      attachments
    };

    res.json({ certificate });

  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// Create new certificate
router.post('/', authenticateToken, requirePermission('issue-certificates'), validate(certificateSchemas.create), async (req, res) => {
  try {
    const certData = req.validatedData;

    // Verify batch exists
    const [batchRows] = await db.execute(
      'SELECT id, certificate_type FROM batches WHERE id = ?',
      [certData.batch_id]
    );

    if (batchRows.length === 0) {
      return res.status(400).json({ error: 'Invalid batch ID' });
    }

    const batch = batchRows[0];

    // Generate certificate number if not provided
    if (!certData.certificate_number) {
      certData.certificate_number = await generateCertificateNumber(batch.certificate_type);
    } else {
      // Check if certificate number already exists
      const [existing] = await db.execute(
        'SELECT id FROM certificates WHERE certificate_number = ?',
        [certData.certificate_number]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Certificate number already exists' });
      }
    }

    // Calculate status
    const status = calculateStatus(certData.due_date);

    // Insert certificate
    const [result] = await db.execute(
      `INSERT INTO certificates (
        certificate_number, batch_id, name, nationality, eid_license,
        employer, training_name, training_date, issue_date, due_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        certData.certificate_number,
        certData.batch_id,
        certData.name,
        certData.nationality,
        certData.eid_license,
        certData.employer,
        certData.training_name,
        certData.training_date,
        certData.issue_date,
        certData.due_date,
        status
      ]
    );

    // Get created certificate with batch info
    const [rows] = await db.execute(
      `SELECT c.*, b.batch_number, b.company_name
       FROM certificates c 
       LEFT JOIN batches b ON c.batch_id = b.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Certificate created successfully',
      certificate: { ...rows[0], attachments: [] }
    });

  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// Update certificate
router.put('/:id', authenticateToken, requirePermission('issue-certificates'), validate(certificateSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;

    // Check if certificate exists
    const [existingCert] = await db.execute(
      'SELECT id FROM certificates WHERE id = ?',
      [id]
    );

    if (existingCert.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Recalculate status if due_date is being updated
    if (updateData.due_date) {
      updateData.status = calculateStatus(updateData.due_date);
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
      `UPDATE certificates SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated certificate
    const [rows] = await db.execute(
      `SELECT c.*, b.batch_number, b.company_name
       FROM certificates c 
       LEFT JOIN batches b ON c.batch_id = b.id 
       WHERE c.id = ?`,
      [id]
    );

    // Get attachments
    const [attachments] = await db.execute(
      'SELECT * FROM certificate_attachments WHERE certificate_id = ?',
      [id]
    );

    const certificate = {
      ...rows[0],
      attachments
    };

    res.json({
      message: 'Certificate updated successfully',
      certificate
    });

  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// Delete certificate
router.delete('/:id', authenticateToken, requirePermission('issue-certificates'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if certificate exists
    const [existingCert] = await db.execute(
      'SELECT id FROM certificates WHERE id = ?',
      [id]
    );

    if (existingCert.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Get attachments to delete files
    const [attachments] = await db.execute(
      'SELECT file_path FROM certificate_attachments WHERE certificate_id = ?',
      [id]
    );

    // Delete certificate (attachments will be deleted by CASCADE)
    await db.execute('DELETE FROM certificates WHERE id = ?', [id]);

    // Delete attachment files
    attachments.forEach(attachment => {
      const filePath = path.join(__dirname, '..', attachment.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    res.json({ message: 'Certificate deleted successfully' });

  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

// Upload attachment
router.post('/:id/attachments', authenticateToken, requirePermission('issue-certificates'), upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { file_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!file_type || !['EID', 'Driving License', 'Signed Certificate'].includes(file_type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Check if certificate exists
    const [certRows] = await db.execute(
      'SELECT id FROM certificates WHERE id = ?',
      [id]
    );

    if (certRows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Check if attachment of this type already exists
    const [existingAttachment] = await db.execute(
      'SELECT id, file_path FROM certificate_attachments WHERE certificate_id = ? AND file_type = ?',
      [id, file_type]
    );

    // If exists, delete old file and record
    if (existingAttachment.length > 0) {
      const oldFilePath = path.join(__dirname, '..', existingAttachment[0].file_path);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      
      await db.execute(
        'DELETE FROM certificate_attachments WHERE id = ?',
        [existingAttachment[0].id]
      );
    }

    // Save attachment record
    const relativePath = path.join('uploads', 'certificates', req.file.filename);
    
    const [result] = await db.execute(
      'INSERT INTO certificate_attachments (certificate_id, file_name, file_type, file_path, file_size) VALUES (?, ?, ?, ?, ?)',
      [id, req.file.originalname, file_type, relativePath, req.file.size]
    );

    // Get created attachment
    const [attachmentRows] = await db.execute(
      'SELECT * FROM certificate_attachments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Attachment uploaded successfully',
      attachment: attachmentRows[0]
    });

  } catch (error) {
    console.error('Upload attachment error:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

// Delete attachment
router.delete('/:id/attachments/:attachmentId', authenticateToken, requirePermission('issue-certificates'), async (req, res) => {
  try {
    const { id, attachmentId } = req.params;

    // Get attachment info
    const [attachmentRows] = await db.execute(
      'SELECT file_path FROM certificate_attachments WHERE id = ? AND certificate_id = ?',
      [attachmentId, id]
    );

    if (attachmentRows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', attachmentRows[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record
    await db.execute(
      'DELETE FROM certificate_attachments WHERE id = ?',
      [attachmentId]
    );

    res.json({ message: 'Attachment deleted successfully' });

  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

// Update certificate statuses (run periodically)
router.post('/update-statuses', authenticateToken, requirePermission('issue-certificates'), async (req, res) => {
  try {
    // Get all certificates
    const [certificates] = await db.execute(
      'SELECT id, due_date FROM certificates'
    );

    let updatedCount = 0;

    for (const cert of certificates) {
      const newStatus = calculateStatus(cert.due_date);
      
      await db.execute(
        'UPDATE certificates SET status = ? WHERE id = ?',
        [newStatus, cert.id]
      );
      
      updatedCount++;
    }

    res.json({
      message: 'Certificate statuses updated successfully',
      updated: updatedCount
    });

  } catch (error) {
    console.error('Update statuses error:', error);
    res.status(500).json({ error: 'Failed to update certificate statuses' });
  }
});

// Get certificate statistics
router.get('/stats/overview', authenticateToken, requirePermission('issue-certificates'), async (req, res) => {
  try {
    // Get certificate counts by status
    const [statusStats] = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM certificates 
      GROUP BY status
    `);

    // Get certificates by training type
    const [trainingStats] = await db.execute(`
      SELECT training_name, COUNT(*) as count 
      FROM certificates 
      GROUP BY training_name
    `);

    // Get monthly certificate creation stats
    const [monthlyStats] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM certificates 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    // Get expiring certificates (next 30 days)
    const [expiringCerts] = await db.execute(`
      SELECT COUNT(*) as count
      FROM certificates 
      WHERE due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
      AND status != 'Expired'
    `);

    res.json({
      certificatesByStatus: statusStats,
      certificatesByTraining: trainingStats,
      monthlyCertificates: monthlyStats,
      expiringSoon: expiringCerts[0].count
    });

  } catch (error) {
    console.error('Get certificate stats error:', error);
    res.status(500).json({ error: 'Failed to fetch certificate statistics' });
  }
});

module.exports = router;