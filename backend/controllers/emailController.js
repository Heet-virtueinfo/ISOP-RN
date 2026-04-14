const brevo = require('../utils/emailTransporter');
const {
  getEnrollmentConfirmationTemplate,
} = require('../utils/emailTemplates');
require('dotenv').config();

exports.sendEnrollmentEmail = async (req, res) => {
  const {
    userEmail,
    userName,
    eventTitle,
    eventDate,
    eventLocation,
    eventType,
    eventStartDate,
    eventEndDate,
    eventDescription,
  } = req.body;

  if (
    !userEmail ||
    !userName ||
    !eventTitle ||
    !eventDate ||
    !eventLocation ||
    !eventStartDate ||
    !eventEndDate
  ) {
    return res.status(400).json({
      error:
        'Missing required fields: userEmail, userName, eventTitle, eventDate, eventLocation, eventStartDate, eventEndDate',
    });
  }

  if (!process.env.BREVO_API_KEY) {
    return res.status(500).json({
      error: 'Email service not configured. Set BREVO_API_KEY.',
    });
  }

  try {
    const htmlContent = getEnrollmentConfirmationTemplate({
      userName,
      eventTitle,
      eventDate,
      eventLocation,
      eventType: eventType || 'event',
      eventStartDate,
      eventEndDate,
      eventDescription: eventDescription || '',
    });

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: `Registration Confirmed - ${eventTitle}`,
      sender: {
        name: 'ISOP Platform',
        email: process.env.BREVO_SENDER_EMAIL || 'heet.virtueinfo@gmail.com',
      },
      to: [
        {
          email: userEmail,
          name: userName,
        },
      ],
      htmlContent: htmlContent,
    });

    console.log(
      `✅ Enrollment email sent via Brevo to ${userEmail} for event: ${eventTitle}`,
    );
    return res.status(200).json({
      success: true,
      message: `Email sent to ${userEmail}`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Email Controller Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
