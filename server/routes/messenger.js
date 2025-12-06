const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Message = require('../models/Message');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Send message with text and optional image to Facebook Messenger
router.post('/send', upload.single('image'), async (req, res) => {
  try {
    const { text, recipientId } = req.body;
    const image = req.file;

    if (!text) {
      return res.status(400).json({ error: 'Text message is required' });
    }

    const recipient = recipientId || process.env.RECIPIENT_ID;
    
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    if (!pageAccessToken) {
      return res.status(500).json({ error: 'Facebook Page Access Token is not configured' });
    }

    // Create a new message record
    const newMessage = new Message({
      text,
      imageUrl: image ? `/uploads/${image.filename}` : null,
      recipientId: recipient,
      status: 'pending'
    });

    try {
      await newMessage.save();
    } catch (dbError) {
      console.log('⚠️  Could not save to database:', dbError.message);
      // Continue anyway - sending message is more important than saving
    }

    let attachmentId = null;

    // If there's an image, upload it first to get attachment ID
    if (image) {
      try {
        const formData = new FormData();
        formData.append('message', JSON.stringify({
          attachment: {
            type: 'image',
            payload: {
              is_reusable: true
            }
          }
        }));
        formData.append('filedata', fs.createReadStream(image.path));

        const uploadResponse = await axios.post(
          `https://graph.facebook.com/v18.0/me/message_attachments?access_token=${pageAccessToken}`,
          formData,
          {
            headers: formData.getHeaders()
          }
        );

        attachmentId = uploadResponse.data.attachment_id;
      } catch (error) {
        console.error('Error uploading image to Facebook:', error.response?.data || error.message);
        try {
          newMessage.status = 'failed';
          newMessage.error = 'Failed to upload image to Facebook';
          await newMessage.save();
        } catch (dbError) {
          console.log('⚠️  Could not save to database');
        }
        return res.status(500).json({ 
          error: 'Failed to upload image to Facebook', 
          details: error.response?.data || error.message 
        });
      }
    }

    // Send the message with text and optional image attachment
    try {
      // If we have an attachment, send image first, then text in separate message
      if (attachmentId) {
        // Send image
        const imageMessageData = {
          recipient: { id: recipient },
          message: {
            attachment: {
              type: 'image',
              payload: {
                attachment_id: attachmentId
              }
            }
          }
        };

        await axios.post(
          `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
          imageMessageData
        );

        // Send text as separate message
        const textMessageData = {
          recipient: { id: recipient },
          message: {
            text: text
          }
        };

        const sendResponse = await axios.post(
          `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
          textMessageData
        );

        try {
          newMessage.status = 'sent';
          newMessage.messageId = sendResponse.data.message_id;
          await newMessage.save();
        } catch (dbError) {
          console.log('⚠️  Could not save to database');
        }

        res.json({
          success: true,
          message: 'Message sent successfully',
          data: {
            messageId: sendResponse.data.message_id,
            recipientId: sendResponse.data.recipient_id,
            text,
            imageUrl: newMessage.imageUrl
          }
        });
      } else {
        // Send text only
        const messageData = {
          recipient: { id: recipient },
          message: {
            text: text
          }
        };

        const sendResponse = await axios.post(
          `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
          messageData
        );

        try {
          newMessage.status = 'sent';
          newMessage.messageId = sendResponse.data.message_id;
          await newMessage.save();
        } catch (dbError) {
          console.log('⚠️  Could not save to database');
        }

        res.json({
          success: true,
          message: 'Message sent successfully',
          data: {
            messageId: sendResponse.data.message_id,
            recipientId: sendResponse.data.recipient_id,
            text,
            imageUrl: newMessage.imageUrl
          }
        });
      }
    } catch (error) {
      console.error('Error sending message to Facebook:', error.response?.data || error.message);
      try {
        newMessage.status = 'failed';
        newMessage.error = error.response?.data?.error?.message || error.message;
        await newMessage.save();
      } catch (dbError) {
        console.log('⚠️  Could not save to database');
      }
      
      res.status(500).json({ 
        error: 'Failed to send message to Facebook', 
        details: error.response?.data || error.message 
      });
    }
  } catch (error) {
    console.error('Error in send route:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

// Get single message by ID
router.get('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, message });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message', details: error.message });
  }
});

// Webhook verification endpoint (for Facebook)
router.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'my_webhook_token_123';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Webhook endpoint to receive messages (captures PSID automatically)
router.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      const webhookEvent = entry.messaging[0];
      console.log('Webhook event received:', webhookEvent);

      const senderPsid = webhookEvent.sender.id;
      console.log('📩 Message received from PSID:', senderPsid);
      console.log('👉 Use this as your RECIPIENT_ID in .env file!');

      // You can store this PSID in your database for later use
      // Or just copy it from the console logs
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;
