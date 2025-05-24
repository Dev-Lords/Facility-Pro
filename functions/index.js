const functions = require('firebase-functions'); 
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const moment = require('moment'); 
const nodemailer = require('nodemailer');
const { onDocumentCreated } = require('firebase-functions/firestore');
const { onDocumentUpdated } = require('firebase-functions/firestore');


admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({
    origin: [
      'http://localhost:5173', 
      'https://purple-flower-02549321e.6.azurestaticapps.net'
    ]
}));
app.use(express.json());


//Fetching all users (Get-getting a file)
app.get('/get-all-users', async (req, res) => {
  try {
    const usersSnapshot = await admin.firestore().collection('users').orderBy('displayName').get();
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get("/available-slots", async (req, res) => {
  const { facilityId, selectedDate } = req.query;

  if (!facilityId || !selectedDate) {
    return res.status(400).json({ error: "Missing facilityId or selectedDate query parameter" });
  }

  try {
    console.log("Function called with facilityId:", facilityId, "and selectedDate:", selectedDate);
    
    const facilitiesRef = collection(db, "facilities");
    const facilityQuery = query(facilitiesRef, where("facilityID", "==", facilityId));
    const facilityQuerySnapshot = await getDocs(facilityQuery);
    
    if (facilityQuerySnapshot.empty) {
      console.log("Facility not found with facilityID:", facilityId);
      return res.json([]);
    }

    const facilityDoc = facilityQuerySnapshot.docs[0];
    const facilityData = facilityDoc.data();
    const allSlots = facilityData.slots || [];

    let formattedDate = selectedDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      formattedDate = new Date(selectedDate).toISOString().split('T')[0];
    }

    const bookingsRef = collection(db, "bookings");
    const bookingQuery = query(bookingsRef, where("facilityID", "==", facilityId), where("date", "==", formattedDate));
    const bookingSnap = await getDocs(bookingQuery);

    let takenSlots = [];
    bookingSnap.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.bookedSlots)) {
        takenSlots = [...takenSlots, ...data.bookedSlots];
      }
    });

    const uniqueTakenSlots = [...new Set(takenSlots)];
    const takenSlotsAsNumbers = uniqueTakenSlots.map(Number);
    const allSlotsAsNumbers = allSlots.map(Number);
    const availableSlots = allSlotsAsNumbers.filter(slot => !takenSlotsAsNumbers.includes(slot));

    res.json(availableSlots);
  } catch (error) {
    console.error("Error fetching available numeric slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



//Fetching a specific user (Get-getting a file)
app.get('/get-user/:uid', async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: 'Missing UID in request' });
  }

  try {
    const userRef = admin.firestore().collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ uid: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});



//Creating a user account (Post-sending information)
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


//Deleting a user (Delete-deleting a database file)
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


//Updating a user (Patch-changing only an attribute)
app.patch('/update-user-type', async (req, res) => {
  const { uid, newType } = req.body;

  if (!uid || !newType) {
    return res.status(400).json({ error: 'Missing uid or newType' });
  }
  try {
    const userRef = admin.firestore().collection('users').doc(uid);
    await userRef.set(
      {
        user_type: newType,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    res.status(200).json({ message: 'User type updated successfully' });
  } catch (error) {
    console.error('Error updating user type:', error);
    res.status(500).json({ error: 'Failed to update user type' });
  }
});



//BOOKINGS REVIEW:
//Fetching all bookings
app.get('/get-all-bookings', async (req, res) => {
  try {
    const bookingsCollection = admin.firestore().collection("bookings");
    const bookingsSnapshot = await bookingsCollection.get();

    const bookingsList = bookingsSnapshot.docs.map(doc => ({
      bookingID: doc.id,
      ...doc.data()
    }));

    res.status(200).json(bookingsList);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});


//updating the booking status
app.patch('/update-booking-status', async (req, res) => {
  const { bookingID, newStatus } = req.body;

  if (!bookingID || !newStatus) {
    return res.status(400).json({ error: 'Missing bookingID or newStatus in request body' });
  }

  try {
    const bookingRef = admin.firestore().collection('bookings').doc(bookingID);

    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await bookingRef.update({ status: newStatus });

    res.status(200).json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});










//EMAIL NOTIFICATIONS
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'facility.pro.online@gmail.com', 
    pass: 'bqrcwjaxmzljiaqx' 
  }
});

//Sending event notifications
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


//Sending maintenance update notifications
 exports.sendIssueUpdateNotification = onDocumentUpdated('issues/{issueId}', async (issue) => {
   // Get the data before and after the update
   const beforeData = issue.data.before.data();
   const afterData = issue.data.after.data();
   const issueId = issue.params.issueId;

   console.log(`Function triggered for issue: ${issue.params.issueId}`);

   
   // Skip if this is a new document creation (not an update)
   if (!beforeData) {
     console.log('This is a new issue creation, not an update');
     return;
   }
   
   // Check if status or priority changed
   const statusChanged = beforeData.issueStatus !== afterData.issueStatus;
   const priorityChanged = beforeData.priority !== afterData.priority;
   
   // Only proceed if status or priority changed
   if (!statusChanged && !priorityChanged) {
     console.log('No relevant changes to notify');
     return;
   }
   
   try {
     // Get the user ID associated with the issue - use reporter or assignedTo
     const userId = afterData.reporter || afterData.assignedTo;
     
     if (!userId) {
       console.log('No user ID associated with this issue');
       return;
     }
     
     // Get the user's email from Firestore
     const userDoc = await admin.firestore().collection('users').doc(userId).get();
     
     if (!userDoc.exists) {
       console.log(`User document with ID ${userId} not found`);
       return;
     }
     
     const userEmail = userDoc.data().email;
     
     if (!userEmail) {
       console.log('No email found for the user');
       return;
     }
     
     // Prepare email content
     const mailOptions = {
       from: 'facility.pro.online@gmail.com',
       to: userEmail,
       subject: `Issue Update: ${afterData.title || `Issue #${issueId}`}`,
       html: `
         <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
           <p style="font-size: 16px;">Dear User,</p>
           
           <p style="font-size: 16px;">Your issue has been updated:</p>
           
           <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
             <h2 style="color: #4A6FA5; margin-top: 0;">${afterData.issueTitle || `Issue #${issueId}`}</h2>
             
             ${statusChanged ? `
             <p><strong>Status:</strong> 
               <span style="color: #666;">${beforeData.issueStatus}</span> → 
               <span style="font-weight: bold; color: #1a73e8;">${afterData.issueStatus}</span>
             </p>` : ''}
             
             ${priorityChanged ? `
             <p><strong>Priority:</strong> 
               <span style="color: #666;">${beforeData.priority}</span> → 
               <span style="font-weight: bold; color: ${getPriorityColor(afterData.priority)};">${afterData.priority}</span>
             </p>` : ''}
             
             <p><strong>Description:</strong> ${afterData.issueDescription || 'No description provided'}</p>
             
             ${afterData.location ? `<p><strong>Location:</strong> ${afterData.location}</p>` : ''}
             ${afterData.feedback ? `<p><strong>Feedback:</strong> ${afterData.feedback}</p>` : ''}
             ${afterData.category ? `<p><strong>Category:</strong> ${afterData.category}</p>` : ''}
           </div>
           
           <p style="font-size: 14px;">You can review this issue in your Facility Pro dashboard.</p>
           
           <p style="font-size: 14px;">Best regards,<br>Facility Management Team</p>
         </div>
       `
     };
     
     // Send the email
     await transporter.sendMail(mailOptions);
     console.log(`Issue update notification sent to ${userEmail}`);
     
   } catch (error) {
     console.error('Error sending issue update notification:', error);
   }
 });
 
 /**
  * Helper function to get color for priority level in email
  */
 function getPriorityColor(priority) {
   if (!priority) return '#777777';
   
   const priorityLower = priority.toLowerCase();
   
   if (priorityLower.includes('high') || priorityLower.includes('urgent')) {
     return '#d93025'; // Red for high/urgent
   } else if (priorityLower.includes('medium')) {
     return '#f9ab00'; // Orange/yellow for medium
   } else if (priorityLower.includes('low')) {
     return '#1e8e3e'; // Green for low
   } else {
     return '#777777'; // Gray default
   }
 }



//Sending booking updates notifications

 exports.sendBookingNotification = onDocumentUpdated('bookings/{bookingID}', async (booking) => {
    const before = booking.data.before.data();
    const after = booking.data.after.data();

    // Log to confirm if the function is triggered
    console.log('Function triggered!');

    if (before.status === after.status) {
      console.log('Status did not change. No email sent.');
      return;
    }
    const Booking = after;
    const userId = after.userID;
    const checkInCode = after.bookingID.slice(0, 3); 
    const status=after.status; 

    try {
      //getting user email from the user id
      const userSnap = await admin.firestore().collection('users').doc(userId).get();
      if (!userSnap.exists) {
        console.error('User not found! No email sent.');
        return;
      }

      const userEmail = userSnap.data().email;

      //getting the timeslots for the email info:
      const timeslots = Booking.bookedSlots.map((slot) => {
        const startHour = slot;
        const endHour = slot + 1;
        const startTime = startHour > 12 ? `${startHour - 12}pm` : `${startHour}am`;
        const endTime = endHour > 12 ? `${endHour - 12}pm` : `${endHour}am`;
        return `<li>${startTime}-${endTime}</li>`;;
      }).join('');  

      let emailBody = `
      `;

      if (status.toLowerCase() === 'approved') {
        emailBody += `
        <p style="font-size: 16px;">Dear Resident,</p>
        <p style="font-size: 16px;">Your booking has been <strong style="text-transform: capitalize;">${Booking.status}</strong>.</p>
        <section style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Facility:</strong> ${Booking.facilityID.charAt(0).toUpperCase() + Booking.facilityID.slice(1)}</p>
          <p><strong>Date:</strong> ${Booking.date}</p>
          <p><strong>Timeslots:</strong></p>
          <ul style="font-size: 16px; list-style-type: disc; padding-left: 20px;">${timeslots}</ul>
        </section>
        <section style="background-color: #e0f7e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #4CAF50; margin-top: 0;">Check-in Code: ${checkInCode}</h3>
            <p style="font-size: 10px;">Please present this code when you arrive at the facility.</p>
        </section>
        `;
        
      } else if (status.toLowerCase() === 'declined') {
        emailBody += `
        <p style="font-size: 16px;">Dear Resident,</p>
        <p style="font-size: 16px;">Your booking has been <strong style="text-transform: capitalize;">${Booking.status}</strong>.</p>
        <p style="font-size: 14px;">Unfortunately, your booking could not be accommodated at this time.</p> 
        <section style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Facility:</strong> ${Booking.facilityID.charAt(0).toUpperCase() + Booking.facilityID.slice(1)}</p>
          <p><strong>Date:</strong> ${Booking.date}</p>
          <p><strong>Timeslots:</strong></p>
          <ul style="font-size: 16px; list-style-type: disc; padding-left: 20px;">${timeslots}</ul>
        </section>
        `;
        
      }

      emailBody += `
        <p style="font-size: 14px;">Thank you for using our community facilities!</p>
        <p style="font-size: 14px;">Best regards,<br>Facility Management Team</p>
      `;

      const mailOptions = {
        from: 'facility.pro.online@gmail.com',
        to: userEmail,
        subject: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}!`,
        html: `<section style="font-family: Arial, sans-serif; color: #333; padding: 20px;">${emailBody}</section>`
      };

      await transporter.sendMail(mailOptions);
      console.log('Booking status email sent successfully ✅');
    } 
    catch (error) {
      console.error('Error sending booking status email ❌:', error);
    }
  });
  



 

exports.api = functions.https.onRequest(app); 
