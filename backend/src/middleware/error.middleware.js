export const notFoundHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode ?? 500;
  const message = error.message ?? "Error interno del servidor";

  res.status(statusCode).json({
    success: false,
    message,
    details: error.details ?? null,
  });
};
