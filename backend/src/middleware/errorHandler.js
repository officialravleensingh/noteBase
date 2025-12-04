const errorHandler = (err, req, res, next) => {
  console.error('Error stack:', err.stack);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({error: 'Duplicate entry. This record already exists.'});
  }
  if (err.code === 'P2025') {
    return res.status(404).json({error: 'Record not found.'});
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({error: 'Invalid token.'});
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({error: 'Token expired.'});
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed.',
      details: err.message
    });
  }

  // MongoDB/Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    return res.status(503).json({
      error: 'Database connection failed. Please try again later.'
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = { errorHandler, notFound };