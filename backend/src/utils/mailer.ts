import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Email gửi
            pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng
        },
    });

    const mailOptions = {
        from: '"Fashion Store" <no-reply@fashionstore.com>',
        to: email,
        subject: '🔐 Mã xác thực OTP – Đặt lại mật khẩu',
        html: `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f9fafb; padding:20px;">
      <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:8px; padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.05)">
        
        <h2 style="color:#111827; text-align:center; margin-bottom:16px;">
          🔐 Xác thực đặt lại mật khẩu
        </h2>

        <p style="color:#374151; font-size:14px;">
          Xin chào,
        </p>

        <p style="color:#374151; font-size:14px;">
          Bạn vừa yêu cầu <b>đặt lại mật khẩu</b> cho tài khoản tại <b>Fashion Store</b>.
          Vui lòng sử dụng mã OTP bên dưới để tiếp tục:
        </p>

        <div style="text-align:center; margin:24px 0;">
          <span style="
            display:inline-block;
            font-size:28px;
            letter-spacing:6px;
            font-weight:bold;
            color:#111827;
            background:#f3f4f6;
            padding:12px 24px;
            border-radius:6px;
          ">
            ${otp}
          </span>
        </div>

        <p style="color:#374151; font-size:14px;">
          ⏱ <b>Thời hạn:</b> 5 phút<br/>
          🔁 <b>Số lần nhập tối đa:</b> 5 lần
        </p>

        <p style="color:#b91c1c; font-size:13px; margin-top:12px;">
          ⚠️ Nếu nhập sai quá 5 lần, mã OTP sẽ tự động bị vô hiệu hóa.
        </p>

        <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />

        <p style="color:#6b7280; font-size:12px;">
          Nếu bạn <b>không thực hiện yêu cầu này</b>, vui lòng bỏ qua email này.
          Tuyệt đối không chia sẻ mã OTP cho bất kỳ ai.
        </p>

        <p style="color:#6b7280; font-size:12px; text-align:center; margin-top:16px;">
          © ${new Date().getFullYear()} Fashion Store. All rights reserved.
        </p>
      </div>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);
};