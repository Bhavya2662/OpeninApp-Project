// Import the required modules
const express = require("express");
const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
const path = require("path");

// Define the Gmail API scopes
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

// Create an Express app
const app = express();

// Define a route to handle the email automation
app.get("/api", async (req, res) => {
  // Authenticate with Google using OAuth 2.0
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "credential.json"),
    scopes: SCOPES,
  });

  // Create a Gmail client
  const gmail = google.gmail({ version: "v1", auth });

  // Define a label name for the automated emails
  const labelName = "MailAway";

  // Check if the label exists, if not create it
  const labels = await gmail.users.labels.list({ userId: "me" });
  const label = labels.data.labels.find((l) => l.name === labelName);
  let labelId;
  if (!label) {
    // Create a new label
    const newLabel = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    labelId = newLabel.data.id;
  } else {
    // Use the existing label id
    labelId = label.id;
  }

  // Define a query to get the unread messages that have no prior replies
  const query = "is:unread -in:chats -has:userlabels -subject:Re";

  // Get the messages that match the query
  const messages = await gmail.users.messages.list({
    userId: "me",
    q: query,
  });

  // Loop through the messages and send replies
  for (const message of messages.data.messages) {
    // Get the message details
    const messageDetails = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });

    // Get the message id, subject, and sender
    const messageId = messageDetails.data.id;
    const headers = messageDetails.data.payload.headers;
    const subject = headers.find((h) => h.name === "Subject").value;
    const from = headers.find((h) => h.name === "From").value;

    // Define a reply message
    const reply = `Hi, this is an automated reply from MailAway. I am currently out of office and will get back to you as soon as possible. Thank you for your email. \n\n Regards, \n Your Name`;

    // Create a MIME message
    const mimeMessage = [
      `From: me`,
      `To: ${from}`,
      `Subject: Re: ${subject}`,
      `In-Reply-To: ${messageId}`,
      `References: ${messageId}`,
      "",
      reply,
    ].join("\n");

    // Encode the message in base64 format
    const encodedMessage = Buffer.from(mimeMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send the message
    const sentMessage = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    // Add the label to the message
    const modifiedMessage = await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        addLabelIds: [labelId],
      },
    });

    // Mark the message as read
    const readMessage = await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });
  }

  // Send a response to the browser
  res.status(200).send("Email automation completed");
});

// Start the server
app.listen(4000, () => {
  console.log(`Server is running at port 4000`);
});
