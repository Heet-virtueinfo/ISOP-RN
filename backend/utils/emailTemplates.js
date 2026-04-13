/**
 * Generates a professional HTML email for event enrollment confirmation.
 * @param {Object} data
 * @param {string} data.userName
 * @param {string} data.eventTitle
 * @param {string} data.eventDate
 * @param {string} data.eventLocation
 * @param {string} data.eventType
 */
const getEnrollmentConfirmationTemplate = ({
  userName,
  eventTitle,
  eventDate,
  eventLocation,
  eventType,
  eventStartDate,
  eventEndDate,
  eventDescription,
}) => {
  const typeLabel = eventType
    ? eventType.charAt(0).toUpperCase() + eventType.slice(1)
    : 'Event';

  // Helper to format ISO dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatGCalDate = isoStr => {
    if (!isoStr) return '';
    return isoStr.replace(/[-:]|\.\d{3}/g, '');
  };

  const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    eventTitle,
  )}&dates=${formatGCalDate(eventStartDate)}/${formatGCalDate(
    eventEndDate,
  )}&details=${encodeURIComponent(
    eventDescription || '',
  )}&location=${encodeURIComponent(eventLocation)}`;

  // Extract date components for the premium calendar box
  let month = 'APR';
  let day = '09';
  try {
    const parts = eventDate.split(' ');
    if (parts.length > 2) {
      month = parts[1].toUpperCase().substring(0, 3);
      day = parts[2].replace(',', '').padStart(2, '0');
    }
  } catch (e) {
    /* fallback to defaults */
  }

  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    eventLocation,
  )}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reserved: ${eventTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      background-color: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding-bottom: 40px;
    }

    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-spacing: 0;
      color: #1e293b;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .header-bar {
      background-color: #ffffff;
      border-bottom: 1px solid #f1f5f9;
      padding: 24px 40px;
    }

    .content { padding: 40px; }

    .event-card {
      background-color: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      padding: 0;
      margin: 32px 0;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
    }

    .button {
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      display: inline-block;
      text-align: center;
      min-width: 180px;
    }

    .btn-secondary {
      background-color: #ffffff;
      color: #4f46e5 !important;
      border: 1px solid #4f46e5;
    }

    @media screen and (max-width: 600px) {
      .content { padding: 30px 20px !important; }
      .header-bar { padding: 20px !important; }
      .mobile-stack { display: block !important; width: 100% !important; padding: 10px 0 !important; text-align: center !important; }
      .mobile-full-width { width: 100% !important; min-width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%" cellpadding="0" cellspacing="0">
      <!-- Top Branding Bar -->
      <tr>
        <td class="header-bar">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="left">
                <span style="font-size: 14px; font-weight: 800; color: #1e293b; letter-spacing: 1px; text-transform: uppercase;">ISOP</span>
              </td>
              <td align="right">
                <span style="background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #d1fae5;">
                  Confirmed
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Hero Message -->
      <tr>
        <td class="content">
          <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.2;">Hi ${userName},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #64748b; margin: 0;">Your registration for <strong>${eventTitle}</strong> has been successfully processed. We've reserved your spot!</p>

          <!-- Ticket Card -->
          <table class="event-card" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 24px; background-color: #fafafa; border-bottom: 1px solid #f1f5f9;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <!-- Calendar Box -->
                    <td width="60" style="padding-right: 20px;">
                      <table cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: white; text-align: center;">
                        <tr>
                          <td style="background-color: #ef4444; color: white; font-size: 10px; font-weight: 800; padding: 4px 8px; width: 50px;">
                            ${month}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size: 22px; font-weight: 800; color: #1e293b; padding: 6px 0;">
                            ${day}
                          </td>
                        </tr>
                      </table>
                    </td>
                    <!-- Event Info -->
                    <td>
                      <p style="margin: 0; font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                        ${typeLabel}
                      </p>
                      <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                        ${eventTitle}
                      </h3>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Summary Row -->
            <tr>
              <td style="padding: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Schedule</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #334155;">${eventDate}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Venue</p>
                      <a href="${mapLink}" style="margin: 0; font-size: 14px; font-weight: 600; color: #4f46e5; text-decoration: none; border-bottom: 1px dotted #4f46e5;">
                        ${eventLocation} ↗
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- App Call to Action -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding-top: 8px;">
                <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">You can access your entry ticket and the guest list directly in the app.</p>
                
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="mobile-stack" style="padding: 0 10px;">
                            <a href="https://isop-platform.com" class="button mobile-full-width">Open ISOP App</a>
                          </td>
                          <td class="mobile-stack" style="padding: 0 10px;">
                            <a href="${gCalUrl}" class="button btn-secondary mobile-full-width">
                              Add to Calendar
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Sub-Footer -->
      <tr>
        <td style="padding: 0 40px 40px 40px; text-align: center;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #f1f5f9; padding-top: 30px;">
            <tr>
              <td>
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                  This is an automated delivery for your enrollment at ${eventTitle}.<br/>
                  Need help? Contact our support team at <a href="mailto:support@virtueinfo.com" style="color: #4f46e5; text-decoration: none;">support@virtueinfo.com</a>
                </p>
                <p style="margin: 16px 0 0 0; font-size: 12px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px;">
                  © ${new Date().getFullYear()} ISOP · Virtue Info Solutions
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
  `.trim();
};

module.exports = { getEnrollmentConfirmationTemplate };
