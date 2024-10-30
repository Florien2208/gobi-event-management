// lib/health-check.js
import mongoose from "mongoose";
import dbConnect from "./mongoose";

export async function checkDatabaseConnection() {
  try {
    await dbConnect();

    // Check connection state
    const state = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const dbStats = await mongoose.connection.db.stats();

    return {
      status: "success",
      connection: {
        state: states[state],
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        port: mongoose.connection.port,
      },
      statistics: {
        collections: dbStats.collections,
        documents: dbStats.objects,
        indexes: dbStats.indexes,
        avgObjSize: dbStats.avgObjSize,
      },
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      details: error.stack,
    };
  }
}
