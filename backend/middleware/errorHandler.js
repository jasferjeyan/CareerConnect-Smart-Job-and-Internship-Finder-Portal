const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `An entry with this ${field} already exists.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. ')
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: `Resource not found with id ${err.value}`
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds limit. Maximum allowed size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  // Custom errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;

