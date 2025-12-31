// controllers/location.controller.js
const locationService = require('../services/location.service');

class LocationController {
  async createLocation(req, res) {
    try {
      const location = await locationService.createLocation(req.body);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllLocations(req, res) {
    try {
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