const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a welcome email to a newly registered user
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 */
async function sendWelcomeEmail(email, name) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'WayConnectX <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to WayConnectX!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1>Welcome to WayConnectX, ${name}!</h1>
          <p>We're excited to have you on board. WayConnectX is the premier platform for connecting talent with projects.</p>
          <p>Get started by completing your profile and exploring available projects.</p>
          <a href="http://localhost:3000/profile" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Your Profile</a>
          <p>Happy networking!</p>
          <p>The WayConnectX Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend Email Error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email caught error:', error);
    return false;
  }
}

/**
 * Sends a notification for a new connection request
 * @param {string} email - Recipient email
 * @param {string} senderName - Name of the person connecting
 */
async function sendConnectionRequestEmail(email, senderName) {
  try {
    await resend.emails.send({
      from: 'WayConnectX <notifications@resend.dev>',
      to: email,
      subject: 'New Connection Request',
      html: `
        <div style="font-family: sans-serif;">
          <h2>Hello!</h2>
          <p><strong>${senderName}</strong> wants to connect with you on WayConnectX.</p>
          <p>Check your dashboard to accept the request.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Connection email error:', error);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendConnectionRequestEmail
};
