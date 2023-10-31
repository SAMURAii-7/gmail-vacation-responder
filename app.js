const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const emailRoutes = require("./routes/emailRoutes");

const port = process.env.PORT || 8080;

app.use("/auth", authRoutes);
app.use("/email", emailRoutes);
app.get("/", (req, res) => {
    res.send("Welcome to the server!");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
