// ==============================
// SmartLearn Email Templates
// ==============================

// -------------------------------------------------------
// 1️⃣ Registration OTP Template
// -------------------------------------------------------
export const registrationOtpTemplate = (otp) => `
<table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5ff;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7B2FF7,#4DB5FF);padding:25px;text-align:center;">
            <h1 style="color:#fff;font-size:26px;margin:0;">SmartLearn</h1>
            <p style="color:#e8e8e8;margin:6px 0 0;font-size:14px;">Learn Smarter. Grow Faster.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px;">
            <h2 style="color:#1F1F1F;font-size:20px;margin-bottom:12px;">Your Verification Code</h2>
            <p style="color:#555;font-size:15px;margin-bottom:24px;">
              Use the OTP below to verify your email and complete your SmartLearn registration.
            </p>

            <div style="text-align:center;margin:25px 0;">
              <span style="display:inline-block;background:#7B2FF7;color:#fff;font-size:32px;letter-spacing:8px;padding:12px 28px;border-radius:10px;">
                ${otp}
              </span>
            </div>

            <p style="color:#888;font-size:13px;margin-bottom:10px;">This code is valid for 5 minutes.</p>
            <p style="color:#888;font-size:13px;">If you didn’t request this email, you can ignore it safely.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f0ff;padding:18px;text-align:center;color:#777;">
            © ${new Date().getFullYear()} SmartLearn • All Rights Reserved
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;


// -------------------------------------------------------
// 2️⃣ Resend OTP Template
// -------------------------------------------------------
export const resendOtpTemplate = (otp) => `
<table width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6ff;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        
        <tr>
          <td style="background:linear-gradient(135deg,#4DB5FF,#7B2FF7);padding:25px;text-align:center;">
            <h1 style="color:#fff;font-size:26px;margin:0;">SmartLearn</h1>
            <p style="color:#e8e8e8;margin:6px 0 0;font-size:14px;">New OTP Requested</p>
          </td>
        </tr>

        <tr>
          <td style="padding:30px;">
            <h2 style="color:#1F1F1F;font-size:20px;margin-bottom:12px;">Your New OTP Code</h2>
            <p style="color:#555;font-size:15px;margin-bottom:24px;">Here’s your latest OTP for SmartLearn email verification.</p>

            <div style="text-align:center;margin:25px 0;">
              <span style="display:inline-block;background:#4DB5FF;color:#fff;font-size:32px;letter-spacing:8px;padding:12px 28px;border-radius:10px;">
                ${otp}
              </span>
            </div>

            <p style="color:#888;font-size:13px;">This code expires in 5 minutes.</p>
          </td>
        </tr>

        <tr>
          <td style="background:#eef2ff;padding:18px;text-align:center;color:#777;">
            © ${new Date().getFullYear()} SmartLearn • OTP Resend
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;


// -------------------------------------------------------
// 3️⃣ Reset Password OTP Template
// -------------------------------------------------------
export const resetPasswordOtpTemplate = (otp) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9ff;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      <table width="600" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        
        <tr>
          <td style="background:linear-gradient(135deg,#f72585,#7209b7);padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;">SmartLearn</h1>
            <p style="color:#eee;margin:6px 0 0;">Password Reset Request</p>
          </td>
        </tr>

        <tr>
          <td style="padding:30px;">
            <h2 style="color:#333;margin-bottom:12px;">Reset Your Password</h2>
            <p style="color:#666;margin-bottom:20px;">
              Use the OTP below to confirm your SmartLearn password reset request.
            </p>

            <div style="text-align:center;margin:30px 0;">
              <span style="display:inline-block;background:#7209b7;color:#fff;font-size:32px;letter-spacing:8px;padding:14px 30px;border-radius:10px;">
                ${otp}
              </span>
            </div>

            <p style="color:#888;font-size:13px;">This OTP is valid for 5 minutes.</p>
          </td>
        </tr>

        <tr>
          <td style="background:#f3e9ff;padding:18px;text-align:center;color:#666;">
            © ${new Date().getFullYear()} SmartLearn • Password Security Team
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;


// -------------------------------------------------------
// 4️⃣ Password Reset Success Template
// -------------------------------------------------------
export const passwordResetSuccessTemplate = () => `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef3ff;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      <table width="600" style="background:#ffffff;border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">

        <tr>
          <td style="background:linear-gradient(135deg,#06d6a0,#118ab2);padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;">Password Updated</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:30px;">
            <h2 style="color:#222;margin-bottom:10px;">Your Password Has Been Reset</h2>
            <p style="color:#555;font-size:15px;margin-bottom:20px;">
              Your SmartLearn account password has been successfully changed.  
              If this wasn’t you, please contact SmartLearn support immediately.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#e5f7fc;padding:18px;text-align:center;color:#666;">
            © ${new Date().getFullYear()} SmartLearn • Security Team
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
