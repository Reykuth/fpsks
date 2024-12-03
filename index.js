const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

// ใส่ค่าโทเค็นของคุณตรงนี้
const PAGE_ACCESS_TOKEN = 'EAARffjvaCwoBOZBqnNfngHJpYuR33A7NZC0iTN9n8UXHvvqKMZAxHFbVRjwpDn0ZC0dI75ZBir1oX0cFHvBXPS9reZBTqQk2Cy7GP2sliFKGFepkxLT68F8g0ZCQ57EmUuBThjMppjaSDG0gKVUliHAic4PHHbHEFJkZCtkPyHmJuBRC0RggIH8AWm8lsNwjrkxKoAZDZD'; // ใส่ Page Access Token ของคุณที่นี่
const VERIFY_TOKEN = 'zxcvbnm'; // ใส่ Verify Token ที่คุณตั้งเอง

if (!PAGE_ACCESS_TOKEN || !VERIFY_TOKEN) {
    console.error('Missing PAGE_ACCESS_TOKEN or VERIFY_TOKEN in the code.');
    process.exit(1);
}

const app = express().use(bodyParser.json());

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

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            const webhook_event = entry.messaging[0];
            console.log(webhook_event);

            const sender_psid = webhook_event.sender.id;
            console.log('Sender PSID:', sender_psid);

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
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

// ฟังก์ชันส่งข้อความกลับไปยังผู้ใช้
function callSendAPI(sender_psid, response) {
    const request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    request({
        "uri": "https://graph.facebook.com/v17.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('ส่งข้อความสำเร็จ!');
        } else {
            console.error('ไม่สามารถส่งข้อความได้:', err);
        }
    });
}

// เริ่มต้นเซิร์ฟเวอร์
const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`เซิร์ฟเวอร์กำลังทำงานบนพอร์ต ${PORT}`));
