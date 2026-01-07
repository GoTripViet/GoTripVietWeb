// controllers/location.controller.js
const locationService = require('../services/location.service');
const Location = require('../models/location.model');
class LocationController {

  async createLocation(req, res) {
    try {
      const location = await locationService.createLocation(req.body);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // [NEW] Request a new location (for Partners)
  async requestLocation(req, res) {
    try {
      const { name } = req.body;
      const userId = req.user?._id || req.user?.id; // Assumes Auth Middleware adds req.user

      // 1. Check for duplicates (Case insensitive)
      const existing = await Location.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });

      if (existing) {
        return res.status(400).json({ message: "Địa điểm này đã tồn tại trên hệ thống." });
      }

      // 2. Create with 'pending' status
      const newLocation = await Location.create({
        name: name.trim(),
        status: 'pending',
        created_by: userId
      });

      res.status(201).json(newLocation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // [UPDATED] Get All - Filter logic for Partners
  async getAllLocations(req, res) {
    try {
      // If query_mode is 'partner', we get Active + Pending (owned by user)
      // Otherwise (default), we might just get Active (or all if admin)
      const { query_mode } = req.query;
      const userId = req.user?._id || req.user?.id;

      let filter = {};

      if (query_mode === 'partner' && userId) {
        filter = {
          $or: [
            { status: 'active' }, // Public locations
            { status: 'pending', created_by: userId } // My pending requests
          ]
        };
        const locations = await Location.find(filter).sort({ name: 1 });
        return res.status(200).json(locations);
      }

      // Default behavior (delegate to service or fetch all active)
      const locations = await locationService.getAllLocations();
      res.status(200).json(locations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getLocationByIdOrSlug(req, res) {
    try {
      const location = await locationService.getLocationByIdOrSlug(req.params.idOrSlug);
      res.status(200).json(location);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateLocation(req, res) {
    try {
      const location = await locationService.updateLocation(req.params.id, req.body);
      res.status(200).json(location);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteLocation(req, res) {
    try {
      const result = await locationService.deleteLocation(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }


}





module.exports = new LocationController();