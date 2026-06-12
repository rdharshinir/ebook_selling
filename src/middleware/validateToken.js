/**
 * validateToken.js
 * Express middleware that verifies the JWT from ?token= query param.
 * Attaches decoded payload to req.tokenPayload if valid.
 */

const { verifyToken } = require('../services/tokenService');

/**
 * Validates the JWT token from the query string.
 * On failure, returns a 403 JSON response.
 */
function validateToken(req, res, next) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(403).json({
        success: false,
        error: 'No access token provided',
      });
    }

    const decoded = verifyToken(token);
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(403).json({
      success: false,
      error: isExpired ? 'Token has expired' : 'Invalid access token',
    });
  }
}

module.exports = { validateToken };
