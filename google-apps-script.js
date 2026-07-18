/**
 * Google Apps Script Code for Nehal Chauhan's Portfolio Backend
 * -------------------------------------------------------------
 * This script handles:
 * 1. Contact form submissions (original functionality)
 * 2. Visitor count tracking
 * 3. Chatbot message logging
 * 4. Secure admin dashboard data retrieval
 * 
 * Setup Instructions:
 * 1. Open the Google Sheet currently linked to your contact form.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any existing code and paste this script.
 * 4. Change ADMIN_PASSWORD to a secure password of your choice.
 * 5. Save the project (click the floppy disk icon).
 * 6. Click "Deploy" (top right) > "Manage Deployments".
 * 7. Click the Edit (pencil) icon next to your active deployment.
 * 8. Under "Version", select "New version".
 * 9. Ensure "Execute as" is set to "Me" and "Who has access" is set to "Anyone".
 * 10. Click "Deploy" and copy the Web App URL (ensure it matches the URL in your code).
 */

// CHANGE THIS: Set a secure password for your admin page
const ADMIN_PASSWORD = "";

/**
 * Handle POST Requests
 * Used for: Form submission, tracking visits, logging chatbot messages
 */
function doPost(e) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Robust payload parser to handle both JSON and Form Data
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonError) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    // Fallback in case parameter parser succeeded but data was populated in e.parameter
    if (!data.action && e.parameter && e.parameter.action) {
      data = e.parameter;
    }

    const action = data.action || 'contact_form';

    // ACTION 1: Track Visit
    if (action === 'track_visit') {
      let sheet = spreadsheet.getSheetByName("Visits");
      if (!sheet) {
        sheet = spreadsheet.insertSheet("Visits");
        sheet.appendRow(["Timestamp", "Location", "Timezone", "Device Type", "Browser & OS", "Referrer", "Query Params", "Visit ID"]);
      }

      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const location = data.location || "Unknown Location";
      const timezone = data.timezone || "Unknown Timezone";
      const device = data.device || "Unknown Device";
      const browserOs = data.browserOs || "Unknown Browser/OS";
      const referrer = data.referrer || "Direct";
      const query = data.query || "None";
      const visitId = data.visitId || "unknown";

      sheet.appendRow([timestamp, location, timezone, device, browserOs, referrer, query, visitId]);

      return ContentService.createTextOutput(JSON.stringify({
        success: true
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION 1.5: Track Engagement Events
    if (action === 'track_event') {
      let sheet = spreadsheet.getSheetByName("Events");
      if (!sheet) {
        sheet = spreadsheet.insertSheet("Events");
        sheet.appendRow(["Timestamp", "Visit ID", "Event Name", "Event Detail"]);
      }

      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const visitId = data.visitId || "unknown";
      const eventName = data.eventName || "unknown";
      const eventDetail = data.eventDetail || "";

      sheet.appendRow([timestamp, visitId, eventName, eventDetail]);

      return ContentService.createTextOutput(JSON.stringify({
        success: true
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION 2: Log Chatbot Message
    if (action === 'log_chat') {
      let sheet = spreadsheet.getSheetByName("Chats");
      if (!sheet) {
        sheet = spreadsheet.insertSheet("Chats");
        sheet.appendRow(["Timestamp", "Session ID", "Sender", "Message"]);
      }

      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const sessionId = data.sessionId || "unknown";
      const sender = data.sender || "unknown";
      const message = data.message || "";

      sheet.appendRow([timestamp, sessionId, sender, message]);

      return ContentService.createTextOutput(JSON.stringify({
        success: true
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION 3: Contact Form Submission (Existing Functionality)
    let sheet = spreadsheet.getSheetByName("Contacts");
    if (!sheet) {
      sheet = spreadsheet.insertSheet("Contacts");
      sheet.appendRow(["Timestamp", "Name", "Email", "Message"]);
    }

    const timestamp = data.timestamp || new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const name = data.name || "";
    const email = data.email || "";
    const message = data.message || "";

    sheet.appendRow([timestamp, name, email, message]);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Contact form submitted successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET Requests
 * Used for: Securely fetching dashboard stats & chat logs
 */
function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const action = e.parameter.action;
    const password = e.parameter.password;

    // Security check
    if (password !== ADMIN_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Unauthorized: Invalid password"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION: Get Admin Dashboard Data
    if (action === 'get_data') {
      // 1. Get Visits Count and Recent Logs
      let visitsSheet = spreadsheet.getSheetByName("Visits");
      let totalVisits = 0;
      let visits = [];
      if (visitsSheet) {
        const rows = visitsSheet.getDataRange().getValues();
        
        // Filter out empty rows (where timestamp is empty)
        let validRows = [];
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] && rows[i][0].toString().trim() !== "") {
            validRows.push(rows[i]);
          }
        }
        totalVisits = validRows.length;
        
        // Retrieve last 300 logs for the dashboard to keep load times lightweight
        const startIndex = Math.max(0, validRows.length - 300);
        for (let i = validRows.length - 1; i >= startIndex; i--) {
          const r = validRows[i];
          visits.push({
            timestamp: r[0],
            location: r[1] || "Unknown Location",
            timezone: r[2] || "Unknown Timezone",
            device: r[3] || "Unknown Device",
            browserOs: r[4] || "Unknown Browser/OS",
            referrer: r[5] || "Direct",
            query: r[6] || "None"
          });
        }
      }

      // 2. Get Chats history
      let chatsSheet = spreadsheet.getSheetByName("Chats");
      let chats = [];
      if (chatsSheet) {
        const rows = chatsSheet.getDataRange().getValues();
        // Skip header row and check for valid session ID to filter out empty rows
        for (let i = 1; i < rows.length; i++) {
          const sessionId = rows[i][1];
          if (sessionId && sessionId.toString().trim() !== "") {
            chats.push({
              timestamp: rows[i][0],
              sessionId: sessionId,
              sender: rows[i][2] || "unknown",
              message: rows[i][3] || ""
            });
          }
        }
      }

      // 3. Get Contact Form Submissions
      let contactsSheet = spreadsheet.getSheetByName("Contacts");
      let contacts = [];
      if (contactsSheet) {
        const rows = contactsSheet.getDataRange().getValues();
        // Skip header row and verify name is not empty
        for (let i = 1; i < rows.length; i++) {
          const name = rows[i][1];
          if (name && name.toString().trim() !== "") {
            contacts.push({
              timestamp: rows[i][0],
              name: name,
              email: rows[i][2] || "",
              message: rows[i][3] || ""
            });
          }
        }
      }

      // 4. Get Engagement Events
      let eventsSheet = spreadsheet.getSheetByName("Events");
      let events = [];
      if (eventsSheet) {
        const rows = eventsSheet.getDataRange().getValues();
        // Skip header row and check for valid visit ID
        for (let i = 1; i < rows.length; i++) {
          const visitId = rows[i][1];
          if (visitId && visitId.toString().trim() !== "") {
            events.push({
              timestamp: rows[i][0],
              visitId: visitId,
              eventName: rows[i][2] || "unknown",
              eventDetail: rows[i][3] || ""
            });
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        totalVisits: totalVisits,
        visits: visits,
        chats: chats,
        contacts: contacts,
        events: events
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Invalid action"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS Requests (for CORS preflight checks)
 */
function doOptions(e) {
  const output = ContentService.createTextOutput();
  return output;
}
