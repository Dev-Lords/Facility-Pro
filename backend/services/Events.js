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