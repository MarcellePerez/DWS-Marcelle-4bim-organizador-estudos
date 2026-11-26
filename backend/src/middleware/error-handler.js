function errorHandler(error, _req, res, _next) {
  const status = error.status || error.statusCode || (error.code === 'P2002' ? 409 : 500);
  if (status >= 500) {
    console.error(error);
  }

  const message = error.code === 'P2002'
    ? 'Já existe um registro com esses dados.'
    : error.message || 'Requisição inválida.';

  return res.status(status).json({
    error: status >= 500 ? 'Erro interno do servidor.' : message,
  });
}

module.exports = errorHandler;
