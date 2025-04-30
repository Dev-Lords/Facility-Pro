import React, {PureComponent, useState, useEffect} from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";
import "./UsageTrends.css";
import { fetchFacilityEvents } from "../../../backend/services/logService";
import { fetchMonthSummaryStats } from "../../../backend/services/logService";
import { unparse } from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function UsageTrends() {

    // All variables used to set data computed from logService Functions
    const [issuesChart, setIssuesChart] = useState(null);
    const [bookingsChart, setBookingsChart] = useState(null);
    const [totalBookings, setTotalBookings] = useState(null);
    const [totalIssues, setTotalIssues] = useState(null);
    const [bookingsChange, setBookingsChange] = useState(null);
    const [issuesChange, setIssuesChange] = useState(null);
    //______________________________________

    // Fetch all Summary Stats and set variables accordingly
    useEffect(() => {
        const getStats = async () => {
            const data = await fetchMonthSummaryStats();
            console.log(data);
            setBookingsChart(data["bookingsPieChart"]);
            setIssuesChart(data["issuesPieChart"]);
            setTotalBookings(data["totalBookings"]);
            setTotalIssues(data["totalIssues"]);
            setBookingsChange(data["bookingsChange"]);
            setIssuesChange(data["issuesChange"]);
        };

        getStats();
    }, [])

    //_______________________________

    // Fetch and set all logs from database into table
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        const waitForLogs = async () => {
            const fe = await fetchFacilityEvents();
            setLogs(fe);
        };

        waitForLogs();
    }, []);

    //________________________

    // Code for Filters to work. 
    const [eventTypeFilter, setEventTypeFilter] = useState("");
    const [facilityFilter, setFacilityFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const[endDate, setEndDate] = useState("");

    const filteredLogs = logs.filter((log) => {
        const matchesEventType = eventTypeFilter ? log.eventType === eventTypeFilter : true;
        const matchesFacility = facilityFilter ? log.facilityId === facilityFilter : true;
        const matchesStartDate = startDate ? new Date(log.timestamp.seconds*1000) >= startDate : true;
        const matchesEndDate = endDate ? new Date(log.timestamp.seconds*1000) <= endDate : true;

        return matchesEventType && matchesFacility && matchesStartDate && matchesEndDate;
    });

    const formatDateForInput = (date) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
      };
    //_________________________

    //Code for file exportation of filtered table data to work

    // CSV exportation
    const exportCSV = (l) =>
    {
        const csv = unparse(l);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'facility_logs.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    //PDF exportation

    const exportPDF = (l) => {
        const doc = new jsPDF();
    doc.text('Facility Usage Logs', 14, 15);

    const tableData = l.map(log => [
        log.eventType,
        log.facilityId,
        new Date(log.timestamp.seconds * 1000).toLocaleString()
    ]);

    autoTable(doc, {
        head: [['Event Type', 'Facility', 'Occurred At']],
        body: tableData,
        startY: 20,
    });

    doc.save('facility_logs.pdf');
    }

    //____________________________________

    
    return(
        <main className="usageTrends-main">
            {/* This is for the header, to show something, idk*/}
            <header className="usageTrends-header"><h2>Facility Trends Overview</h2></header>

            {/* This section conatins a bunch of other sections. We'll see what they are when I'm done*/}
            <section className="main-section">
                <section className="left">
                    <section className="Stats-Heading"><h2>This Month's Statistics</h2></section>
                    <section className="summaries">
                        <article className="summary-card">
                            <section className="summaryText">
                                <h3>Total Bookings This Month:</h3>
                                <h4>{totalBookings}</h4>
                                <h3>Change Of:</h3>
                                <h4>{bookingsChange}</h4>
                                <h3>From Last Month</h3>
                            </section>
                        </article>
                        <article className="summary-card">
                        <section className="summaryText">
                                <h3>Total Issues Reported This Month:</h3>
                                <h4>{totalIssues}</h4>
                                <h3>Change Of:</h3>
                                <h4>{issuesChange}</h4>
                                <h3>From Last Month</h3>
                            </section>
                        </article>
                    </section>
                    <section className="PieCharts">
                        <section className="PieChart-Bookings"> 
                            <section><h3>Proportion of Bookings by Facility</h3></section>
                              <PieChart width={300} height={300}>
                                <Pie
                                    data={bookingsChart}
                                    dataKey="value"
                                    cx={150}
                                    cy={150}
                                    outerRadius={90}
                                    fill="3d6ea8"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                />
                            </PieChart>
                        </section>
                        <section className="PieChart-Issues">
                        <section><h3>Proportion of Issue Reports by Facility</h3></section> 
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={issuesChart}
                                    dataKey="value"
                                    cx={170}
                                    cy={150}
                                    outerRadius={90}
                                    fill="ffaaff"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                />
                            </PieChart>
                        </section>
                    </section>
                </section>
                <section className="right">
                    <section className="Stats-Heading"><h2>Search And Filter Logs</h2></section>
                    <section className="filter-section">
                    <select value = {eventTypeFilter}  onChange={(e) => setEventTypeFilter(e.target.value)}>
                            <option value="">All Events</option>
                            <option value="booking">Booking</option>
                            <option value="cancellation">Cancellation</option>
                            <option value="issue">Issue</option>
                    </select>
                    <select value = {facilityFilter} onChange={(e) => setFacilityFilter(e.target.value)}>
                            <option value="">All Facilites</option>
                            <option value="pool">Pool</option>
                            <option value="gym">Gym</option>
                            <option value="soccer">Soccer Field</option>
                            <option value="basketball">Basketball Court</option>
                    </select>
                        <label>
                                From:
                                <input type = "date" value = {formatDateForInput(startDate)} onChange={(e) => setStartDate(new Date(e.target.value))}/>
                            </label>
                            <label>
                                To:
                                <input type = "date" value = {formatDateForInput(endDate)} onChange={(e) => setEndDate(new Date(e.target.value))}/>
                        </label>
                    </section>
                    <section className="Buttons">
                        <button onClick={() => exportCSV(filteredLogs)}> Export as CSV </button>
                        <button onClick={() => exportPDF(filteredLogs)}> Export as PDF </button>
                    </section>
                    <section className="table-section">
                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>Event Type</th>
                                <th>Facility</th>
                                <th>Occured At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="3">
                                No Logs found
                                </td>
                            </tr>
                            ) : (
                            filteredLogs.map((log, index) => (
                                <tr className="log-table tr" key={log.id || `log-${index}`}>
                                <td className="log-table td">{log.eventType}</td>
                                <td className="log-table td">{log.facilityId}</td>
                                <td className="log-table td">{new Date(log.timestamp.seconds * 1000).toLocaleDateString()}</td>
                                </tr>
                            ))
                            )}
                        </tbody>
                    </table>
                    </section>
                </section>
            </section>
        </main>
    );
}
