import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { user_id, content_id, ad1_done, ad2_done, init_data } = req.body;

        if (!user_id || !content_id) return res.status(400).json({ error: 'Missing fields' });
        if (!ad1_done || !ad2_done) return res.status(400).json({ error: 'Ads not done' });
        if (!init_data || init_data.length < 10) return res.status(403).json({ error: 'Invalid request' });

        const BOT_TOKEN = process.env.BOT_TOKEN;
        const SECRET = process.env.KEY_SECRET || "sinful2025secret";

        if (!BOT_TOKEN) return res.status(500).json({ error: 'BOT_TOKEN not set' });

        // HMAC se signed key banao
        // Format: first 4 digits of HMAC(secret, user_id:content_id:timestamp_hour)
        // timestamp_hour = current hour — key 1 ghante mein expire
        const hour = Math.floor(Date.now() / 3600000);
        const payload = `${user_id}:${content_id}:${hour}`;
        const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
        const key = hmac.substring(0, 6).toUpperCase(); // 6 char alphanumeric key

        // User ko Telegram message bhejo
        const telegramRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: user_id,
                    text: `🔑 *Your Unlock Key:* \`${key}\`\n\nSend this in bot:\n\`/getkey ${key}\`\n\n⚠️ Valid for 1 hour only.`,
                    parse_mode: 'Markdown'
                })
            }
        );

        const tgData = await telegramRes.json();
        if (!tgData.ok) {
            return res.status(500).json({ error: 'Telegram error', detail: tgData.description });
        }

        return res.status(200).json({ success: true, key: key });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
