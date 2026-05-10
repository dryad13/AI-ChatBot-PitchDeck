const { Resend } = require('resend');

exports.handler = async (event) => {
  // Replace with your Resend API Key from Netlify Environment Variables
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'System <notifications@verification.insurgo.systems>',
      to: ['operations@insurgo.systems'],
      subject: '🚨 Pitch Deck Accessed',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #fb0c0c;">Pitch Deck Access Notification</h2>
          <p>Your client has just unlocked the AI Chatbot Pitch Deck.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    if (error) {
      return { statusCode: 400, body: JSON.stringify(error) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
