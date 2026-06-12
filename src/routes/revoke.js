/**
 * revoke.js
 * Route: POST /api/revoke
 * Revokes a purchase by setting isRevoked = true.
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../services/db');

/**
 * POST /api/revoke
 * Body: { purchaseId }
 * Sets isRevoked = true on the given purchase.
 */
router.post('/', async (req, res) => {
  try {
    const { purchaseId } = req.body;

    if (!purchaseId) {
      return res.status(400).json({ success: false, error: 'purchaseId is required' });
    }

    const { data: purchase } = await supabase
      .from('Purchase')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (!purchase) {
      return res.status(404).json({ success: false, error: 'Purchase not found' });
    }

    if (purchase.isRevoked) {
      return res.status(200).json({ success: true, message: 'Purchase was already revoked' });
    }

    await supabase
      .from('Purchase')
      .update({ isRevoked: true })
      .eq('id', purchaseId);

    return res.json({ success: true, message: 'Purchase revoked successfully' });
  } catch (err) {
    console.error('[POST /api/revoke] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
