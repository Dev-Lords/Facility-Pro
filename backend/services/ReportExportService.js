// ReportExportService.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Converts an array of objects to CSV format
 * @param {Array} array - Array of objects to convert
 * @returns {string} CSV formatted string
 */
const arrayToCSV = (array) => {
  if (!array || array.length === 0) {
    return '';
  }
  
  // Get headers from first object
  const headers = Object.keys(array[0]);
  
  // Create CSV header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  for (const item of array) {
    const values = headers.map(header => {
      const cell = item[header];
      
      // Handle arrays in cells
      if (Array.isArray(cell)) {
        return `"${cell.join(', ')}"`;
      }
      
      // Handle null or undefined
      if (cell === null || cell === undefined) {
        return '';
      }
      
      // Handle strings with commas by wrapping in quotes
      if (typeof cell === 'string' && cell.includes(',')) {
        return `"${cell}"`;
      }
      
      return cell;
    });
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

/**
 * Generates complete CSV content from all data types
 * @param {Object} data - Data object containing bookings, events, and issues
 * @returns {string} Complete CSV content
 */
const generateCSVContent = (data) => {
  const { bookings, events, issues } = data;
  let content = '';
  
  // Add bookings section
  if (bookings && bookings.length > 0) {
    content += '# BOOKINGS\n';
    content += arrayToCSV(bookings);
    content += '\n\n';
  }
  
  // Add events section
  if (events && events.length > 0) {
    content += '# EVENTS\n';
    content += arrayToCSV(events);
    content += '\n\n';
  }
  
  // Add issues section
  if (issues && issues.length > 0) {
    content += '# ISSUES\n';
    content += arrayToCSV(issues);
  }
  
  return content;
};

/**
 * Formats a date string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date or placeholder
 */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString || '-'; // Return original string if parsing fails
  }
};

/**
 * Generates PDF-friendly table data from an array of objects
 * @param {Array} array - Array of objects to convert
 * @returns {Object} Object with headers and data for jsPDF-AutoTable
 */
const arrayToPDFTable = (array) => {
  if (!array || array.length === 0) {
    return { headers: [], data: [] };
  }
  
  // Get headers from first object and format them for display
  const headers = Object.keys(array[0]).map(header => {
    // Convert camelCase or snake_case to Title Case
    return header
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  });
  
  // Format data rows
  const data = array.map(item => {
    return Object.keys(item).map(header => {
      let cellValue = item[header];
      
      // Format date fields
      if (header.toLowerCase().includes('date')) {
        cellValue = formatDate(cellValue);
      }
      
      // Handle arrays
      if (Array.isArray(cellValue)) {
        cellValue = cellValue.join(', ');
      }
      
      // Handle null or undefined
      if (cellValue === null || cellValue === undefined) {
        cellValue = '-';
      }
      
      // Convert objects to string representation
      if (typeof cellValue === 'object') {
        try {
          cellValue = JSON.stringify(cellValue);
        } catch (e) {
          cellValue = '[Object]';
        }
      }
      
      return String(cellValue); // Ensure all values are strings
    });
  });
  
  return { headers, data };
};

/**
 * Exports data to CSV file and triggers download
 * @param {string} filename - Name of the file to download
 * @param {Object} data - Data object containing bookings, events, and issues
 * @returns {Promise} Promise that resolves when the file is downloaded
 */
export const exportToCSV = (filename, data) => {
  return new Promise((resolve, reject) => {
    try {
      // Generate CSV content
      const csvContent = generateCSVContent(data);
      
      // Create a Blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Set up the download
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      
      // Add to document, trigger click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve();
      }, 100);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Exports data to PDF file and triggers download
 * @param {string} filename - Name of the file to download
 * @param {Object} data - Data object containing bookings, events, and issues
 * @returns {Promise} Promise that resolves when the file is downloaded
 */
export const exportToPDF = (filename, data) => {
  return new Promise((resolve, reject) => {
    try {
      const { bookings, events, issues } = data;
      const dateStr = new Date().toLocaleDateString();
      
      // Create new PDF document (landscape orientation for wider tables)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text('Dashboard Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated on ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      
      let yPos = 30;
      
      // Add bookings section if available
      if (bookings && bookings.length > 0) {
        doc.setFontSize(14);
        doc.text('Facility Bookings', 14, yPos);
        yPos += 8;
        
        const bookingsTable = arrayToPDFTable(bookings);
        
        // Configure and draw the table
        doc.autoTable({
          startY: yPos,
          head: [bookingsTable.headers],
          body: bookingsTable.data,
          theme: 'grid',
          headStyles: { 
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            overflow: 'linebreak',
            cellWidth: 'auto',
            fontSize: 8
          },
          columnStyles: {
            // You can customize specific columns here if needed
          },
          margin: { top: 30 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // Add events section if available
      if (events && events.length > 0) {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Upcoming Events', 14, yPos);
        yPos += 8;
        
        const eventsTable = arrayToPDFTable(events);
        doc.autoTable({
          startY: yPos,
          head: [eventsTable.headers],
          body: eventsTable.data,
          theme: 'grid',
          headStyles: { 
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            overflow: 'linebreak',
            cellWidth: 'auto',
            fontSize: 8
          },
          margin: { top: 30 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // Add issues section if available
      if (issues && issues.length > 0) {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Maintenance Issues', 14, yPos);
        yPos += 8;
        
        const issuesTable = arrayToPDFTable(issues);
        doc.autoTable({
          startY: yPos,
          head: [issuesTable.headers],
          body: issuesTable.data,
          theme: 'grid',
          headStyles: { 
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            overflow: 'linebreak',
            cellWidth: 'auto',
            fontSize: 8
          },
          margin: { top: 30 }
        });
      }
      
      // Save the PDF and trigger download
      doc.save(`${filename}.pdf`);
      resolve();
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};