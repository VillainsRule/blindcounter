import fs from 'node:fs';
import path from 'node:path';

if (!process.env.RESI_PROXY)
    throw new Error('RESI_PROXY environment variable is not set!');

const isValid = await new Promise((r) => fetch('https://api.ipify.org', { proxy: process.env.RESI_PROXY }).then((b) => {
    if (b.status === 200) r(true);
    else r('RESI_PROXY failed verification, please ensure that it is valid! response code: ' + b.status);
}).catch(() => r('Failed to verify RESI_PROXY, please ensure that it is valid!')));

if (typeof isValid === 'string') throw isValid;

const sendInvalid = (error: string) => new Response(JSON.stringify({ error }), { headers: { 'Content-Type': 'application/json' } });

const IS_PROTECTED = !!process.env.PASSWORD;

Bun.serve({
    port: 6445,
    async fetch(request: Request) {
        const url = new URL(request.url);

        if (url.pathname === '/api/isProtected')
            return new Response(JSON.stringify({ protected: IS_PROTECTED }), { headers: { 'Content-Type': 'application/json' } });

        if (url.pathname === '/api/bypass') {
            const jsonRaw = await new Promise((resolve) => {
                request.json().then(data => resolve(data)).catch(() => resolve({}));
            });

            const json: { link: string; password?: string } = jsonRaw as { link: string; password?: string };

            if (!json || typeof json !== 'object') return sendInvalid('invalid json body');
            if (!('link' in json) || typeof json.link !== 'string') return sendInvalid('missing link');
            if (!json.link.startsWith('https://beta.doublecounter.gg/v/')) return sendInvalid('invalid link');

            if (IS_PROTECTED) {
                if (!('password' in json) || typeof json.password !== 'string') return sendInvalid('missing password');
                if (json.password !== process.env.PASSWORD) return sendInvalid('invalid password');
            }

            const didWork = await new Promise((resolve) => {
                fetch(json.link, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Referer': json.link
                    },
                    proxy: process.env.RESI_PROXY
                }).then(res => res.text()).then(html => {
                    if (html.includes('Success!')) resolve(true);
                    else {
                        fs.appendFileSync(path.join(import.meta.dirname, '..', 'fails.log'), `Failed to process link: ${json.link}\n\n--HTML START\n${html}\n--HTML END\n\n`);
                        resolve(false);
                    }
                }).catch((e) => {
                    fs.appendFileSync(path.join(import.meta.dirname, '..', 'fails.log'), `Failed to fetch link: ${json.link} (err: ${e.toString()}\n\n`);
                    resolve(false);
                });
            });

            if (didWork) return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            else return sendInvalid('failed to process link');
        }

        const html = fs.readFileSync(path.resolve(import.meta.dirname, 'frontend.html'), 'utf8');
        return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
    }
});

console.log('visit http://localhost:6445 to use blindcounter!');