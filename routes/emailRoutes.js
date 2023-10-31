// emailRoutes.js
const router = require("express").Router();
const axios = require("axios");
const googleController = require("../controllers/googleController");

const getRandomInterval = () => {
    // Generate a random interval between 45 and 120 seconds
    return Math.floor(Math.random() * (120000 - 45000 + 1) + 45000);
};

let intervalId = null;
async function startPeriodicChecks() {
    intervalId = setInterval(async () => {
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
        });
        try {
            const response = await axios.get(
                "http://localhost:8080/email/unread"
            );
            console.log(response.data.message);
            console.log(
                `\n\n[${formattedTime}]: Next check in 45-120 seconds...`
            );
        } catch (error) {
            console.error("Failed to hit the endpoint", error);
        }
    }, getRandomInterval());
}

process.on("SIGINT", () => {
    if (intervalId) {
        clearInterval(intervalId);
    }
    process.exit();
});

router.get("/", (req, res) => {
    res.redirect("/auth/google");
    startPeriodicChecks();
});
router.get("/unread", googleController.checkForNewEmails);

module.exports = router;
