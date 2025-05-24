const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/send-receipt', async (req, res) => {
  const { name, email, product, price, quantity, tracking_number } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
      }
    });

    const amount = (parseFloat(price) * parseFloat(quantity)).toFixed(2);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Receipt for ${product}`,
      text: `
        Hello ${name},

        Thank you for your order! Your order is dispatched and will be delivered soon.
        Here are the details of your order:

        Product: ${product}
        Price: Rs.${price}
        Quantity: ${quantity}
        Total Amount: Rs.${amount}
        Tracking#: ${tracking_number}

        Regards,
        Your Company
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent' });

  } catch (error) {
    console.error('Email failed:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




