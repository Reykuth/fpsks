const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // ใช้ axios แทน request

// ใส่ค่าโทเค็นของคุณตรงนี้
const PAGE_ACCESS_TOKEN = 'EAARffjvaCwoBO2WXe8qRvI7mrJh6V56hs73WUe68toiCIenxrTF3FX69jSqFM48WJa9JLZCWGJ0ZBncWk1fcVnHCdki3fxxCiEFJ4uGDEWZArg9qTJzuznh2rzNWsCceG5ZAWjbuqUoybwhcPEzNGBG8XjJUGxkxZAwM3RNEkNOGHwoW91EuTyIZCkOsD4fGfaWQZDZD'; // ใส่ Page Access Token ของคุณที่นี่
const VERIFY_TOKEN = 'zxcvbnM'; // ใส่ Verify Token ที่คุณตั้งเอง

if (!PAGE_ACCESS_TOKEN || !VERIFY_TOKEN) {
    console.error('Missing PAGE_ACCESS_TOKEN or VERIFY_TOKEN in the code.');
    process.exit(1);
}

const app = express().use(bodyParser.json());

// เส้นทางหลัก (สำหรับการตรวจสอบเซิร์ฟเวอร์)
app.get('/', (req, res) => {
    res.send('บอทเฟสบุ๊คกำลังทำงาน!');
});

// ตั้งค่า webhook
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// รับข้อความจากผู้ใช้
app.post('/webhook', (req, res) => {
    const body = req.body;

    // ส่ง 200 OK ทันที
    res.status(200).send('EVENT_RECEIVED');

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            const webhook_event = entry.messaging[0];
            console.log('Webhook Event:', JSON.stringify(webhook_event, null, 2));

            const sender_psid = webhook_event.sender.id;
            console.log('Sender PSID:', sender_psid);

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
    }
});

// ฟังก์ชันจัดการข้อความ
function handleMessage(sender_psid, received_message) {
    let response;

    if (received_message.text) {
        const message_text = received_message.text.trim();

        if (message_text === '/เงิน') {
            response = { "text": "เงินของคุณคือ0บาท" };
        } else {
            response = { "text": "ขอโทษครับ ฉันไม่เข้าใจคำสั่งนั้น" };
        }
    }

    callSendAPI(sender_psid, response);
}

// ฟังก์ชันจัดการ postback (ถ้ามี)
function handlePostback(sender_psid, received_postback) {
    // คุณสามารถเพิ่มการจัดการ postback ได้ที่นี่
}

// ฟังก์ชันส่งข้อความกลับไปยังผู้ใช้ด้วย axios
async function callSendAPI(sender_psid, response) {
    const request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    try {
        const res = await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body);
        console.log('ส่งข้อความสำเร็จ!', res.data);
    } catch (error) {
        if (error.response) {
            console.error('Error response from Facebook API:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
    }
}

// เริ่มต้นเซิร์ฟเวอร์
const PORT = process.env.PORT || 10000; // Render.com ใช้พอร์ต 10000 โดยปกติ
app.listen(PORT, () => console.log(`เซิร์ฟเวอร์กำลังทำงานบนพอร์ต ${PORT}`));
