const { Resend } = require('resend');

exports.handler = async (event) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Extract metadata from body if available
  let meta = {};
  try {
    meta = JSON.parse(event.body || '{}');
  } catch (e) {}

  // Extract network/geo data from Netlify headers
  const ip = event.headers['x-nf-client-connection-ip'] || 'Unknown';
  const city = event.headers['x-nf-geo-city'] || 'Unknown City';
  const country = event.headers['x-nf-geo-country'] || 'Unknown Country';
  const region = event.headers['x-nf-geo-region'] || 'Unknown Region';

  try {
    const { data, error } = await resend.emails.send({
      from: 'Insurgo Notifications <notifications@verification.insurgo.systems>',
      to: ['operations@insurgo.systems'],
      subject: `🚨 Pitch Deck Accessed: ${city}, ${country}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; background-color: #f9f9f9; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eee;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #fb0c0c; margin-bottom: 8px; font-size: 24px;">Deck Access Detected</h2>
              <p style="color: #666; font-size: 14px;">A new session has been initiated for the AI Pitch Deck.</p>
            </div>
            
            <div style="background: #fcfcfc; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 15px; letter-spacing: 0.05em;">Location & Network</h3>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #888; width: 100px;">IP Address</td><td style="font-weight: 500;">${ip}</td></tr>
                <tr><td style="padding: 6px 0; color: #888;">City</td><td style="font-weight: 500;">${city}</td></tr>
                <tr><td style="padding: 6px 0; color: #888;">Region</td><td style="font-weight: 500;">${region}</td></tr>
                <tr><td style="padding: 6px 0; color: #888;">Country</td><td style="font-weight: 500;">${country}</td></tr>
              </table>
            </div>

            <div style="background: #fcfcfc; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 15px; letter-spacing: 0.05em;">Device Metadata</h3>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse; line-height: 1.5;">
                <tr><td style="padding: 6px 0; color: #888; width: 100px;">Screen</td><td style="font-weight: 500;">${meta.screen || 'Unknown'}</td></tr>
                <tr><td style="padding: 6px 0; color: #888;">Language</td><td style="font-weight: 500;">${meta.lang || 'Unknown'}</td></tr>
                <tr><td style="padding: 6px 0; color: #888;">Referrer</td><td style="font-weight: 500; word-break: break-all;">${meta.ref || 'Direct'}</td></tr>
                <tr><td style="padding: 12px 0 6px; color: #888;" colspan="2">Browser User Agent</td></tr>
                <tr><td style="padding: 4px 10px; background: #f0f0f0; border-radius: 4px; font-family: monospace; font-size: 11px; color: #555;" colspan="2">${meta.ua || 'Unknown'}</td></tr>
              </table>
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 11px; color: #aaa; text-align: center;">Timestamp: ${new Date().toUTCString()}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { statusCode: 400, body: JSON.stringify(error) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.error('Catch Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
