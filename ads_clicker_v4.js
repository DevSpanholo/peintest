import { chromium } from 'playwright';
import chalk from 'chalk';

// Configurações principais
const CONFIG = {
  VIEW_TIME: {
    MIN: 10000,  // 10 segundos mínimo
    MAX: 30000   // 30 segundos máximo
  },
  INTERACTION_DELAY: {
    MIN: 2000,
    MAX: 8000
  },
  IP_ROTATION: {
    ENABLED: true,
    VISITS_PER_IP: 2  // Troca IP a cada 2 visitas para parecer mais natural
  },
  SCROLL_INTERVAL: {
    MIN: 800,
    MAX: 2000
  },
  CLICK_PROBABILITY: 0.4, // 40% chance de clicar em anúncios (mais natural)
  MAX_RETRIES: 3
};

// Seletores avançados para anúncios
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

// Eventos de tracking expandidos
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

// User agents mais recentes
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

// Headers avançados para parecer mais real
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

// Função para gerar referrers realistas
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

// Função para preservar parâmetros UTM
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

// Função para movimento natural do mouse
async function naturalMouseMovement(page, targetX, targetY, options = {}) {
  const { steps = 25, deviation = 50 } = options;
  const startX = page.mouse.position().x;
  const startY = page.mouse.position().y;
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const curve = Math.sin(progress * Math.PI);
    
    // Adiciona pequenos desvios aleatórios para parecer mais natural
    const offsetX = (Math.random() - 0.5) * deviation * curve;
    const offsetY = (Math.random() - 0.5) * deviation * curve;
    
    const currentX = startX + (targetX - startX) * progress + offsetX;
    const currentY = startY + (targetY - startY) * progress + offsetY;
    
    await page.mouse.move(currentX, currentY);
    await page.waitForTimeout(Math.random() * 25);
  }
  
  // Move para a posição final exata
  await page.mouse.move(targetX, targetY);
}

// Função melhorada para interagir com anúncios
async function interactWithAd(ad, page) {
  try {
    const box = await ad.boundingBox();
    if (!box) return false;

    // Scroll suave até o anúncio
    await ad.scrollIntoViewIfNeeded({ behavior: 'smooth' });
    await page.waitForTimeout(getRandomInt(1000, 2000));

    // Movimento natural do mouse sobre o anúncio
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    
    await naturalMouseMovement(page, targetX, targetY);
    await page.waitForTimeout(getRandomInt(1000, 3000));

    // Simula leitura/interesse no anúncio
    const hoverPoints = [
      { x: box.x + box.width * 0.2, y: box.y + box.height * 0.2 },
      { x: box.x + box.width * 0.8, y: box.y + box.height * 0.3 },
      { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 }
    ];

    for (const point of hoverPoints) {
      await naturalMouseMovement(page, point.x, point.y, { steps: 15 });
      await page.waitForTimeout(getRandomInt(500, 1500));
    }

    // Clique natural
    if (Math.random() < CONFIG.CLICK_PROBABILITY) {
      await page.mouse.move(targetX, targetY, { steps: 10 });
      await page.waitForTimeout(getRandomInt(200, 500));
      await page.mouse.down();
      await page.waitForTimeout(getRandomInt(50, 150));
      await page.mouse.up();
      
      // Aguarda popup ou nova página
      await page.waitForTimeout(getRandomInt(3000, 6000));
      return true;
    }

    return false;
  } catch (error) {
    console.log(chalk.gray(`⚠️ Erro ao interagir com anúncio: ${error.message}`));
    return false;
  }
}

// Função para scroll natural
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

// Função principal para visitar site
async function visitSite(visitNumber, totalVisits, instanceId, siteUrl) {
  console.log(chalk.cyan(`\n🌐 [Instância ${instanceId}] Iniciando visita ${visitNumber}/${totalVisits} para ${siteUrl}`));
  
  let browser;
  let success = false;
  let retries = 0;
  let proxyWorking = false;

  while (!success && retries < CONFIG.MAX_RETRIES) {
    try {
      // Verifica se o proxy Tor está funcionando
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
      
      // Verifica o IP atual
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
      
      // Monitora eventos de tracking
      page.on('request', request => {
        const url = request.url().toLowerCase();
        
        // Facebook Pixel e eventos
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
        
        // Outros eventos de tracking
        TRACK_EVENTS.forEach(event => {
          if (url.includes(event)) {
            console.log(chalk.gray(`📍 Evento detectado: ${event}`));
          }
        });
      });

      // Monitora popups de anúncios
      page.on('popup', async popup => {
        console.log(chalk.yellow('🔄 Popup detectado, interagindo...'));
        await popup.waitForLoadState('domcontentloaded');
        await naturalScroll(popup);
        await popup.waitForTimeout(getRandomInt(5000, 15000));
        
        // Tenta interagir com anúncios no popup também
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

      // Carrega a página
      await page.goto(siteUrl, {
        waitUntil: 'networkidle',
        timeout: 60000
      });

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

// Função auxiliar para números aleatórios
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função principal
async function start(totalVisits, instanceId, sites) {
  console.log(chalk.green.bold(`🚀 [Instância ${instanceId}] Iniciando script de automação de anúncios`));
  console.log(chalk.blue(`📊 Total de visitas programadas: ${totalVisits}`));
  let visitsWithCurrentIP = 0;
  
  for (let i = 1; i <= totalVisits; i++) {
    // Rotação de IP
    if (CONFIG.IP_ROTATION.ENABLED && visitsWithCurrentIP >= CONFIG.IP_ROTATION.VISITS_PER_IP) {
      console.log(chalk.yellow(`🔄 [Instância ${instanceId}] Rotacionando IP...`));
      try {
        await new Promise((resolve, reject) => {
          const exec = require('child_process').exec;
          exec('pkill -HUP tor', (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        console.log(chalk.green(`✅ [Instância ${instanceId}] IP rotacionado com sucesso`));
        visitsWithCurrentIP = 0;
        // Aguarda um pouco para o novo IP estabilizar
        await new Promise(r => setTimeout(r, 5000));
      } catch (error) {
        console.log(chalk.red('⚠️ Erro ao rotacionar IP:', error.message));
      }
    }

    // Visita cada site na lista usando o mesmo IP
    for (const site of sites) {
      await visitSite(i, totalVisits, instanceId, site);
      visitsWithCurrentIP++;
    
      if (i < totalVisits) {
        const waitTime = getRandomInt(15000, 45000);
        console.log(chalk.yellow(`⏳ [Instância ${instanceId}] Aguardando ${waitTime/1000}s antes da próxima visita...`));
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  }
  
  console.log(chalk.green.bold(`✅ [Instância ${instanceId}] Script finalizado com sucesso!`));
}

// Tratamento de interrupção
process.on('SIGINT', () => {
  console.log(chalk.yellow.bold('\n⚠️ Script interrompido pelo usuário'));
  process.exit(0);
});

// Exporta a função start como default
export default start;