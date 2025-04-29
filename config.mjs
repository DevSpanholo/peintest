/**
 * Configuration file for the site visitor script
 * You can customize settings here instead of modifying the main script
 */
export const CONFIG = {
  // Visit settings
  TOTAL_VISITS: 5,
  MAX_RETRIES: 3,
  
  // Timing settings (milliseconds)
  PAGE_TIMEOUT: 90000,
  NAVIGATION_TIMEOUT: 60000,
  MIN_VISIT_DURATION: 6000,
  MAX_VISIT_DURATION: 15000,
  MIN_WAIT_BETWEEN_VISITS: 5000,
  MAX_WAIT_BETWEEN_VISITS: 15000,
  
  // Target URLs
  SITE_URLS: [
    'https://cifradedinheiro.com/acao-solidaria/mil-reais-em-compras-com-o-cifra-do-bem?utm_term=216&cf_ads=216',
    'https://cifradedinheiro.com/acao-solidaria/participe-e-conquiste-um-playstation-5-ou-um-pc-gamer-com-o-cifra-do-bem?utm_term=216&cf_ads=216',
    'https://cifradedinheiro.com/acao-solidaria/5-mil-para-pagar-suas-contas-com-o-cifra-do-bem?utm_term=216&cf_ads=216',
  ],
  
  // Referrers to use
  REFERRERS: [
    'https://www.facebook.com/',
    'https://www.tiktok.com/',
    'https://www.google.com/',
    'https://www.instagram.com/',
    'https://www.youtube.com/',
    'https://twitter.com/'
  ],
  
  // User agents to rotate
  USER_AGENTS: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
    'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
  ],
  
  // Proxy settings
  PROXY: {
    SERVER: 'http://gate.decodo.com:10001',
    USERNAME: 'spz1caawi1',
    PASSWORD: 'vsdKw426IdxhNgQ_o8'
  },
  
  // Browser launch options
  BROWSER_OPTIONS: {
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  }
};

export default CONFIG;