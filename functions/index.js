const functions = require('firebase-functions'); 
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const moment = require('moment'); 
const nodemailer = require('nodemailer');
const { onDocumentCreated } = require('firebase-functions/firestore');



admin.initializeApp();

const app = express();
app.use(cors({
    origin: [
      'http://localhost:5173', 
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),  
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


app.delete('/delete-account/:uid',async(req,res)=>{
  const {uid} = req.params;
  if (!uid) {
    return res.status(400).json({ error: 'Missing UID in URL' });
  }
  try{

  
  await admin.auth().deleteUser(uid)
  
  const userDocRef = admin.firestore().collection('users').doc(uid);
  await userDocRef.delete();
  console.log(`user${uid} deleted from firestore`);
  res.status(200).json({
    message: `${uid} deleted`})

  }
  catch(error){
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }

}
)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'facility.pro.online@gmail.com', 
    pass: 'bqrcwjaxmzljiaqx' 
  }
});

exports.sendEventNotification = onDocumentCreated('events/{eventId}', async (event) => {
  const snap = event.data;
  const eventData = snap.data();
    const eventName = eventData.title;
    const eventDate = eventData.date;
    const eventDescription = eventData.description;
    const eventLocation = eventData.location;
    const startTime = eventData.startTime;
    const endTime = eventData.endTime;
    

    try {
     
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('user_type', '==', 'resident')
        .get();

      if (usersSnapshot.empty) {
        console.log('No residents found');
        return;
      }

    
      const emailAddresses = [];
      usersSnapshot.forEach(doc => {
        const user = doc.data();
        if (user.email) {
          emailAddresses.push(user.email); 
        }
      });

      if (emailAddresses.length === 0) {
        console.log('No emails found');
        return;
      }

      
      const mailOptions = {
        from: 'facility.pro.online@gmail.com', 
        subject: `New Event: ${eventName}`,
        bcc: emailAddresses.join(', '), 
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <p style="font-size: 16px;">Dear Resident,</p>
            
            <p style="font-size: 16px;">You are invited to an upcoming event at the community facilities:</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4CAF50; margin-top: 0;">${eventName}</h2>
              <p><strong>Date:</strong> ${eventDate}</p>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Location:</strong> ${eventLocation}</p>
              <p><strong>Details:</strong> ${eventDescription}</p>
            </div>
            
            <p style="font-size: 14px;">We look forward to seeing you there!</p>
            
            <p style="font-size: 14px;">Best regards,<br>Facility Management Team</p>
          </div>
`

      };

      
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to all residents');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });

exports.api = functions.https.onRequest(app); 
