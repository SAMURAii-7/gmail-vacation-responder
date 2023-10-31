// authRoutes.js
const router = require("express").Router();
const googleController = require("../controllers/googleController");

router.get("/google", googleController.getAuthURL);
router.get("/google/callback", googleController.handleAuthCallback);

module.exports = router;
