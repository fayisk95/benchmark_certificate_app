# Certificate Management System - Backend API

A comprehensive REST API for managing certificates, batches, users, and training programs built with Express.js and MySQL.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based permissions
- **User Management**: CRUD operations for users with different roles (Admin, Supervisor, Instructor, Staff)
- **Batch Management**: Create and manage training batches with automatic numbering
- **Certificate Management**: Issue, track, and manage certificates with status monitoring
- **File Uploads**: Support for certificate attachments (EID, licenses, signed certificates)
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **Settings Management**: Configurable system settings and role permissions
- **Security**: Rate limiting, CORS, input validation, and secure file handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cms-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=cms_database
   DB_USER=root
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=24h
   
   FRONTEND_URL=http://localhost:4200
   ```

4. **Database Setup**
   ```bash
   # Create database and tables
   npm run migrate
   
   # Seed with sample data
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/toggle-status` - Toggle user status
- `GET /api/users/instructors/list` - Get active instructors

### Batches
- `GET /api/batches` - Get all batches
- `GET /api/batches/:id` - Get batch by ID
- `POST /api/batches` - Create new batch
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch
- `GET /api/batches/stats/overview` - Get batch statistics

### Certificates
- `GET /api/certificates` - Get all certificates
- `GET /api/certificates/:id` - Get certificate by ID
- `POST /api/certificates` - Create new certificate
- `PUT /api/certificates/:id` - Update certificate
- `DELETE /api/certificates/:id` - Delete certificate
- `POST /api/certificates/:id/attachments` - Upload attachment
- `DELETE /api/certificates/:id/attachments/:attachmentId` - Delete attachment
- `POST /api/certificates/update-statuses` - Update certificate statuses
- `GET /api/certificates/stats/overview` - Get certificate statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/user-stats` - Get user-specific stats
- `GET /api/dashboard/health` - Get system health metrics

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting
- `PUT /api/settings` - Update settings
- `POST /api/settings/reset` - Reset settings to defaults
- `GET /api/settings/permissions/roles` - Get role permissions
- `PUT /api/settings/permissions/roles` - Update role permissions
- `POST /api/settings/permissions/reset` - Reset permissions to defaults

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (Admin, Supervisor, Instructor, Staff)
- `is_active` - Account status
- `created_at`, `updated_at` - Timestamps

### Batches Table
- `id` - Primary key
- `batch_number` - Unique batch identifier
- `company_name` - Client company name
- `referred_by` - Referrer name
- `number_of_participants` - Participant count
- `batch_type` - Training type (Onsite, Hybrid, Online)
- `certificate_type` - Certificate type (Fire & Safety, Water Safety)
- `start_date`, `end_date` - Training dates
- `instructor_id` - Foreign key to users table
- `description` - Batch description
- `reserved_cert_numbers` - JSON array of reserved certificate numbers
- `created_at`, `updated_at` - Timestamps

### Certificates Table
- `id` - Primary key
- `certificate_number` - Unique certificate identifier
- `batch_id` - Foreign key to batches table
- `name` - Certificate holder name
- `nationality` - Holder nationality
- `eid_license` - EID or license number
- `employer` - Employer name
- `training_name` - Training program name
- `training_date`, `issue_date`, `due_date` - Important dates
- `status` - Certificate status (Active, Expired, Expiring Soon)
- `created_at`, `updated_at` - Timestamps

### Certificate Attachments Table
- `id` - Primary key
- `certificate_id` - Foreign key to certificates table
- `file_name` - Original filename
- `file_type` - Attachment type (EID, Driving License, Signed Certificate)
- `file_path` - Server file path
- `file_size` - File size in bytes
- `uploaded_at` - Upload timestamp

## Authentication & Authorization

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles & Permissions

- **Admin**: Full system access
- **Supervisor**: Manage batches, certificates, reports, manual overrides
- **Instructor**: Manage assigned batches and certificates
- **Staff**: Issue certificates only

## File Upload

Certificate attachments are supported with the following constraints:
- **Allowed types**: JPEG, JPG, PNG, PDF
- **Max file size**: 5MB
- **Storage**: Local filesystem in `uploads/certificates/`

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": [] // For validation errors
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Expiration**: Configurable token expiry
- **File Upload Security**: Type and size validation

## Development

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Project Structure

```
cms-backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Input validation schemas
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── batches.js           # Batch management routes
│   ├── certificates.js      # Certificate management routes
│   ├── dashboard.js         # Dashboard routes
│   └── settings.js          # Settings routes
├── scripts/
│   ├── migrate.js           # Database migration script
│   └── seed.js              # Database seeding script
├── uploads/                 # File upload directory
├── .env                     # Environment variables
├── server.js                # Main application file
└── package.json             # Dependencies and scripts
```

## Default Login Credentials

After running the seed script, you can login with:

- **Admin**: admin@cms.com / password123
- **Supervisor**: supervisor@cms.com / password123
- **Instructor**: instructor@cms.com / password123
- **Staff**: staff@cms.com / password123

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2
3. Set up reverse proxy with Nginx
4. Configure SSL certificates
5. Set up database backups
6. Configure log rotation
7. Set up monitoring and alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.