// src/utils/templates.ts

export const templates: Record<string, string> = {
  // 1. OTP Template
  otp: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Verification Code</title>
        <style>
          body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); }
          .header { background-color: #4a90e2; color: #ffffff; padding: 30px; text-align: center; }
          .content { padding: 40px 30px; text-align: center; color: #333333; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4a90e2; background-color: #f0f7ff; padding: 15px; border-radius: 4px; display: inline-block; margin: 20px 0; border: 1px dashed #4a90e2; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Verify Your Account</h1></div>
          <div class="content">
            <p>Hello <strong><%= name %></strong>,</p>
            <p>Thank you for joining <strong>Jersy Shop</strong>. Use the code below to verify your account. Valid for 2 minutes.</p>
            <div class="otp-code"><%= otp %></div>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer"><p>&copy; 2026 Jersy Shop. All rights reserved.</p></div>
        </div>
      </body>
    </html>
  `,

  // 2. Auth Redirect (Google)
  googleRedirect: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Redirecting to Google</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f7f9; }
        </style>
      </head>
      <body>
        <div class="loader"><p>Redirecting to Google...</p></div>
        <script>
          (async () => {
            try {
              const response = await fetch("<%= betterAuthUrl %>/api/auth/sign-in/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: "google", callbackURL: "<%= callbackUrl %>" }),
              });
              const data = await response.json();
              if (data.url) window.location.href = data.url;
              else document.body.innerHTML = "<p>Error: Could not get redirect URL</p>";
            } catch (error) {
              document.body.innerHTML = "<p>Authentication failed. Please try again.</p>";
            }
          })();
        </script>
      </body>
    </html>
  `,
};
