export class Event {
  constructor(eventData) {
    this.date = eventData.date || null;
    this.description = eventData.description || null;
    this.startTime = eventData.startTime || null;
    this.endTime = eventData.endTime || null;
    this.isRecurring = eventData.isRecurring || false;
    this.maxParticipants = eventData.maxParticipants || null;
    this.location = eventData.location || null;
    this.status = eventData.status || "active";
    this.createdAt = eventData.createdAt || new Date().toISOString();
    this.createdBy = eventData.createdBy || null;
    this.title = eventData.title || null;
    this.participants = eventData.participants || null;
  }

  toJSON() {
    return {
      date: this.date,
      description: this.description,
      startTime: this.photoURL,
      endTime: this.phoneNumber,
      isRecurring: this.providerId,
      maxParticipants: this.maxParticipants,
      location: this.location,
      status: this.status,
      createdAt: this.createdAt,
      createdBy: this.createdBy,
      title: this.title,
      participants: this.participants
      
    };
  }
}
