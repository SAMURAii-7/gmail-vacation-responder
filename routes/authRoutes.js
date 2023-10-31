// authRoutes.js
const router = require("express").Router();
const authController = require("../controllers/googleController");

router.get("/google", authController.getAuthURL);
router.get("/google/callback", authController.handleAuthCallback);

module.exports = router;
