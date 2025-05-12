import { chromium } from 'playwright';
import chalk from 'chalk';

// Configurações principais
const CONFIG = {
  VIEW_TIME: {
    MIN: 30000,  // 30 segundos mínimo
    MAX: 60000,  // 60 segundos máximo
    CHECK_INTERVAL: 300000 // Verifica atualizações a cada 5 minutos
  },
  IP_POOL: {
    ENABLED: true,
    SIZE: 200, // Mantém um pool de 200 IPs
    REFRESH_INTERVAL: 3600000, // Atualiza o pool a cada 1 hora
    ips: new Set(),
    usedIps: new Set(),
    lastRefresh: 0
  },
  STATS: {
    totalViews: 0,
    adViews: 0,
    startTime: Date.now()
  },
  INTERACTION_DELAY: {
    MIN: 3000,
    MAX: 10000
  },
  IP_ROTATION: {
    ENABLED: true,
    VISITS_PER_IP: 1,  // Força troca de IP a cada visita
    FORCE_NEW_IP: true // Força IP diferente do anterior
  },
  SCROLL_INTERVAL: {
    MIN: 1500,
    MAX: 3000
  },
  CLICK_PROBABILITY: 0.6, // 60% chance de clicar em anúncios
  MAX_RETRIES: 3
};

const AD_SELECTORS = {
  google: [
    '[data-ad-client]',
    '[id^="google_ads_iframe"]',
    '[id*="div-gpt-ad"]',
    '.adsbygoogle',
    '[id*="gpt"]',
    '[data-google-query-id]',
    'ins.adsbygoogle',
    '[id*="google_ads"]',
    '[data-ad-slot]',
    'iframe[src*="googleads"]'
  ],
  facebook: [
    '.fb_iframe_widget',
    '[id*="fb-root"]',
    '[class*="fb_ad"]',
    '[data-testid*="fb-ad"]',
    'iframe[src*="facebook.com"]',
    '[data-ad-preview]',
    '.fbAdLink',
    'iframe[src*="fbcdn.net"]',
    '[data-facebook]',
    'div[id^="fb_"]'
  ],
  taboola: [
    '[id^="taboola"]',
    '[class*="taboola"]',
    '[data-publisher]',
    'div[id*="trc_"]',
    'iframe[src*="taboola.com"]'
  ],
  outbrain: [
    '.OUTBRAIN',
    '[data-widget-id]',
    '[data-ob-template]'
  ],
  generic: [
    '[class*="advertisement"]',
    '[class*="banner"]',
    '[class*="ad-container"]',
    '[class*="ad-wrapper"]',
    '[class*="sponsored"]',
    '[data-ad]'
  ]
};

const TRACK_EVENTS = [
  'gtm.js',
  'fbq',
  'ga',
  '_qevents',
  'clarity',
  'adsbygoogle',
  'googletag',
  'gpt',
  'prebid',
  'moat',
  'criteo',
  'outbrain',
  'taboola',
  'facebook.com/tr/',
  'google-analytics.com/collect',
  'doubleclick.net',
  'analytics.tiktok.com',
  'snap.licdn.com'
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

const EXTRA_HEADERS = {
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-CH-UA': '"Chromium";v="121", "Google Chrome";v="121", "Not;A=Brand";v="99"',
  'Sec-CH-UA-Mobile': '?0',
  'Sec-CH-UA-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'DNT': '1'
};

function getRandomReferrer() {
  const referrers = [
    'https://www.google.com/search?q=',
    'https://www.facebook.com/',
    'https://l.facebook.com/',
    'https://lm.facebook.com/',
    'https://m.facebook.com/',
    'https://instagram.com/',
    'https://pinterest.com/',
    'https://t.co/',
    'https://youtube.com/'
  ];
  return referrers[Math.floor(Math.random() * referrers.length)];
}

function preserveUTMParameters(url) {
  const urlObj = new URL(url);
  const utmParams = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'fbclid',
    'gclid',
    'cf_ads',
    'msclkid',
    'ttclid'
  ];
  
  const params = new URLSearchParams();
  utmParams.forEach(param => {
    if (urlObj.searchParams.has(param)) {
      params.append(param, urlObj.searchParams.get(param));
    }
  });
  
  return `${urlObj.origin}${urlObj.pathname}${params.toString() ? '?' + params.toString() : ''}`;
}

async function naturalMouseMovement(page, targetX, targetY, options = {}) {
  const { steps = 25, deviation = 50 } = options;
  const startX = page.mouse.position().x;
  const startY = page.mouse.position().y;
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const curve = Math.sin(progress * Math.PI);
    
    const offsetX = (Math.random() - 0.5) * deviation * curve;
    const offsetY = (Math.random() - 0.5) * deviation * curve;
    
    const currentX = startX + (targetX - startX) * progress + offsetX;
    const currentY = startY + (targetY - startY) * progress + offsetY;
    
    await page.mouse.move(currentX, currentY);
    await page.waitForTimeout(Math.random() * 25);
  }
  
  await page.mouse.move(targetX, targetY);
}

// Função melhorada para interagir com anúncios
async function interactWithAd(ad, page) {
  try {
    const box = await ad.boundingBox();
    if (!box || !box.width || !box.height) return false;

    // Scroll suave até o anúncio
    await ad.scrollIntoViewIfNeeded({ behavior: 'smooth' });
    await page.waitForTimeout(getRandomInt(2000, 4000));
    
    // Tenta clicar em botões de registro ou CTA
    const buttons = await page.$$('button, .btn, [role="button"], a.cta');
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.toLowerCase().includes('registr')) {
        await button.click();
        await page.waitForTimeout(getRandomInt(2000, 4000));
      }
    }
    
    // Tenta preencher formulários
    const forms = await page.$$('form');
    for (const form of forms) {
      const inputs = await form.$$('input[type="text"], input[type="email"]');
      for (const input of inputs) {
        await input.type('visitor' + Math.random().toString(36).substring(7) + '@example.com', 
          {delay: getRandomInt(100, 300)});
      }
    }

    // Movimento natural do mouse sobre o anúncio
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    
    await naturalMouseMovement(page, targetX, targetY);
    await page.waitForTimeout(getRandomInt(2000, 5000));

    // Simula leitura/interesse no anúncio
    const hoverPoints = [
      { x: box.x + box.width * 0.2, y: box.y + box.height * 0.2 },
      { x: box.x + box.width * 0.8, y: box.y + box.height * 0.3 },
      { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 },
      { x: box.x + box.width * 0.3, y: box.y + box.height * 0.7 },
      { x: box.x + box.width * 0.7, y: box.y + box.height * 0.8 }
    ];

    for (const point of hoverPoints) {
      await naturalMouseMovement(page, point.x, point.y, { steps: 15 });
      await page.waitForTimeout(getRandomInt(1000, 2500));
    }

    if (Math.random() < CONFIG.CLICK_PROBABILITY) {
      await page.mouse.move(targetX, targetY, { steps: 10 });
      await page.waitForTimeout(getRandomInt(500, 1000));
      await page.mouse.down();
      await page.waitForTimeout(getRandomInt(100, 300));
      await page.mouse.up();
      
      await page.waitForTimeout(getRandomInt(5000, 10000));
      return true;
    }

    return false;
  } catch (error) {
    console.log(chalk.gray(`⚠️ Erro ao interagir com anúncio: ${error.message}`));
    return false;
  }
}

async function naturalScroll(page) {
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  let currentPosition = 0;
  
  while (currentPosition < pageHeight) {
    const scrollAmount = getRandomInt(100, viewportHeight / 2);
    await page.evaluate((amount) => {
      window.scrollBy({
        top: amount,
        behavior: 'smooth'
      });
    }, scrollAmount);
    
    currentPosition += scrollAmount;
    await page.waitForTimeout(getRandomInt(CONFIG.SCROLL_INTERVAL.MIN, CONFIG.SCROLL_INTERVAL.MAX));
  }
}

async function visitSite(visitNumber, totalVisits, instanceId, siteUrl) {
  // Verifica se passou da meia-noite
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  
  if (now > midnight) {
    console.log(chalk.yellow('🔄 Detectada virada do dia, reiniciando sessão...'));
    if (browser) await browser.close().catch(() => {});
    browser = null;
    // Aguarda 1 minuto para garantir atualização dos dados
    await new Promise(r => setTimeout(r, 60000));
  }

  console.log(chalk.cyan(`\n🌐 [Instância ${instanceId}] Iniciando visita ${visitNumber}/${totalVisits} para ${siteUrl}`));
  
  // Aumenta tempo mínimo de permanência
  const minViewTime = 45000; // 45 segundos
  const maxViewTime = 90000; // 90 segundos
  
  let browser;
  let success = false;
  let retries = 0;
  let proxyWorking = false;

  while (!success && retries < CONFIG.MAX_RETRIES) {
    try {
      const testBrowser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox']
      });
      
      const testContext = await testBrowser.newContext({
        proxy: {
          server: `socks5://127.0.0.1:905${instanceId}`
        }
      });
      
      const testPage = await testContext.newPage();
      
      try {
        const ipResponse = await testPage.goto('https://api.ipify.org?format=json', {
          timeout: 30000,
          waitUntil: 'networkidle'
        });
        
        if (ipResponse.ok()) {
          const ipData = await ipResponse.json();
          console.log(chalk.green(`✅ [Instância ${instanceId}] Proxy Tor funcionando. IP: ${ipData.ip}`));
          proxyWorking = true;
        }
      } catch (error) {
        console.log(chalk.red(`❌ [Instância ${instanceId}] Erro ao verificar proxy Tor: ${error.message}`));
      }
      
      await testBrowser.close();
      
      if (!proxyWorking) {
        throw new Error('Proxy Tor não está funcionando');
      }

      browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins',
          '--disable-site-isolation-trials',
          '--disable-web-security',
          '--disable-setuid-sandbox',
          '--no-sandbox'
        ]
      });

      const context = await browser.newContext({
        userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        viewport: {
          width: getRandomInt(1024, 1920),
          height: getRandomInt(768, 1080)
        },
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
        extraHTTPHeaders: {
          ...EXTRA_HEADERS,
          'Referer': getRandomReferrer()
        },
        proxy: {
          server: `socks5://127.0.0.1:905${instanceId}`
        }
      });

      const page = await context.newPage();
      
      let ipCheckRetries = 3;
      let ipData;
      
      while (ipCheckRetries > 0 && !ipData) {
        try {
          const ipResponse = await page.goto('https://api.ipify.org?format=json', {
            timeout: 30000,
            waitUntil: 'networkidle'
          });
          ipData = await ipResponse.json();
          console.log(chalk.magenta(`🌍 [Instância ${instanceId}] IP atual: ${ipData.ip}`));
        } catch (error) {
          console.log(chalk.yellow(`⚠️ [Instância ${instanceId}] Tentativa ${4-ipCheckRetries} de verificar IP...`));
          ipCheckRetries--;
          if (ipCheckRetries === 0) {
            console.log(chalk.red(`❌ [Instância ${instanceId}] Erro ao verificar IP após todas as tentativas`));
          } else {
            await new Promise(r => setTimeout(r, 5000)); // Aguarda 5s entre tentativas
          }
        }
      }
      
      page.on('request', request => {
        const url = request.url().toLowerCase();
        
        if (url.includes('facebook.com/tr/') || url.includes('connect.facebook.net')) {
          console.log(chalk.blue('📍 Facebook Pixel detectado'));
          const pixelParams = new URL(url).searchParams;
          if (pixelParams.has('ev')) {
            console.log(chalk.gray(`📊 Evento do Pixel: ${pixelParams.get('ev')}`));
          }
        }
        
        // Google Analytics
        if (url.includes('google-analytics.com/collect')) {
          console.log(chalk.blue('📍 Google Analytics detectado'));
        }
        
        TRACK_EVENTS.forEach(event => {
          if (url.includes(event)) {
            console.log(chalk.gray(`📍 Evento detectado: ${event}`));
          }
        });
      });

      page.on('popup', async popup => {
        console.log(chalk.yellow('🔄 Popup detectado, interagindo...'));
        await popup.waitForLoadState('domcontentloaded');
        await naturalScroll(popup);
        await popup.waitForTimeout(getRandomInt(5000, 15000));
        
        for (const [platform, selectors] of Object.entries(AD_SELECTORS)) {
          for (const selector of selectors) {
            const ads = await popup.$$(selector);
            if (ads.length > 0) {
              console.log(chalk.blue(`📢 Encontrados ${ads.length} anúncios no popup do tipo ${platform}`));
              for (const ad of ads) {
                await interactWithAd(ad, popup);
              }
            }
          }
        }
      });

      await page.goto(siteUrl, {
        waitUntil: 'networkidle',
        timeout: 60000
      });
      
      // Incrementa contador de visualizações
      CONFIG.STATS.totalViews++;
      
      // Atualiza estatísticas em tempo real
      const timeRunning = Math.floor((Date.now() - CONFIG.STATS.startTime) / 1000);
      const viewsPerHour = (CONFIG.STATS.totalViews / timeRunning * 3600).toFixed(2);
      console.log(chalk.cyan(`\n📊 Estatísticas em tempo real:`));
      console.log(chalk.white(`   • IP utilizado: ${ipData.ip}`));
      console.log(chalk.white(`   • Total de páginas visitadas: ${CONFIG.STATS.totalViews}`));
      console.log(chalk.white(`   • Média de visitas/hora: ${viewsPerHour}`));
      console.log(chalk.white(`   • Tempo em execução: ${Math.floor(timeRunning/60)}m ${timeRunning%60}s`));

      // Tempo inicial de visualização
      await page.waitForTimeout(getRandomInt(CONFIG.VIEW_TIME.MIN, CONFIG.VIEW_TIME.MAX));

      // Scroll natural pela página
      await naturalScroll(page);

      // Procura e interage com anúncios
      for (const [platform, selectors] of Object.entries(AD_SELECTORS)) {
        for (const selector of selectors) {
          const ads = await page.$$(selector);
          console.log(chalk.blue(`📢 Encontrados ${ads.length} anúncios do tipo ${platform}`));
          
          for (const ad of ads) {
            const clicked = await interactWithAd(ad, page);
            if (clicked) {
              console.log(chalk.green(`✅ Interação bem sucedida com anúncio ${platform}`));
              await page.waitForTimeout(getRandomInt(2000, 4000));
            }
          }
        }
      }

      success = true;
      await browser.close();
      
    } catch (error) {
      console.error(chalk.red(`❌ Erro na visita ${visitNumber} (tentativa ${retries + 1}):`, error.message));
      if (browser) await browser.close().catch(() => {});
      retries++;
      
      if (retries < CONFIG.MAX_RETRIES) {
        const waitTime = retries * 5000;
        console.log(chalk.yellow(`⏳ Aguardando ${waitTime/1000}s antes de tentar novamente...`));
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  }

  if (!success) {
    console.log(chalk.red(`⛔ Falha após ${CONFIG.MAX_RETRIES} tentativas na visita ${visitNumber}`));
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function manageIPPool(instanceId) {
  const now = Date.now();
  
  if (CONFIG.IP_POOL.usedIps.size >= CONFIG.IP_POOL.ips.size) {
    console.log(chalk.yellow(`🔄 [Instância ${instanceId}] Todos os IPs foram usados, resetando pool...`));
    CONFIG.IP_POOL.usedIps.clear();
  }

  if (now - CONFIG.IP_POOL.lastRefresh > CONFIG.IP_POOL.REFRESH_INTERVAL || CONFIG.IP_POOL.ips.size < CONFIG.IP_POOL.SIZE) {
    console.log(chalk.yellow(`🔄 [Instância ${instanceId}] Atualizando pool de IPs...`));
    
    while (CONFIG.IP_POOL.ips.size < CONFIG.IP_POOL.SIZE) {
      try {
        await new Promise((resolve, reject) => {
          import('child_process').then(({ exec }) => {
            exec('pkill -HUP tor', (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
        });
        
        await new Promise(r => setTimeout(r, 5000));

        const testBrowser = await chromium.launch({ headless: true });
        const testContext = await testBrowser.newContext({
          proxy: { server: `socks5://127.0.0.1:905${instanceId}` }
        });
        const testPage = await testContext.newPage();
        
        const ipResponse = await testPage.goto('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        
        if (!CONFIG.IP_POOL.ips.has(ipData.ip)) {
          CONFIG.IP_POOL.ips.add(ipData.ip);
          console.log(chalk.green(`✅ [Instância ${instanceId}] Novo IP adicionado ao pool: ${ipData.ip}`));
        }
        
        await testBrowser.close();
      } catch (error) {
        console.log(chalk.red(`❌ Erro ao adicionar IP ao pool: ${error.message}`));
      }
    }
    
    CONFIG.IP_POOL.lastRefresh = now;
    console.log(chalk.green(`✅ Pool de IPs atualizado! Total: ${CONFIG.IP_POOL.ips.size} IPs`));
  }
  
  return Array.from(CONFIG.IP_POOL.ips);
}

async function start(totalVisits, instanceId, sites) {
  console.log(chalk.green.bold(`🚀 [Instância ${instanceId}] Iniciando script de automação de anúncios`));
  console.log(chalk.blue(`📊 Total de visitas programadas: ${totalVisits}`));
  
  // Inicializa pool de IPs
  if (CONFIG.IP_POOL.ENABLED) {
    await manageIPPool(instanceId);
  }
  
  let lastIP = '';
  let poolIndex = 0;
  
  const getUnusedIPs = () => {
    return Array.from(CONFIG.IP_POOL.ips).filter(ip => !CONFIG.IP_POOL.usedIps.has(ip));
  };

  for (let i = 1; i <= totalVisits; i++) {
    if (CONFIG.IP_ROTATION.ENABLED) {
      console.log(chalk.yellow(`🔄 [Instância ${instanceId}] Rotacionando IP...`));
      try {
        if (CONFIG.IP_POOL.ENABLED) {
          let unusedIPs = getUnusedIPs();
          
          if (unusedIPs.length === 0) {
            CONFIG.IP_POOL.usedIps.clear();
            unusedIPs = Array.from(CONFIG.IP_POOL.ips);
            console.log(chalk.yellow(`🔄 [Instância ${instanceId}] Pool resetado - todos os IPs foram usados`));
          }
          
          const randomIndex = Math.floor(Math.random() * unusedIPs.length);
          const newIP = unusedIPs[randomIndex];
          
          CONFIG.IP_POOL.usedIps.add(newIP);
          lastIP = newIP;
          
          console.log(chalk.cyan(`ℹ️ [Instância ${instanceId}] IPs disponíveis: ${unusedIPs.length}/${CONFIG.IP_POOL.ips.size}`));
          
          if (CONFIG.IP_POOL.ips.size < CONFIG.IP_POOL.SIZE) {
            await manageIPPool(instanceId);
          }
        } else {
          await new Promise((resolve, reject) => {
            import('child_process').then(({ exec }) => {
              exec('pkill -HUP tor', (error) => {
                if (error) reject(error);
                else resolve();
              });
            });
          });
          
          await new Promise(r => setTimeout(r, 5000));
          
          const testBrowser = await chromium.launch({ headless: true });
          const testContext = await testBrowser.newContext({
            proxy: { server: `socks5://127.0.0.1:905${instanceId}` }
          });
          const testPage = await testContext.newPage();
          
          try {
            const ipResponse = await testPage.goto('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            newIP = ipData.ip;
          } catch (error) {
            console.log(chalk.red(`❌ Erro ao verificar novo IP: ${error.message}`));
          }
          
          await testBrowser.close();
          retries++;
          
          if (newIP === lastIP) {
            console.log(chalk.yellow(`⚠️ Mesmo IP detectado, tentando novamente... (${retries}/${maxRetries})`));
            await new Promise(r => setTimeout(r, 2000));
          }
        }
        
        lastIP = newIP;
        console.log(chalk.green(`✅ [Instância ${instanceId}] Novo IP obtido: ${newIP}`));
      } catch (error) {
        console.log(chalk.red('⚠️ Erro ao rotacionar IP:', error.message));
      }
    }

    // Em teste, acessa cada site na lista usando o mesmo IP
    for (const site of sites) {
      await visitSite(i, totalVisits, instanceId, site);
    
      if (i < totalVisits) {
        const waitTime = getRandomInt(15000, 45000);
        console.log(chalk.yellow(`⏳ [Instância ${instanceId}] Aguardando ${waitTime/1000}s antes da próxima visita...`));
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  }
  
  console.log(chalk.green.bold(`✅ [Instância ${instanceId}] Script finalizado com sucesso!`));
}

process.on('SIGINT', () => {
  console.log(chalk.yellow.bold('\n⚠️ Script interrompido pelo usuário'));
  process.exit(0);
});

export default start;