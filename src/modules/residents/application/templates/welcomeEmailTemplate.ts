export interface WelcomeEmailTemplateOptions {
  name: string;
  email: string;
  unitName: string;
  temporaryPassword: string;
  societyName?: string;
  clientUrl?: string;
}

export function buildWelcomeEmailTemplate(options: WelcomeEmailTemplateOptions): {
  subject: string;
  html: string;
} {
  const societyName = options.societyName || process.env.SOCIETY_NAME || "Civic Horizon";
  const clientUrl = options.clientUrl || process.env.CLIENT_URL || "http://localhost:5173";

  return {
    subject: `Welcome to ${societyName} - Your Account Credentials`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <div style="background-color: #1a1f36; padding: 24px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Welcome to ${societyName}!</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-top: 0;">Hello <strong>${options.name}</strong>,</p>
            <p style="font-size: 15px; color: #555;">
              An account has been created for you as a resident of unit <strong>${options.unitName}</strong> at ${societyName}.
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #1a1f36; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;"><strong>Your Login Credentials:</strong></p>
              <p style="margin: 0 0 6px 0; font-size: 15px;"><strong>Email:</strong> ${options.email}</p>
              <p style="margin: 0; font-size: 15px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1a1f36;">${options.temporaryPassword}</span></p>
            </div>

            <p style="font-size: 14px; color: #666;">
              Please log in to your account using your temporary password. You will be prompted to reset your password upon your first login.
            </p>

            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="${clientUrl}/login" style="background-color: #1a1f36; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">
                Log In to Your Account
              </a>
            </div>
          </div>
          <div style="background-color: #f1f3f5; padding: 16px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${societyName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };
}
