import { Log } from "../models/log";
import { collection, addDoc, getDocs, serverTimestamp, Timestamp, query, where} from "firebase/firestore";
import { db } from "../firebase/firebase.config";




//Used to check that the eventTypes passed in on call of logging function
// are valid
const eventTypes = ["booking", "cancellation", "issue"];

//Function to log events. Events will be used to generate usage trends and reports
export const logFacilityEvent = async (eventType, facilityId, eventDocId, userId, details) => {

    //Check that the event type is valid to prevent meaningless events added to collection
    if(!eventTypes.includes(eventType)){
        console.log("Logging failed due to invalid event. Events allowed are: \n booking \n cancellation \n issue \n");
        console.log("Your event: ",  eventType);
    }


    //Add log to database
    try{
        await addDoc(collection(db, "logs"), {
            eventType: eventType,
            facilityId: facilityId,
            eventDocId: eventDocId,
            userId: userId,
            timestamp: serverTimestamp(),
            details: details
            });
        console.log("Event Logged. Well done.");
    } catch (error) {
        console.error("Error logging event: ", error);
    }

}



export const fetchFacilityEvents = async () => {
    try{
        const logsCollection = (collection(db, "logs"));
        const logsSnapshot = await getDocs(logsCollection);
        const logsList = logsSnapshot.docs.map(doc => {
            const data = doc.data();
            return{
                id: doc.id,
                ...data
            };
        });

        console.log("Logs fetched: ", logsList);

        return logsList;
    } catch (error){
        console.error("Error fetching logs: ", error);
        return [];
    }
}

export const FecthPrevMonthLogs = async () => {
    const now = new Date();

    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1, 0, 0, 0, 0);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const startPrev = Timestamp.fromDate(startOfPrevMonth);
    const endPrev = Timestamp.fromDate(endOfPrevMonth);

    const q = query(
        collection(db, "logs"), where("timestamp", ">=", startPrev), where("timestamp", "<=", endPrev)
    );

    const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => doc.data());

      console.log(docs);
      return docs;

}

export const fetchPastMonthLogs = async () => {

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const start = Timestamp.fromDate(startOfMonth);
    const end = Timestamp.fromDate(endOfMonth);

    const q = query(
        collection(db, "logs"), where("timestamp", ">=", start), where("timestamp", "<=", end)
    );
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => doc.data());
      return docs;

}

export const fetchMonthSummaryStats = async () => {

    const monthLogs = await fetchPastMonthLogs();
    const prevMonthLogs = await FecthPrevMonthLogs();

    let bookingsByFacility =  {};
    let issuesByFacility = {};

    let totalB = 0;
    let totalI = 0;
    let totalPrevB = 0;
    let totalPrevI = 0;

    prevMonthLogs.forEach(monthLog => {
        if(monthLog.eventType == "booking"){
            totalPrevB++;
        }
        else if(monthLog.eventType == "issue"){
            totalPrevI++;
        }
    });


    monthLogs.forEach(monthLog => {
        if(monthLog.eventType == "booking"){
            if(!bookingsByFacility[monthLog.facilityId]){
                bookingsByFacility[monthLog.facilityId] = 1;
                totalB++;
            }
            else{   
            bookingsByFacility[monthLog.facilityId]++;
            totalB++;
            }
        }
        else if(monthLog.eventType == "issue"){
            if(!issuesByFacility[monthLog.facilityId]){
                issuesByFacility[monthLog.facilityId] = 1;
                totalI++;
            }
            else{
                issuesByFacility[monthLog.facilityId]++;
                totalI++;
            } 
        }
    });

    let dataBookings = [];
    let dataIssues = [];

    Object.keys(bookingsByFacility).forEach(facility => {
        bookingsByFacility[facility] = Math.round((bookingsByFacility[facility]/totalB)*100);

        if(!bookingsByFacility[facility]){
            dataBookings.push({name: facility, value: 0});
        }
        else {
            dataBookings.push({name: facility, value: bookingsByFacility[facility]});
        }
    });

    Object.keys(issuesByFacility).forEach(facility => {
        issuesByFacility[facility] =  Math.round((issuesByFacility[facility]/totalI)*100);

        if(!issuesByFacility[facility]){
            dataIssues.push({name: facility, value: 0});
        }
        else{
            dataIssues.push({name: facility, value: issuesByFacility[facility]});
        }

    });

    let bookingsChange = Math.round(((totalB - totalPrevB)/totalPrevB))*100 + "%";
    let issuesChange = Math.round(((totalI - totalPrevI)/totalPrevI))*100 + "%";

    const bookingsChangeNum = totalB - totalPrevB;
    const issuesChangeNum = totalI - totalPrevI;

    if(totalPrevB === 0){
        bookingsChange = "+" + totalB + " bookings";
    }
    if(totalPrevB === 0){
        issuesChange = "+" + totalI + " issues";
    }


    const stats = {
        bookingsPieChart: dataBookings, issuesPieChart: dataIssues, totalBookings: totalB, 
        totalIssues: totalI, bookingsChange: bookingsChangeNum, issuesChange: issuesChangeNum
    };
    
    console.log("Stats: ", stats);
    return stats;
}