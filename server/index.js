const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", require("./routes/jwtAuth")(db));
app.use("/dashboard", require("./routes/dashboard")(db));
app.use("/projects", require("./routes/projects")(db));

// Export as Firebase function
exports.api = functions.https.onRequest(app);
