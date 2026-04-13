const transporter = require('../utils/emailTransporter');
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

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return res.status(500).json({
      error: 'Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD.',
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

    await transporter.sendMail({
      from: `"ISOP Platform" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Registration Confirmed - ${eventTitle}`,
      html: htmlContent,
    });

    console.log(
      `✅ Enrollment email sent to ${userEmail} for event: ${eventTitle}`,
    );
    return res
      .status(200)
      .json({ success: true, message: `Email sent to ${userEmail}` });
  } catch (error) {
    console.error('Email Controller Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
