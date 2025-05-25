import { Event} from "../models/event.js"; 

//fetch all bookings
export const fetchEvents = async () => {
  const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/get-all-events`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch events");
    const events = await response.json();
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};


// createEvent.js
export const createEvent = async (eventData) => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/create-event';

  const payload = {
    ...eventData,
    maxParticipants: Number(eventData.maxParticipants),
    createdBy: localStorage.getItem('userId') || 'unknown',
    participants: [],
    status: 'active'
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
    throw new Error(errorResponse.error);
  }

  return { success: true };
};




