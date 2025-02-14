const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  placeName: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: [Number],  
    required: true,
    validate: {
      validator: (val) => val.length === 2,
      message: "Coordinates must have exactly two values [longitude, latitude]",
    },
  },
  boundingBox: {
    type: [Number],  
    required: true,
    validate: {
      validator: (val) => val.length === 4,
      message: "BoundingBox must contain exactly four values",
    },
  },
  region: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  relevance: {
    type: Number,
    required: true,
    min: 0,
    max: 1 // Assuming relevance is between 0 and 1
  },
  geometryType: {
    type: String,
    enum: ["Point", "Polygon", "MultiPolygon"],
    default: "Point"
  }
});

module.exports = locationSchema;
