const functions = require('firebase-functions'); 
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const moment = require('moment'); 

admin.initializeApp();

const app = express();
app.use(cors({
    origin: [
      'http://localhost:5174', 
      'https://purple-flower-02549321e.6.azurestaticapps.net'
    ]
}));
app.use(express.json());

app.post('/create-account', async (req, res) => {
  const { email, password, displayName, user_type } = req.body;
  
  
  if (!email || !password || !displayName || !user_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
   
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    
    const nowFormatted = moment().format('YYYY-MM-DD HH:mm:ss');

  
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      user_type: user_type,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),  // Firebase's server timestamp
      updatedAt: nowFormatted  
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { user_type: user_type });

    
    res.status(200).json({
      message: `${user_type} account created`,
      newUser: {
        id: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        user_type: user_type
      }
    });

  } catch (error) {

    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.api = functions.https.onRequest(app); 
