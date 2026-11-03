function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({
    error: status >= 500 ? 'Erro interno do servidor.' : error.message,
  });
}

module.exports = errorHandler;
