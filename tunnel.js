import localtunnel from 'localtunnel';

async function startTunnel() {
  try {
    const tunnel = await localtunnel({
      port: 5176,
      subdomain: 'thiep-cuoi-thai-tran',
    });

    console.log(`[TUNNEL ACTIVE] ${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('[TUNNEL CLOSED] Reconnecting in 2 seconds...');
      setTimeout(startTunnel, 2000);
    });

    tunnel.on('error', (err) => {
      console.error('[TUNNEL ERROR]', err.message);
      try { tunnel.close(); } catch {}
    });

    // Keepalive ping every 25 seconds
    setInterval(() => {
      try {
        fetch(tunnel.url, { headers: { 'bypass-tunnel-reminder': 'true' } }).catch(() => {});
      } catch {}
    }, 25000);

  } catch (err) {
    console.error('[CONNECT FAILED]', err.message, '- retrying in 3 seconds...');
    setTimeout(startTunnel, 3000);
  }
}

startTunnel();
