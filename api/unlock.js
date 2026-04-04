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
        if (!BOT_TOKEN) return res.status(500).json({ error: 'Server config error' });

        // 4 digit unique key generate karo
        const key = String(Math.floor(1000 + Math.random() * 9000));

        // Bot ko message bhejo — native fetch use karo (Node 18+ mein built-in hai)
        const telegramRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: user_id,
                    text: `STORE_KEY:${key}:${content_id}`
                })
            }
        );

        const telegramData = await telegramRes.json();

        if (!telegramData.ok) {
            return res.status(500).json({ 
                error: 'Telegram error', 
                detail: telegramData.description 
            });
        }

        return res.status(200).json({ success: true, key: key });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
