// emailRoutes.js
const router = require("express").Router();
const googleController = require("../controllers/googleController");

router.get("/", (req, res) => {
    res.redirect("/auth/google");
});
router.get("/unread", googleController.checkForNewEmails);

module.exports = router;
