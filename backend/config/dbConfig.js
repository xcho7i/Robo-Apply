const mongoose = require("mongoose");
require("dotenv").config();

mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      dbName: process.env.DB_NAME,
    });
    console.log("Successfully connected to the database");
  } catch (err) {
    console.error("Error connecting to the database", err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
