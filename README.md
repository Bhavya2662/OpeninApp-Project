# Email Automation App

This is a Node.js app that automates sending replies to unread emails in a Gmail inbox.

## Technologies Used

- Node.js
- Express
- Google APIs Node.js Client
- local-auth
- path

## How It Works

The app does the following:

1. Imports required modules for Express, Google APIs, authentication, and file paths.

2. Defines Gmail API scopes needed to access the inbox and send messages. 

3. Creates an Express app and defines route to handle request. 

4. Authenticates with Google using OAuth 2.0 and retrieves access token.

5. Creates Gmail client using access token and API library.

6. Checks if a label exists for automated emails, creates it if not.

7. Queries for unread emails without prior replies. 

8. Loops through emails, replies to each, adds label, marks as read.

9. Sends response indicating completion. 

10. Starts server on port 4000.

## Possible Improvements

- Add error handling for API failures
- Extract hardcoded values to config file/env vars
- Add unit, integration and e2e tests 
- Implement logging for debugging
- Integrate log monitoring/aggregation

## Getting Started

- Clone the repo
- Run `npm install` to install dependencies
- Create a credentials file with OAuth client ID/secret
- Run `node app.js` to start the server

The app will automatically log in using OAuth and start processing emails.
