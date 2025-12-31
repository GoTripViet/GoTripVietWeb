// routes/location.routes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/checkRole.middleware');

// --- Public Routes ---
// GET /locations
router.get('/', locationController.getAllLocations);
// GET /locations/da-nang (slug) HOẶC /locations/672f... (id)
router.get('/:idOrSlug', locationController.getLocationByIdOrSlug);

// --- Admin Routes ---
// POST /locations
router.post(
  '/', 
  authMiddleware, 
  checkRole(['admin']), 
  locationController.createLocation
);

// PUT /locations/:id
router.put(
  '/:id', 
  authMiddleware, 
  checkRole(['admin']), 
  locationController.updateLocation
);

// DELETE /locations/:id
router.delete(
  '/:id', 
  authMiddleware, 
  checkRole(['admin']), 
  locationController.deleteLocation
);

module.exports = router;