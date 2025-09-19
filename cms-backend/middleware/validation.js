const Joi = require('joi');

// User validation schemas
const userSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Admin', 'Supervisor', 'Instructor', 'Staff').required(),
    is_active: Joi.boolean().default(true)
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(255),
    email: Joi.string().email(),
    role: Joi.string().valid('Admin', 'Supervisor', 'Instructor', 'Staff'),
    is_active: Joi.boolean()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

// Batch validation schemas
const batchSchemas = {
  create: Joi.object({
    batch_number: Joi.string().max(50),
    company_name: Joi.string().min(2).max(255).required(),
    referred_by: Joi.string().min(2).max(255).required(),
    number_of_participants: Joi.number().integer().min(1).max(100).required(),
    batch_type: Joi.string().valid('Onsite', 'Hybrid', 'Online').required(),
    certificate_type: Joi.string().valid('Fire & Safety', 'Water Safety').required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref('start_date')).required(),
    instructor_id: Joi.number().integer().required(),
    description: Joi.string().max(1000).allow('')
  }),
  
  update: Joi.object({
    company_name: Joi.string().min(2).max(255),
    referred_by: Joi.string().min(2).max(255),
    number_of_participants: Joi.number().integer().min(1).max(100),
    batch_type: Joi.string().valid('Onsite', 'Hybrid', 'Online'),
    certificate_type: Joi.string().valid('Fire & Safety', 'Water Safety'),
    start_date: Joi.date(),
    end_date: Joi.date(),
    instructor_id: Joi.number().integer(),
    description: Joi.string().max(1000).allow('')
  })
};

// Certificate validation schemas
const certificateSchemas = {
  create: Joi.object({
    certificate_number: Joi.string().max(100),
    batch_id: Joi.number().integer().required(),
    name: Joi.string().min(2).max(255).required(),
    nationality: Joi.string().min(2).max(100).required(),
    eid_license: Joi.string().min(5).max(100).required(),
    employer: Joi.string().min(2).max(255).required(),
    training_name: Joi.string().min(2).max(255).required(),
    training_date: Joi.date().required(),
    issue_date: Joi.date().required(),
    due_date: Joi.date().greater(Joi.ref('issue_date')).required()
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(255),
    nationality: Joi.string().min(2).max(100),
    eid_license: Joi.string().min(5).max(100),
    employer: Joi.string().min(2).max(255),
    training_name: Joi.string().min(2).max(255),
    training_date: Joi.date(),
    issue_date: Joi.date(),
    due_date: Joi.date(),
    status: Joi.string().valid('Active', 'Expired', 'Expiring Soon')
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation Error',
        details
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validate,
  userSchemas,
  batchSchemas,
  certificateSchemas
};