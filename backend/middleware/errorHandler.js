// backend/middleware/errorHandler.js
/**
 * Gestionnaire d'erreurs global pour Express.
 * Signature (err, req, res, next) afin d'être utilisé comme :
 *   app.use(errorHandler);
 *
 * - Log l'erreur complète dans la console.
 * - Répond avec le code HTTP présent dans err.status (ou 500 par défaut).
 * - Renvoie toujours un objet uniforme : { success: false, error: <message> }
 */
const errorHandler = (err, req, res, next) => {
  // Log détaillé pour le débogage (ne pas exposer en prod)
  console.error('❌ Erreur non gérée :', err);

  // Le statut peut être défini manuellement dans les contrôleurs (ex: throw { status: 400, message: ... })
  const status = err.status ?? 500;
  const message = err.message ?? 'Erreur serveur';

  return res.status(status).json({
    success: false,
    error: message,
  });
};

export default errorHandler;
