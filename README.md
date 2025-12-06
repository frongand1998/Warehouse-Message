# Warehouse Message

A MERN stack application that allows users to upload images and text, and send them directly to Facebook Messenger.

## Features

- 📝 Send text messages to Facebook Messenger
- 📷 Upload and send images with messages
- 💾 Store message history in MongoDB
- 🎨 Modern, responsive UI
- ✅ Real-time message status tracking

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **API**: Facebook Messenger Send API

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- A Facebook Page and App with Messenger enabled

## Facebook Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the "Messenger" product to your app
4. Generate a Page Access Token
5. Get the Page-Scoped ID (PSID) of the recipient you want to send messages to

## Installation

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` and add your credentials:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/warehouse-message
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_PAGE_ID=your_page_id_here
RECIPIENT_ID=your_recipient_psid_here
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Usage

1. Open the web app in your browser
2. Enter your message text (required)
3. Optionally upload an image (JPEG, PNG, or GIF, max 10MB)
4. Optionally enter a specific recipient PSID (otherwise uses the default from .env)
5. Click "Send to Messenger"
6. View the message history below the form

## API Endpoints

### POST `/api/messenger/send`
Send a message with optional image to Facebook Messenger

**Request:**
- `text` (string, required): Message text
- `image` (file, optional): Image file
- `recipientId` (string, optional): Recipient PSID

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "...",
    "recipientId": "...",
    "text": "...",
    "imageUrl": "..."
  }
}
```

### GET `/api/messenger/messages`
Get recent messages

**Response:**
```json
{
  "success": true,
  "messages": [...]
}
```

### GET `/api/messenger/messages/:id`
Get a specific message by ID

## Project Structure

```
Warehouse-Message/
├── server/
│   ├── models/
│   │   └── Message.js
│   ├── routes/
│   │   └── messenger.js
│   ├── uploads/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .gitignore
│   └── package.json
└── README.md
```

## Troubleshooting

### Facebook API Errors

- **Error 190**: Invalid OAuth 2.0 Access Token - Check your `FACEBOOK_PAGE_ACCESS_TOKEN`
- **Error 100**: Invalid parameter - Verify your `RECIPIENT_ID` is correct
- **Image upload failed**: Ensure image is under 10MB and is a supported format

### Connection Issues

- Ensure MongoDB is running locally or your MongoDB Atlas connection string is correct
- Check that both frontend and backend servers are running
- Verify the proxy setting in `client/package.json` points to your backend port

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
