// reportService.js

export const fetchBookings = async () => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/get-all-bookings';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  const bookings = await response.json();
  return bookings;
};


export const fetchEvents = async () => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/get-all-events';
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

export const fetchIssues = async () => {
  const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/fetch-issues`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch issues");
    const issues = await response.json();
    return issues;
  } catch (error) {
    console.error("Error fetching issues:", error);
    return [];
  }
};
