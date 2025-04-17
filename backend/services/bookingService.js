import { getDocs, collection, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase.config.js";


export const fetchAvailableNumericSlots = async (facilityId, selectedDate) => {
  try {
    const facilityRef = doc(db, "facilities", facilityId);
    const facilitySnap = await getDoc(facilityRef);

    if (!facilitySnap.exists()) {
      console.log("Facility not found");
      return [];
    }

    const facilityData = facilitySnap.data();
    const allSlots = facilityData.availableSlots || [];

    // Query for bookings on the given date and facility
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("facilityId", "==", facilityId),
      where("date", "==", selectedDate)
    );

    const bookingSnap = await getDocs(q);

    let takenSlots = [];
    bookingSnap.forEach(doc => {
      const data = doc.data();
      takenSlots = [...takenSlots, ...data.bookedSlots];
    });

    const availableSlots = allSlots.filter(slot => !takenSlots.includes(slot));
    console.log("Available slots:", availableSlots); 
    return availableSlots;
  } catch (error) {
    console.error("Error fetching available numeric slots:", error);
    return [];
  }
};


export const updateBookingSlots = async (bookingId, updatedBooking) => {
  if (!bookingId) {
    throw new Error("No booking ID provided");
  }

  try {
    console.log("UpdateBooking called with ID:", bookingId);
    console.log("UpdateBooking data:", updatedBooking);

    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(bookingRef, updatedBooking, { merge: true });

    console.log("Booking updated successfully in Firebase:", bookingId);
    return true;
  } catch (error) {
    console.error("Error updating booking in Firebase:", error);
    throw error; // Re-throw to handle in the component
  }
};
export const fetchUnbookableDays = async (facilityId, year, month) => {
  try {
    // Step 1: Get all slots for the facility
    const facilityRef = doc(db, 'facilities', facilityId);
    const facilitySnap = await getDoc(facilityRef);
    if (!facilitySnap.exists()) return [];

    const facilitySlots = facilitySnap.data().slots || [];

    // Step 2: Get all bookings for the current month
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('facilityID', '==', facilityId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );

    const snapshot = await getDocs(q);
    const slotMap = {}; // { 'YYYY-MM-DD': Set([...]) }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const date = data.date;

      if (!slotMap[date]) {
        slotMap[date] = new Set();
      }

      data.bookedSlots.forEach(slot => slotMap[date].add(slot));
    });

    // Step 3: Find fully booked dates
    const fullyBooked = Object.entries(slotMap)
      .filter(([_, slotSet]) =>
        facilitySlots.every(slot => slotSet.has(slot))
      )
      .map(([date]) => date);

    return fullyBooked;
  } catch (error) {
    console.error("Error fetching unbookable days:", error);
    return [];
  }
};
