const nodemailer = require("nodemailer");

// ICON URLS //
const locationIcon =
  "https://res.cloudinary.com/dcm3jmdwd/image/upload/v1767770409/location_rgpplv.png";
const calendarIcon =
  "https://res.cloudinary.com/dcm3jmdwd/image/upload/v1767770280/calendar_uumdti.png";
const clockIcon =
  "https://res.cloudinary.com/dcm3jmdwd/image/upload/v1767770421/clock_ok9uwa.png";
const peopleIcon =
  "https://res.cloudinary.com/dcm3jmdwd/image/upload/v1767770280/people_eqr8sx.png";
const roomIcon =
  "https://res.cloudinary.com/dcm3jmdwd/image/upload/v1767770361/hall_vbizf1.jpg";

// CREATE TRANSPORTER //
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("✅ Email transporter configured");
} else {
  console.warn(
    "⚠️ EMAIL NOT CONFIGURED: EMAIL_USER and EMAIL_PASS required in .env file"
  );
}

// EMAIL TEMPLATE //
const generateHotelBookingEmailHTML = ({
  userName = "there",
  hotelName,
  hotelImage = null,
  roomType,
  checkInDate,
  checkOutDate,
  guests = 1,
  totalAmount,
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hotel Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f0fdf4;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
<tr>
<td align="center">
<table width="550" style="background:#fff;border-radius:12px;overflow:hidden;">
  
  <!-- Header -->
  <tr>
    <td style="background:#065f46;padding:25px;">
      <h1 style="margin:0;color:#fff;font-size:30px;">Getaway</h1>
      <p style="margin:6px 0 0;color:#d1fae5;">Hotel Booking Confirmation</p>
    </td>
  </tr>

  <!-- Greeting -->
  <tr>
    <td style="padding:25px;">
      <p style="margin:0;font-size:16px;">Hello ${userName} 👋</p>
      <p style="margin-top:10px;color:#6b7280;">
        Your hotel booking has been successfully confirmed. We’re excited to host you!
      </p>
    </td>
  </tr>

  <!-- Booking Card -->
  <tr>
    <td style="padding:0 25px 25px;">
      <table width="100%" style="border:1px solid #d1fae5;border-radius:12px;">
        <tr>
          <td style="padding:20px;">
            <table width="100%">
              <tr>
                <!-- Hotel Image -->
                <td width="140" valign="top">
                  ${
                    hotelImage
                      ? `<img src="${hotelImage}" style="width:140px;height:180px;border-radius:8px;object-fit:cover;" />`
                      : `<div style="width:140px;height:180px;background:#ecfdf5;border-radius:8px;"></div>`
                  }
                </td>

                <!-- Details -->
                <td style="padding-left:18px;" valign="top">
                  <h2 style="margin:0 0 12px;">${hotelName}</h2>

                  <p style="margin:6px 0;">
                    <img src="${locationIcon}" width="14" /> ${roomType}
                  </p>

                  <p style="margin:6px 0;">
                    <img src="${calendarIcon}" width="14" />
                    Check-in: ${checkInDate}
                  </p>

                  <p style="margin:6px 0;">
                    <img src="${clockIcon}" width="14" />
                    Check-out: ${checkOutDate}
                  </p>

                  <p style="margin:6px 0;">
                    <img src="${peopleIcon}" width="14" />
                    Guests: ${guests}
                  </p>

                  <hr style="margin:14px 0;" />

                  <p style="margin:0;font-size:18px;font-weight:700;color:#065f46;">
                    Total: ₹${totalAmount}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:20px;text-align:center;">
      <p style="font-size:12px;color:#6b7280;">
        We wish you a relaxing stay 🏨
      </p>
      <p style="font-size:11px;">
        © 2024 Getaway. All rights reserved.
      </p>
    </td>
  </tr>

</table>
</td>
</tr>
</table>
</body>
</html>
`;
};

// SEND EMAIL //
const sendHotelBookingEmail = async ({
  to,
  userName,
  hotelName,
  hotelImage,
  roomType,
  checkInDate,
  checkOutDate,
  guests,
  totalAmount,
}) => {
  if (!transporter) throw new Error("Email service not configured");

  const html = generateHotelBookingEmailHTML({
    userName,
    hotelName,
    hotelImage,
    roomType,
    checkInDate,
    checkOutDate,
    guests,
    totalAmount,
  });

  return transporter.sendMail({
    from: `"Getaway" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🏨 Booking Confirmed at ${hotelName}`,
    html,
  });
};

module.exports = sendHotelBookingEmail;
