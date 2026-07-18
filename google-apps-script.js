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
        sheet.appendRow(["Total Visits"]);
        sheet.appendRow([0]);
      }

      const range = sheet.getRange("A2");
      const currentCount = Number(range.getValue()) || 0;
      const newCount = currentCount + 1;
      range.setValue(newCount);

      const response = ContentService.createTextOutput(JSON.stringify({
        success: true,
        count: newCount
      })).setMimeType(ContentService.MimeType.JSON);

      return response;
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
      // 1. Get Visits Count
      let visitsSheet = spreadsheet.getSheetByName("Visits");
      let totalVisits = 0;
      if (visitsSheet) {
        totalVisits = Number(visitsSheet.getRange("A2").getValue()) || 0;
      }

      // 2. Get Chats history
      let chatsSheet = spreadsheet.getSheetByName("Chats");
      let chats = [];
      if (chatsSheet) {
        const rows = chatsSheet.getDataRange().getValues();
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
          chats.push({
            timestamp: rows[i][0],
            sessionId: rows[i][1],
            sender: rows[i][2],
            message: rows[i][3]
          });
        }
      }

      // 3. Get Contact Form Submissions
      let contactsSheet = spreadsheet.getSheetByName("Contacts");
      let contacts = [];
      if (contactsSheet) {
        const rows = contactsSheet.getDataRange().getValues();
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
          contacts.push({
            timestamp: rows[i][0],
            name: rows[i][1],
            email: rows[i][2],
            message: rows[i][3]
          });
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        totalVisits: totalVisits,
        chats: chats,
        contacts: contacts
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
