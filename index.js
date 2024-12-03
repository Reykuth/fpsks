const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Page Access Token และ Verify Token
const PAGE_ACCESS_TOKEN = "EAASuwMj9bwUBO5fhyDI5cBJly7mhDLEfXpxu7Ecguz8ajSB9FUX9McbZCo4Jw2dQHn6p0BoWglMURV1ZA31qZCZCivxf6jYW4ZAzXQRih7LTs8EbRlBmnNpWwuXlzZBtP4e6jHPeA1qzvZCHceI5ZADSkaj5ZCxXlMXnBph8ZA9I5MUdhRiZCPvs2tftrIoPwqZBVx6oJAZDZD"; // ใส่ Page Access Token จาก Facebook Developer
const VERIFY_TOKEN = "xcxc1"; // ตั้งค่า Verify Token ที่คุณต้องการ

// Middleware
app.use(bodyParser.json());

// Route สำหรับ Verify Webhook
app.get("/webhook", (req, res) => {
  console.log("GET request received:", req.query); // Debugging

  // ตรวจสอบ Verify Token
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    res.status(200).send(challenge); // ส่ง hub.challenge กลับ
  } else {
    console.log("Verification token mismatch!");
    res.status(403).send("Verification token mismatch");
  }
});

// Route สำหรับรับข้อความจาก Messenger
app.post("/webhook", (req, res) => {
  console.log("POST request received:", req.body); // Debugging

  const body = req.body;

  // ตรวจสอบว่าเป็น event จาก Messenger
  if (body.object === "page") {
    body.entry.forEach((entry) => {
      // รับข้อความจากผู้ใช้
      const webhookEvent = entry.messaging[0];
      console.log("Webhook event:", webhookEvent);

      const senderId = webhookEvent.sender.id;
      const message = webhookEvent.message;

      if (message && message.text) {
        // ตอบกลับข้อความผู้ใช้
        const responseMessage = "เงินคุณไม่มีครับ";
        sendMessage(senderId, responseMessage);
      }
    });

    // ตอบกลับสถานะ 200 ให้ Facebook
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // ไม่ใช่ event จาก Messenger
    res.status(404).send("Not Found");
  }
});

// ฟังก์ชันส่งข้อความกลับไปยังผู้ใช้
function sendMessage(senderId, message) {
  const request = require("request");
  const url = `https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const payload = {
    recipient: { id: senderId },
    message: { text: message },
  };

  request.post(
    {
      url: url,
      json: true,
      body: payload,
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log("Message sent successfully:", body);
      } else {
        console.error("Error sending message:", error || body);
      }
    }
  );
}

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
