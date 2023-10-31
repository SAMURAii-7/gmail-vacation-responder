// authController.js
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
require("dotenv").config();

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const getLabelIdByName = async (labelName) => {
    try {
        const response = await gmail.users.labels.list({
            userId: "me",
        });

        const labels = response.data.labels;

        for (const label of labels) {
            if (label.name === labelName) {
                return label.id;
            }
        }
    } catch (error) {
        console.error("Error getting label ID:", error);
    }

    return null;
};

const checkIfReplied = async (threadId, yourEmailAddress) => {
    try {
        const response = await gmail.users.threads.get({
            userId: "me",
            id: threadId,
        });

        const thread = response.data;

        if (thread.messages && thread.messages.length > 0) {
            for (const message of thread.messages) {
                const headers = message.payload.headers;

                for (const header of headers) {
                    if (
                        header.name === "From" &&
                        header.value === yourEmailAddress
                    ) {
                        return true;
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error checking if replied:", error);
    }

    return false;
};

const sendReply = async (threadId, recipientEmail, emailSubject) => {
    const replyMessage = `I'm on vacation, don't disturb!`;
    await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: Buffer.from(
                `To: ${recipientEmail}\r\n` +
                    "Subject: Re: " +
                    `${emailSubject}` +
                    "\r\n" +
                    "Content-Type: text/plain; charset=UTF-8\r\n" +
                    "\r\n" +
                    replyMessage
            ).toString("base64"),
        },
    });

    const vacationLabelId = await getLabelIdByName("vacation");

    // Add custom label to the email
    await gmail.users.messages.modify({
        userId: "me",
        id: threadId,
        requestBody: {
            addLabelIds: [vacationLabelId],
            removeLabelIds: ["UNREAD"], // Remove the UNREAD label to mark the email as read
        },
    });
};

exports.getAuthURL = (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/gmail.modify"],
    });
    res.redirect(authUrl);
};

exports.handleAuthCallback = async (req, res) => {
    const code = req.query.code;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    res.redirect("/email/unread");
};

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// Function to check for new emails
exports.checkForNewEmails = async (req, res) => {
    try {
        // Using the Gmail API to fetch new emails
        const response = await gmail.users.messages.list({
            userId: "me",
            q: "is:unread",
        });

        const messages = response.data.messages;

        if (response.data.resultSizeEstimate > 0) {
            for (const message of messages) {
                const messageData = await gmail.users.messages.get({
                    userId: "me",
                    id: message.id,
                });

                const threadId = messageData.data.threadId;
                const userEmail = messageData.data.payload.headers.find(
                    (header) => header.name === "Delivered-To"
                ).value;
                const isReplied = await checkIfReplied(threadId, userEmail);
                // Check if this email thread has been replied to previously
                if (!isReplied) {
                    // Extract the recipient's email address from the message data
                    const recipientEmail =
                        messageData.data.payload.headers.find(
                            (header) => header.name === "Return-Path"
                        ).value;

                    const emailSubject = messageData.data.payload.headers.find(
                        (header) => header.name === "Subject"
                    ).value;

                    // Send a reply to the email
                    await sendReply(threadId, recipientEmail, emailSubject);
                    console.log(`Replied to email thread: ${threadId}`);
                    res.json({
                        message: `Replied to email thread: ${threadId}`,
                    });
                } else {
                    console.log("No new emails to reply to.");
                    res.json({ message: "No new emails to reply to." });
                }
            }
        } else {
            console.log("No new emails to reply to.");
            res.json({ message: "No new emails to reply to." });
        }
    } catch (error) {
        console.error("Error checking for new emails:", error);
    }
};
