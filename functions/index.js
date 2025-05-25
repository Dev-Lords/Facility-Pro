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
      'http://localhost:5174',
      'https://purple-flower-02549321e.6.azurestaticapps.net'
    ]
}));
app.use(express.json());



//BOOKING A FACILITY CLOUD FUNCTIONS: used by residents

//Get the available slots for a specific faciility
app.get('/available-slots/:facilityId/:date', async (req, res) => {
  const { facilityId, date } = req.params;

  if (!facilityId || !date) {
    return res.status(400).json({ error: "Missing facilityId or date parameter" });
  }

  try {
    console.log("Function called with facilityId:", facilityId, "and date:", date);
    const facilitiesRef = db.collection("facilities");
    const facilityQuery = facilitiesRef.where("facilityID", "==", facilityId);
    const facilityQuerySnapshot = await facilityQuery.get();
    
    if (facilityQuerySnapshot.empty) {
      console.log("Facility not found with facilityID:", facilityId);
      return res.json([]);
    }

    const facilityDoc = facilityQuerySnapshot.docs[0];
    const facilityData = facilityDoc.data();
    const allSlots = facilityData.slots || [];

    let formattedDate = date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      formattedDate = new Date(date).toISOString().split('T')[0];
    }

  
    const bookingsRef = db.collection("bookings");
    const bookingQuery = bookingsRef
      .where("facilityID", "==", facilityId)
      .where("date", "==", formattedDate);
    const bookingSnap = await bookingQuery.get();

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
    availableSlots.sort((a, b) => a - b); 


    console.log("Available slots:", availableSlots);
    res.json(availableSlots);
  } catch (error) {
    console.error("Error fetching available numeric slots:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});



//Create a new Booking doc
app.post('/create-booking', async (req, res) => {
  try {
    const { facilityId, selectedDate, slotsToBook, userId } = req.body;

    // Validate required parameters
    if (!facilityId || !selectedDate || !Array.isArray(slotsToBook) || slotsToBook.length === 0 || !userId) {
      return res.status(400).json({ 
        error: "Missing or invalid parameters", 
        required: ["facilityId", "selectedDate", "slotsToBook", "userId"] 
      });
    }

    console.log("Creating booking for:", { facilityId, selectedDate, slotsToBook, userId });

    // Format date
    let formattedDate = selectedDate;
    if (selectedDate instanceof Date) {
      formattedDate = selectedDate.toISOString().split('T')[0];
    }

    
    const bookingsRef = db.collection("bookings");
    const existingBookingQuery = bookingsRef
      .where("facilityID", "==", facilityId)
      .where("date", "==", formattedDate)
      .where("userID", "==", userId);

    const querySnapshot = await existingBookingQuery.get();

    let totalBookedSlots = 0;
    let existingData = null;
    let bookingDoc = null;

    if (!querySnapshot.empty) {
      // Update existing booking
      bookingDoc = querySnapshot.docs[0];
      existingData = bookingDoc.data();
      const existingSlots = Array.isArray(existingData.bookedSlots) ? existingData.bookedSlots : [];
      totalBookedSlots = existingSlots.length;

      // Check if adding the new slots would exceed the limit
      if (totalBookedSlots + slotsToBook.length > 3) {
        return res.status(400).json({ 
          error: "You cannot book more than 3 slots for one facility in one day.",
          currentSlots: totalBookedSlots,
          requestedSlots: slotsToBook.length 
        });
      }

      // Merge existing and new slots, remove duplicates
      const updatedSlots = Array.from(new Set([...existingSlots, ...slotsToBook.map(Number)]));
      
      await bookingDoc.ref.update({
        bookedSlots: updatedSlots
      });

      console.log("Booking updated successfully for booking ID:", bookingDoc.id);
      
      return res.status(200).json({
        success: true,
        message: "Booking updated successfully",
        bookingId: bookingDoc.id,
        bookedSlots: updatedSlots
      });

    } else {
      if (slotsToBook.length > 3) {
        return res.status(400).json({ 
          error: "You cannot book more than 3 slots for one facility in one day.",
          requestedSlots: slotsToBook.length 
        });
      }

      const newBookingRef = db.collection("bookings").doc();
      const bookingData = {
        facilityID: facilityId,
        date: formattedDate,
        bookedSlots: slotsToBook.map(Number),
        bookingID: newBookingRef.id,
        userID: userId,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await newBookingRef.set(bookingData);
      
      console.log("New booking created successfully with ID:", newBookingRef.id);
     return res.status(201).json({
        success: true,
        message: "New booking created successfully",
        bookingId: newBookingRef.id,
        bookedSlots: bookingData.bookedSlots
      });
    }

  } catch (error) {
    console.error("Error creating:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});


//Validate booking before processing it
app.post('/validate-booking', async (req, res) => {
  try {
    const { facilityId, selectedDate, slotsToBook, userId } = req.body;

    if (!facilityId || !selectedDate || !Array.isArray(slotsToBook) || slotsToBook.length === 0 || !userId) {
      return res.status(400).json({ 
        result: "error creating booking",
        error: "Missing or invalid parameters"
      });
    }

    let formattedDate = selectedDate;
    if (selectedDate instanceof Date) {
      formattedDate = selectedDate.toISOString().split('T')[0];
    }

    const bookingsRef = db.collection("bookings");
    const q = bookingsRef
      .where("facilityID", "==", facilityId)
      .where("date", "==", formattedDate)
      .where("userID", "==", userId);

    const querySnapshot = await q.get();

    let totalBookedSlots = 0;

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const slots = Array.isArray(data.bookedSlots) ? data.bookedSlots : [];
      totalBookedSlots += slots.length;
    });

    if (totalBookedSlots + slotsToBook.length > 3) {
      return res.status(200).json({ result: "booking limit exceeded" });
    }

    return res.status(200).json({ result: "valid" });
  } catch (error) {
    console.error("Error validating booking:", error);
    return res.status(200).json({ result: "error creating booking" });
  }
});




//MAINTENANCE ISSUES RELATED CLOUD FUNCTIONS:

//Fetch all the issue in the database
app.get('/fetch-issues', async (req, res) => {
  try {
    const snapshot = await db.collection('issues').get();
    const issues = snapshot.docs.map(doc => ({
      issueID: doc.id,
      ...doc.data()
    }));
    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});


//Get the issue doc using its ID
app.post('/issues/:id', async (req, res) => {
  const issueID = req.params.id;
  const updatedIssue = req.body;

  if (!issueID) {
    return res.status(400).json({ error: 'No issue ID provided' });
  }

  try {
    await db.collection('issues').doc(issueID).set(updatedIssue, { merge: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
});


//Get the list of issues that a user has reported
app.get('/issuesByUser', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const snapshot = await db.collection('issues').where('reporter', '==', userId).get();
    const userIssues = snapshot.docs.map(doc => ({
      issueID: doc.id,
      ...doc.data()
    }));
    res.status(200).json(userIssues);
  } catch (error) {
    console.error('Error fetching user issues:', error);
    res.status(500).json({ error: 'Failed to fetch user issues' });
  }
});


//Create a new maintenance issue doc
app.post('/create-issue', async (req, res) => {
  try {
    const data = req.body;
    const issueRef = db.collection('issues').doc();
    const issueID = issueRef.id;

    const issueData = {
      ...data,
      issueID,
      images: data.images || [],
      issueStatus: 'open',
      feedback: '',
      assignedTo: null,
      location: data.location || 'Unspecified',
      relatedFacility: data.relatedFacility || 'Not Specified',
      reportedAt: data.reportedAt || new Date().toISOString(),
    };

    await issueRef.set(issueData);
    res.status(200).json({ issueID });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});



//USER SPECIFIC CLOUD FUNCTIONS:

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

})


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


//Save user information in order to determine user role
app.post("/save-user", async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.uid) return res.status(400).json({ error: "Missing UID" });

    const userRef = db.collection("users").doc(userData.uid);
    await userRef.set(
      {
        ...userData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    res.status(200).json({ message: "User saved", user: userData });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Failed to save user" });
  }
});


//Get user by the id
app.get("/get-user/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const docRef = db.collection("users").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return res.status(404).json({ error: "User not found" });

    res.status(200).json(docSnap.data());
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});


//Get a user role using the user id
app.get("/get-user-type/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const docSnap = await db.collection("users").doc(uid).get();

    if (!docSnap.exists) return res.status(404).json({ error: "User not found" });

    const data = docSnap.data();
    res.status(200).json({ user_type: data.user_type || null });
  } catch (error) {
    console.error("Error getting user type:", error);
    res.status(500).json({ error: "Failed to get user type" });
  }
});


//Check if the user exists
app.get("/user-exists/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const docSnap = await db.collection("users").doc(uid).get();
    res.status(200).json({ exists: docSnap.exists });
  } catch (error) {
    console.error("Error checking user existence:", error);
    res.status(500).json({ error: "Failed to check user existence" });
  }
});



//BOOKINGS REVIEW CLOUD FUNCTIONS: used by admin
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


//EVENTS CLOUD FUNCTIONS:

//Fetch all events
app.get('/get-all-events', async (req, res) => {
  try {
    const EventsCollection = admin.firestore().collection("events");
    const EventsSnapshot = await EventsCollection.get();
    const Events=EventsSnapshot.docs.map(doc => doc.data())
    

    res.status(200).json(Events);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});


//Creating a Event doc
app.post('/create-event', async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      maxParticipants,
      eventType,
      isRecurring,
      createdBy
    } = req.body;

    // Input validation
    if (!title || !date || !startTime || !endTime || !maxParticipants) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const numParticipants = parseInt(maxParticipants);
    if (numParticipants <= 0 || numParticipants > 1000) {
      return res.status(400).json({ error: 'Max participants must be between 1 and 1000' });
    }

    await db.collection('events').add({
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      maxParticipants: numParticipants,
      eventType,
      isRecurring: isRecurring || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: createdBy || 'unknown',
      participants: [],
      status: 'active',
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});




//LOGS ClOUD FUNCTIONS:
//Fetch all logs
app.get('/get-all-logs', async (req, res) => {
  try {
    const LogsCollection = admin.firestore().collection("logs");
    const LogsSnapshot = await LogsCollection.get();

    const LogsList = LogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(LogsList);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: 'Failed to fetch logs' });
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
