export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { user_id, content_id, ad1_done, ad2_done, init_data } = req.body;

        // Basic validation
        if (!user_id || !content_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!ad1_done || !ad2_done) {
            return res.status(400).json({ error: 'Ads not completed' });
        }

        // init_data validate karo — Telegram se aaya hai ya fake hai
        if (!init_data || init_data.length < 10) {
            return res.status(403).json({ error: 'Invalid request' });
        }

        const BOT_TOKEN = process.env.BOT_TOKEN;

        if (!BOT_TOKEN) {
            return res.status(500).json({ error: 'Server config error' });
        }

        // Bot ko message bhejo
        const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: user_id,
                text: `🔓 UNLOCK:${content_id}`,
                parse_mode: 'Markdown'
            })
        });

        const telegramData = await telegramRes.json();

        if (!telegramData.ok) {
            return res.status(500).json({ error: 'Telegram API error', detail: telegramData });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
