// This is a modification of the ReportExportService.js file to ensure exports match UI display

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// Helper function to format status with proper casing
const formatStatus = (status) => {
  return status || "Unknown";
};

// Helper function to format slots array into readable string
const formatSlots = (slots) => {
  if (!slots || !Array.isArray(slots)) return "-";
  return slots.join(", ");
};

// Helper function to format facility name (removing any ID suffix if present)
const formatFacility = (facility) => {
  return facility || "-";
};

// Helper function to prepare data for export (format it like the UI displays)
const prepareDataForExport = (rawData) => {
  const result = {};
  
  // Format bookings data if present
  if (rawData.bookings) {
    result.bookings = rawData.bookings.map(booking => ({
      Date: formatDate(booking.date),
      Facility: formatFacility(booking.facilityID),
      Status: formatStatus(booking.status),
      Slots: formatSlots(booking.bookedSlots),
    }));
  }
  
  // Format events data if present
  if (rawData.events) {
    result.events = rawData.events.map(event => ({
      Title: event.title || "Untitled Event",
      Date: formatDate(event.date),
      Location: event.location || "No location specified",
      Status: formatStatus(event.status),
      Attendees: event.attendees ? event.attendees.length : 0,
      Description: event.description || ""
    }));
  }
  
  // Format issues data if present
  if (rawData.issues) {
    result.issues = rawData.issues.map(issue => ({
      Title: issue.title || `Issue #${issue.id || "Unknown"}`,
      Description: issue.issueDescription || "No description provided",
      Priority: issue.priority || "Normal",
      Status: issue.issueStatus || "Open",
      Location: issue.location || "-",
      Reported: formatDate(issue.reportedAt)
    }));
  }
  
  return result;
};

/**
 * Export data to CSV format
 * @param {string} filename - Base name for the file (without extension)
 * @param {object} data - Raw data object containing bookings, events, and/or issues
 */
export const exportToCSV = async (filename, data) => {
  try {
    // Format the data to match UI display
    const formattedData = prepareDataForExport(data);
    
    // Prepare CSV content for each data type
    let csvContent = "";
    
    // Add bookings if present
    if (formattedData.bookings && formattedData.bookings.length > 0) {
      csvContent += "BOOKINGS\n";
      // Add headers
      csvContent += Object.keys(formattedData.bookings[0]).join(",") + "\n";
      // Add data rows
      formattedData.bookings.forEach(booking => {
        csvContent += Object.values(booking).map(value => 
          // Escape commas and quotes in the data
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",") + "\n";
      });
      csvContent += "\n"; // Add separator between sections
    }
    
    // Add events if present
    if (formattedData.events && formattedData.events.length > 0) {
      csvContent += "EVENTS\n";
      // Add headers
      csvContent += Object.keys(formattedData.events[0]).join(",") + "\n";
      // Add data rows
      formattedData.events.forEach(event => {
        csvContent += Object.values(event).map(value => 
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",") + "\n";
      });
      csvContent += "\n"; // Add separator between sections
    }
    
    // Add issues if present
    if (formattedData.issues && formattedData.issues.length > 0) {
      csvContent += "MAINTENANCE ISSUES\n";
      // Add headers
      csvContent += Object.keys(formattedData.issues[0]).join(",") + "\n";
      // Add data rows
      formattedData.issues.forEach(issue => {
        csvContent += Object.values(issue).map(value => 
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",") + "\n";
      });
    }
    
    // Create a blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link and trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw error;
  }
};

/**
 * Export data to PDF format
 * @param {string} filename - Base name for the file (without extension)
 * @param {object} data - Raw data object containing bookings, events, and/or issues
 */
export const exportToPDF = async (filename, data) => {
  try {
    // Format the data to match UI display
    const formattedData = prepareDataForExport(data);
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title to the PDF
    doc.setFontSize(18);
    doc.text('Facility Management Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    let yPosition = 40;
    
    // Add bookings table if present
    if (formattedData.bookings && formattedData.bookings.length > 0) {
      doc.setFontSize(14);
      doc.text('Facility Bookings', 14, yPosition);
      yPosition += 10;
      
      // Extract column headers and rows for jspdf-autotable
      const headers = Object.keys(formattedData.bookings[0]);
      const rows = formattedData.bookings.map(booking => Object.values(booking));
      
      // Add table to PDF
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Update position for next section
      yPosition = doc.lastAutoTable.finalY + 15;
    }
    
    // Add events table if present
    if (formattedData.events && formattedData.events.length > 0) {
      // Check if we need a new page
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Events', 14, yPosition);
      yPosition += 10;
      
      // Extract column headers and rows for jspdf-autotable
      const headers = Object.keys(formattedData.events[0]);
      const rows = formattedData.events.map(event => Object.values(event));
      
      // Add table to PDF
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Update position for next section
      yPosition = doc.lastAutoTable.finalY + 15;
    }
    
    // Add issues table if present
    if (formattedData.issues && formattedData.issues.length > 0) {
      // Check if we need a new page
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Maintenance Issues', 14, yPosition);
      yPosition += 10;
      
      // Extract column headers and rows for jspdf-autotable
      const headers = Object.keys(formattedData.issues[0]);
      const rows = formattedData.issues.map(issue => Object.values(issue));
      
      // Add table to PDF
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
    }
    
    // Save the PDF file
    doc.save(`${filename}-report.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
};