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


  /* Cloud Function that triggers when an issue is updated in Firestore
  * Sends email notification to the issue owner with updated status and priority
  */
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



//sending booking notification after review

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
  


exports.fetchAvailableNumericSlots = functions.https.onCall(async (data, context) => {

  const { facilityId, selectedDate } = data;
  
  // Validate required parameters
  if (!facilityId || !selectedDate) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with facilityId and selectedDate arguments.'
    );
  }

  try {
    console.log("Function called with facilityId:", facilityId, "and selectedDate:", selectedDate);
    
    // First, query for the facility document where facilityID matches the passed parameter
    const facilitiesRef = db.collection("facilities");
    const facilityQuery = facilitiesRef.where("facilityID", "==", facilityId);
    const facilityQuerySnapshot = await facilityQuery.get();
    
    if (facilityQuerySnapshot.empty) {
      console.log("Facility not found with facilityID:", facilityId);
      return [];
    }
    
    const facilityDoc = facilityQuerySnapshot.docs[0];
    const facilityData = facilityDoc.data();
    const allSlots = facilityData.slots || [];
    console.log("All slots from facility:", allSlots);

    // Format the date consistently
    let formattedDate = selectedDate;
    if (selectedDate instanceof Date) {
      formattedDate = selectedDate.toISOString().split('T')[0]; // format: "YYYY-MM-DD"
    }
    console.log("Formatted date for query:", formattedDate);
    
    // Query for bookings with matching facilityID and date
    const bookingsRef = db.collection("bookings");
    const q = bookingsRef
      .where("facilityID", "==", facilityId)
      .where("date", "==", formattedDate);
    
    const bookingSnap = await q.get();
    console.log("Booking snapshot size:", bookingSnap.size);
    console.log("Number of booking documents found:", bookingSnap.size);
    
    // If no bookings exist for the selected date, return all available slots
    if (bookingSnap.empty) {
      console.log("No bookings found for this date and facility. All slots are available.");
      return allSlots;
    }
    
    let takenSlots = [];
    bookingSnap.forEach(doc => {
      const data = doc.data();
      console.log("Booking document ID:", doc.id);
      console.log("Booking facilityID:", data.facilityID);
      console.log("Booking date:", data.date);
      
      if (Array.isArray(data.bookedSlots)) {
        console.log("Booked slots in this document:", data.bookedSlots);
        takenSlots = [...takenSlots, ...data.bookedSlots];
      } else {
        console.warn("WARNING: Document", doc.id, "has no bookedSlots array");
      }
    });
    
    console.log("Combined taken slots:", takenSlots);
    
    const uniqueTakenSlots = [...new Set(takenSlots)];
    console.log("Unique taken slots:", uniqueTakenSlots);
    
    const takenSlotsAsNumbers = uniqueTakenSlots.map(slot => Number(slot));
    const allSlotsAsNumbers = allSlots.map(slot => Number(slot));
    
    console.log("Taken slots as numbers:", takenSlotsAsNumbers);
    console.log("All slots as numbers:", allSlotsAsNumbers);
    
    const availableSlots = allSlotsAsNumbers.filter(slot => !takenSlotsAsNumbers.includes(slot));
    console.log("Final available slots:", availableSlots);
    
    return availableSlots;
  } catch (error) {
    console.error("Error fetching available numeric slots:", error);
    console.error("Error stack:", error.stack);
    
    // Properly throw an HTTPS error for Firebase Callable functions
    throw new functions.https.HttpsError(
      'internal',
      'Error fetching available slots',
      error.message
    );
  }
});
 

exports.api = functions.https.onRequest(app); 
