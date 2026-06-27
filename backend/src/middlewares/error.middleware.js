const errorMiddleware = (err, req, res, _next) => {
  // Only log true server errors, not client mistakes
  const status = err.status || 500;
  if (status >= 500) console.error(err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists' });
  }
  if (err.code === '23503') {
    return res.status(404).json({ error: 'Referenced resource not found' });
  }

  res.status(status).json({ error: err.message || 'Internal server error' });
};

module.exports = errorMiddleware;
