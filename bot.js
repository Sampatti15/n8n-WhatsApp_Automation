
const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'cafe-bot'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Your local n8n Webhook URL
const N8N_WEBHOOK =
    '';

client.on('qr', (qr) => {
    const qrcode = require('qrcode-terminal');
    qrcode.generate(qr, { small: true });
    console.log('Scan this QR code with WhatsApp');
});

client.on('ready', () => {
    console.log('WhatsApp connected successfully!');
});

client.on('message', async (message) => {
    try {
        // Ignore groups and empty messages
        if (message.from.endsWith('@g.us')) return;
        if (!message.body.trim()) return;

        console.log('Incoming:', message.body);

        // Send message to n8n
        const response = await axios.post(
            N8N_WEBHOOK,
            {
                from: message.from,
                text: message.body
            },
            { timeout: 120000 }
        );

        const reply = response.data.reply;

        if (reply) {
            await client.sendMessage(message.from, reply);
            console.log('Reply sent:', reply);
        } else {
            console.log('No reply received from n8n');
        }

    } catch (error) {
        console.error(
            'Error:',
            error.response?.data || error.message
        );
    }
});

client.initialize();
