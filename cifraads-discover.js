// cifraads-discover.js
import fetch from 'node-fetch';
import chalk from 'chalk';

// ░░░ CONFIG ░░░
const HOST = 'https://api.cifraads.com';
const TOKEN = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjEwMjUwOSwiZXhwIjoxNzQ2MTA2MTA5fQ.WEBm_eBzO6booCwZCxhn3X5zSkR7RJZFfWoacJS-5hc';                 // export TOKEN=...
const PAYMENT_ID   = 365;                        // conhecido
const ADJUST_ID    = 18;                         // conhecido
const USER_ID      = 698;                        // conhecido
const RATE_LIMIT_MS = 300;

// ────────────────────────────────────────────────────────────────────────────────
// Lista de padrões a testar –– personalize à vontade
const paths = [
  `/payments/${PAYMENT_ID}`,
  `/payments/update`,
  `/payments/cancel/${PAYMENT_ID}`,
  `/admin/payments/${PAYMENT_ID}`,
  `/admin/payments`,
  `/payments/adjust/${ADJUST_ID}`,
  `/payments/adjust/${PAYMENT_ID}/${ADJUST_ID}`,
  `/payments/adjustments/${ADJUST_ID}`,
  `/admin/payments/adjustments/${ADJUST_ID}`,
];
const verbs = ['GET', 'PATCH', 'PUT', 'POST', 'DELETE'];

(async () => {
  if (!TOKEN) {
    console.error('Defina o TOKEN:  TOKEN="seuJWT" node cifraads-discover.js');
    process.exit(1);
  }

  console.log(chalk.cyan('\n▶︎ Iniciando descoberta de endpoints…\n'));

  for (const path of paths) {
    for (const method of verbs) {
      // corpo mínimo p/ métodos de escrita
      const body =
        method === 'POST' || method === 'PUT' || method === 'PATCH'
          ? JSON.stringify({ status: 'teste' })
          : undefined;

      const res = await fetch(HOST + path, {
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body,
      }).catch((e) => ({ status: 'ERR', message: e.message }));

      const status =
        typeof res.status === 'number' ? res.status : res.message || 'ERR';

      const ok =
        status === 200 ||
        status === 201 ||
        status === 204 ||
        status === 405; // 405 = rota existe, método errado

      const color = ok ? chalk.green : chalk.gray;
      console.log(color(`${method.padEnd(6)} ${path}  →  ${status}`));

      // respeitar rate-limit simples
      await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
    }
  }

  console.log(chalk.cyan('\n✓ Varredura concluída.\n'));
})();
