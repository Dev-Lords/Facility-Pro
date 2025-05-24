import { getDocs, collection, doc, getDoc, query, where, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config.js";
import { logFacilityEvent } from "./logService.js";


export const fetchAvailableNumericSlots = async (facilityId, selectedDate) => {
  try {
    console.log("Function called with facilityId:", facilityId, "and selectedDate:", selectedDate);
    
    // First, query for the facility document where facilityID matches the passed parameter
    const facilitiesRef = collection(db, "facilities");
    const facilityQuery = query(facilitiesRef, where("facilityID", "==", facilityId));
    const facilityQuerySnapshot = await getDocs(facilityQuery);
    
    if (facilityQuerySnapshot.empty) {
      console.log("Facility not found with facilityID:", facilityId);
      return [];
    }
    
    const facilityDoc = facilityQuerySnapshot.docs[0];
    const facilityData = facilityDoc.data();
    const allSlots = facilityData.slots || [];
    console.log("All slots from facility:", allSlots);

    let formattedDate = selectedDate;
    if (selectedDate instanceof Date) {
      formattedDate = selectedDate.toISOString().split('T')[0]; // format: "YYYY-MM-DD"
    }
    console.log("Formatted date for query:", formattedDate);
    
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef,where("facilityID", "==", facilityId),where("date", "==", formattedDate));
    
    const bookingSnap = await getDocs(q);
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
    throw error;
  }
};

export const createBooking = async (facilityId, selectedDate, slotsToBook, userId) => {
  try {
    if (!facilityId || !selectedDate || !Array.isArray(slotsToBook) || slotsToBook.length === 0) {
      throw new Error("Missing or invalid parameters for createBooking.");
    }

    let formattedDate = selectedDate;
    if (selectedDate instanceof Date) {
      formattedDate = selectedDate.toISOString().split('T')[0];
    }

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, 
      where("facilityID", "==", facilityId),
      where("date", "==", formattedDate),
      where("userID", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    let totalBookedSlots = 0;
    let existingData = null;
    let bookingDoc = null;

    if (!querySnapshot.empty) {
      bookingDoc = querySnapshot.docs[0];
      existingData = bookingDoc.data();
      const existingSlots = Array.isArray(existingData.bookedSlots) ? existingData.bookedSlots : [];
      totalBookedSlots = existingSlots.length;

      // Check if adding the new slots would exceed the limit
      if (totalBookedSlots + slotsToBook.length > 3) {
        throw new Error("You cannot book more than 3 slots for one facility in one day.");
      }

      
      const updatedSlots = Array.from(new Set([...existingSlots, ...slotsToBook.map(Number)]));
      
      await setDoc(doc(db, "bookings", bookingDoc.id), {
        ...existingData,
        bookedSlots: updatedSlots
      });

      console.log("Booking updated successfully.");
    } else {
      // No existing booking — check if new booking exceeds limit
      if (slotsToBook.length > 3) {
        throw new Error("You cannot book more than 3 slots for one facility in one day.");
      }


      const bookingData = {
        facilityID: facilityId,
        date: formattedDate,
        bookedSlots: slotsToBook.map(Number),
        bookingID: "", 
        userID: userId,
        status: "pending"
      
      };

      const newDocRef = doc(collection(db, "bookings"));
      bookingData.bookingID = newDocRef.id;

      await setDoc(newDocRef, bookingData);
      console.log("New booking created successfully with ID:", newDocRef.id);
      const details = bookingData;
      logFacilityEvent("booking", facilityId, newDocRef.id, userId, details);
      
    }
  } catch (error) {
    console.error("Error creating or updating booking:", error);
    throw error;
  }
};

export const validBooking = async (facilityId, selectedDate, slotsToBook, userId) => {
  try {
    let formattedDate = selectedDate;
    if (selectedDate instanceof Date) {
      formattedDate = selectedDate.toISOString().split('T')[0];
    }

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, 
      where("facilityID", "==", facilityId),
      where("date", "==", formattedDate),
      where("userID", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    let totalBookedSlots = 0;

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const slots = Array.isArray(data.bookedSlots) ? data.bookedSlots : [];
      totalBookedSlots += slots.length;
    });

    if (totalBookedSlots + slotsToBook.length > 3) {
      return "booking limit exceeded";
    }

    return "valid";
  } catch (error) {
    console.error("Error validating booking:", error);
    return "error creating booking";
  }
}


//Admin functions
export const fetchBookings = async () => {
  const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/get-all-bookings`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  const bookings = await response.json();
  return bookings;
};


//updating booking status
export const updateBooking = async (bookingID, newStatus) => {
  const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/update-booking-status`;
  const payload = {
    bookingID,
    newStatus: newStatus,
  };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to booking status');
  }

  return { success: true };
};