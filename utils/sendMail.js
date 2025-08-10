import nodemailer from 'nodemailer';

export const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use smtp
    auth: {
      user:process.env.GMAIL_ID,
      pass: process.env.GMAIL_PASS
    }
  });

  const mailOptions = {
    from: `Mappi {process.env.GMAIL_ID}`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It expires in 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
};
