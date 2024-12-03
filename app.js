// app.js
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ตรวจสอบ Webhook
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
        body.entry.forEach(entry => {
            const webhook_event = entry.messaging[0];
            console.log(webhook_event);

            const sender_psid = webhook_event.sender.id;
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// ฟังก์ชันตอบกลับข้อความ
function handleMessage(sender_psid, received_message) {
    let response;

    if (received_message.text) {
        response = {
            "text": `คุณส่งข้อความมา: "${received_message.text}"`
        };
    }

    callSendAPI(sender_psid, response);
}

// ส่งข้อความกลับไปยังผู้ใช้
function callSendAPI(sender_psid, response) {
    const request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    request({
        "uri": "https://graph.facebook.com/v12.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('ข้อความถูกส่งไปยังผู้ใช้เรียบร้อยแล้ว!');
        } else {
            console.error("ไม่สามารถส่งข้อความได้: " + err);
        }
    });
}

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`แอปกำลังรันบน port ${PORT}`));
