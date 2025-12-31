// services/location.service.js
const Location = require('../models/location.model');

class LocationService {
  async createLocation(data) {
    const location = new Location(data);
    return await location.save();
  }

  async getAllLocations(filter = {}) {
    // Không cần phân trang cho location vì nó ít
    return await Location.find(filter);
  }

  async getLocationByIdOrSlug(identifier) {
    // Kiểm tra xem identifier có phải là ObjectId hợp lệ không
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    
    let location;
    if (isObjectId) {
      location = await Location.findById(identifier);
    } else {
      location = await Location.findOne({ slug: identifier });
    }

    if (!location) {
      throw new Error('Location not found');
    }
    return location;
  }

  async updateLocation(id, updateData) {
    const location = await Location.findByIdAndUpdate(id, updateData, { new: true });
    if (!location) {
      throw new Error('Location not found');
    }
    return location;
  }

  async deleteLocation(id) {
    const location = await Location.findByIdAndDelete(id);
    if (!location) {
      throw new Error('Location not found');
    }
    return { message: 'Location deleted' };
  }
}

// Cần import mongoose để dùng isValid
const mongoose = require('mongoose');
module.exports = new LocationService();