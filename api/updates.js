export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const interval = setInterval(() => {
        res.write(`data: ${JSON.stringify({ update: true })}\n\n`);
    }, 5000); // Check every 5 seconds

    req.on('close', () => clearInterval(interval));
}
