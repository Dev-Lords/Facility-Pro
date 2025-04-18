/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.createUserAccount = functions.https.onCall( async (data, context) =>{

    if(!context.auth){
        throw new functions.https.HttpsError("unauthenticated", "you must be signed in");
    }

    const callerDoc = await db.collection("users").doc(context.auth.uid).get();

    if (!callerDoc.exits || callerDoc.data().user_type !== "admin"){
        throw new functions.https.HttpsError("permission-denied", "you must be an admin to create users");
    }

    const {email, password, displayName, user_type} = data;

    if (!email || !password || !displayName || !user_type) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
      }

    try{
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName
        });

        await db.collection("users").doc(userRecord.uid).set({
            email,
            displayName,
            user_type: user_type,
            createdAt: new Date().toISOString()
        });

        return {
            message: `User ${displayName} created with UID ${userRecord.uid}`,
            uid: userRecord.uid
        };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});