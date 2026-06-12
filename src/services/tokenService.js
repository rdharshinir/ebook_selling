/**
 * tokenService.js
 * JWT sign and verify utilities for purchase access tokens.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * Signs a JWT token for a purchase.
 * @param {object} payload  - { purchaseId, customerId, bookId }
 * @param {number|null} expiresInDays - Days until expiry, null = no expiry
 * @returns {string} signed JWT token
 */
function signToken(payload, expiresInDays = null) {
  const options = { algorithm: 'HS256' };

  if (expiresInDays !== null && expiresInDays > 0) {
    options.expiresIn = `${expiresInDays}d`;
  }

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT token.
 * @param {string} token
 * @returns {{ purchaseId: string, customerId: string, bookId: string }}
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
