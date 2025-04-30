export class Log{
    constructor(eventType, facilityId, userId, timestamp, details){
        this.eventType = eventType || "";
        this.facilityId = facilityId || "";
        this.userId = userId || "";
        this.timestamp = timestamp || null;
        this.details = details || {};
    }
}