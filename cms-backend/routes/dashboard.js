const express = require('express');
const db = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview statistics
router.get('/stats', authenticateToken, requirePermission('dashboard-access'), async (req, res) => {
  try {
    // Get total counts
    const [totalCertificates] = await db.execute(
      'SELECT COUNT(*) as count FROM certificates'
    );

    const [activeCertificates] = await db.execute(
      'SELECT COUNT(*) as count FROM certificates WHERE status = ?',
      ['Active']
    );

    const [expiredCertificates] = await db.execute(
      'SELECT COUNT(*) as count FROM certificates WHERE status = ?',
      ['Expired']
    );

    const [expiringSoonCertificates] = await db.execute(
      'SELECT COUNT(*) as count FROM certificates WHERE status = ?',
      ['Expiring Soon']
    );

    const [totalBatches] = await db.execute(
      'SELECT COUNT(*) as count FROM batches'
    );

    const [totalUsers] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE is_active = 1'
    );

    // Get recent activities (last 10 certificates created)
    const [recentCertificates] = await db.execute(`
      SELECT c.certificate_number, c.name, c.created_at, b.company_name
      FROM certificates c
      LEFT JOIN batches b ON c.batch_id = b.id
      ORDER BY c.created_at DESC
      LIMIT 10
    `);

    // Get recent batches (last 5 batches created)
    const [recentBatches] = await db.execute(`
      SELECT b.batch_number, b.company_name, b.number_of_participants, b.created_at, u.name as instructor_name
      FROM batches b
      LEFT JOIN users u ON b.instructor_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // Get certificates expiring in next 30 days
    const [expiringCertificates] = await db.execute(`
      SELECT c.certificate_number, c.name, c.due_date, b.company_name
      FROM certificates c
      LEFT JOIN batches b ON c.batch_id = b.id
      WHERE c.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
      AND c.status != 'Expired'
      ORDER BY c.due_date ASC
      LIMIT 10
    `);

    // Get monthly certificate trends (last 12 months)
    const [monthlyTrends] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as certificates_issued
      FROM certificates 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Get batch type distribution
    const [batchTypeStats] = await db.execute(`
      SELECT batch_type, COUNT(*) as count
      FROM batches
      GROUP BY batch_type
    `);

    // Get certificate type distribution
    const [certTypeStats] = await db.execute(`
      SELECT b.certificate_type, COUNT(c.id) as count
      FROM batches b
      LEFT JOIN certificates c ON b.id = c.batch_id
      WHERE c.id IS NOT NULL
      GROUP BY b.certificate_type
    `);

    res.json({
      overview: {
        totalCertificates: totalCertificates[0].count,
        activeCertificates: activeCertificates[0].count,
        expiredCertificates: expiredCertificates[0].count,
        expiringSoonCertificates: expiringSoonCertificates[0].count,
        totalBatches: totalBatches[0].count,
        totalUsers: totalUsers[0].count
      },
      recentActivity: {
        certificates: recentCertificates,
        batches: recentBatches
      },
      alerts: {
        expiringCertificates
      },
      trends: {
        monthly: monthlyTrends
      },
      distribution: {
        batchTypes: batchTypeStats,
        certificateTypes: certTypeStats
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get user-specific dashboard data
router.get('/user-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let userSpecificData = {};

    // If user is an instructor, get their batch and certificate stats
    if (userRole === 'Instructor') {
      const [instructorBatches] = await db.execute(
        'SELECT COUNT(*) as count FROM batches WHERE instructor_id = ?',
        [userId]
      );

      const [instructorCertificates] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM certificates c
        JOIN batches b ON c.batch_id = b.id
        WHERE b.instructor_id = ?
      `, [userId]);

      const [recentInstructorBatches] = await db.execute(`
        SELECT batch_number, company_name, number_of_participants, created_at
        FROM batches
        WHERE instructor_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `, [userId]);

      userSpecificData = {
        myBatches: instructorBatches[0].count,
        myCertificates: instructorCertificates[0].count,
        recentBatches: recentInstructorBatches
      };
    }

    // Get user's recent login info
    const [userInfo] = await db.execute(
      'SELECT name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      user: userInfo[0],
      userSpecific: userSpecificData
    });

  } catch (error) {
    console.error('User dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user dashboard data' });
  }
});

// Get system health metrics
router.get('/health', authenticateToken, requirePermission('dashboard-access'), async (req, res) => {
  try {
    // Database connection test
    const [dbTest] = await db.execute('SELECT 1 as test');
    const dbStatus = dbTest[0].test === 1 ? 'healthy' : 'unhealthy';

    // Get database size info
    const [dbSize] = await db.execute(`
      SELECT 
        table_schema as 'database_name',
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'size_mb'
      FROM information_schema.tables 
      WHERE table_schema = ?
      GROUP BY table_schema
    `, [process.env.DB_NAME]);

    // Get table row counts
    const [tableCounts] = await db.execute(`
      SELECT 
        table_name,
        table_rows
      FROM information_schema.tables
      WHERE table_schema = ?
      AND table_type = 'BASE TABLE'
    `, [process.env.DB_NAME]);

    res.json({
      database: {
        status: dbStatus,
        size: dbSize[0] || { size_mb: 0 },
        tables: tableCounts
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: 'Health check failed',
      database: { status: 'unhealthy' },
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;