// Shared email template function for all emails
export function buildEmailTemplate(content: string, logoUrl?: string): string {
  // Default logo URL - can be overridden
  const logo = logoUrl || "https://madrasahabubakr.com.au/logo.png"
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Madrasah Abu Bakr As-Siddiq</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #1a472a; padding: 30px 20px; text-align: center;">
              <img src="${logo}" alt="Madrasah Abu Bakr As-Siddiq" style="max-width: 200px; height: auto; margin-bottom: 10px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Madrasah Abu Bakr As-Siddiq</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
              <div style="color: #333333; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px; line-height: 1.5;">
                This is an email from Madrasah Abu Bakr As-Siddiq.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">
                If you have any questions, please contact us at <a href="mailto:madrasahabubakr1@gmail.com" style="color: #1a472a; text-decoration: none;">madrasahabubakr1@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

