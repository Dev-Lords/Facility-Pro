
import { logFacilityEvent } from "./logService.js";

export const validBooking = async (facilityId, selectedDate, slotsToBook, userId) => {
  try {
    const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/validate-booking`;
    
    const payload = {
      facilityId: facilityId,
      selectedDate: selectedDate,
      slotsToBook: slotsToBook,
      userId: userId
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error response:", errorResponse);
      return errorResponse.result || "error creating booking";
    }

    const result = await response.json();
    return result.result; // Returns "valid", "booking limit exceeded", or "error creating booking"

  } catch (error) {
    console.error("Error validating booking:", error);
    return "error creating booking";
  }
};

//Admin functions
export const fetchBookings = async () => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/get-all-bookings';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  const bookings = await response.json();
  return bookings;
};


export const fetchAvailableNumericSlots = async (facilityId, selectedDate) => {
	const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/available-slots/${facilityId}/${selectedDate}`;
	const response = await fetch(url);
	if (!response.ok) {
    throw new Error('Failed to fetch slots');
  }
  const slots = await response.json();
  return slots;

};

export const createBooking = async (facilityId, selectedDate, slotsToBook, userId) => {
  try {
   
    const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/create-booking`;
    
    const payload = {
      facilityId: facilityId,
      selectedDate: selectedDate,
      slotsToBook: slotsToBook,
      userId: userId
    };


    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error response:", errorResponse);
      throw new Error(errorResponse.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const successResponse = await response.json();

    const urllog = `https://us-central1-facilty-pro.cloudfunctions.net/api/create-log`;

    const logpayload = {
      eventType: "booking",
      facilityId: facilityId,
      eventDocId: successResponse.bookingId,
      userId: userId,
      details: payload
    };

    const logresponse = await fetch(urllog, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logpayload)
    });

    if(!logresponse.ok){
      const errorResponselog = await logresponse.json();
      console.error("Error response: ", errorResponselog);
      throw new Error(errorResponselog.error || `HTTP ${logresponse.status}: ${logresponse.statusText}`);
    }

    console.log("No error for log")
    const successResponselog = await logresponse.json();
    
    return {
      success: true,
      data: successResponse,
      logdata: successResponselog
    };


  } catch (error) {
    console.error("Error in createBooking:", error);
    throw error; // Re-throw to let caller handle it
  }
};

export const fetchUserBookings =  async(uid)=> {
	
  try {
    const response = await fetch(`https://us-central1-facilty-pro.cloudfunctions.net/api/get-user-bookings?uid=${uid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    const bookings = await response.json();
    console.log('User bookings:', bookings);
    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
  }
}

// Example usage


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