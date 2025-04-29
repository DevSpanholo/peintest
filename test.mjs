import { chromium } from 'playwright';
import chalk from 'chalk';

// Exporta a função start para uso em parallel.mjs
export { start };

// ========== CONFIGS ==========
const TOTAL_VISITS = 5000;
const MIN_VIEW_TIME = 10000; // 20 segundos mínimos por página
const MAX_VIEW_TIME = 20000; // 90 segundos máximo por página
const ALLOWED_DOMAINS = ['cifradedinheiro.com', 'brasilquiz.com']; // Domínios permitidos

// Estrutura para armazenar dados da visita
class VisitData {
  constructor() {
    this.timestamp = Date.now();
    this.visit_id = `${this.timestamp}-${Math.random().toString(36).substr(2, 8)}`;
    this.url = '';
    this.referrer = '';
    this.source = '';
    this.utm_params = {};
    this.ip = '';
    this.interactions = {
      domain: '',
      scrolls: 0,
      clicks: 0,
      mouse_movements: 0,
      time_on_page: 0
    };
    this.ads_visible = [];
    this.tracking_events = new Set();
  }
}

// Seletores para anúncios e elementos importantes
const AD_SELECTORS = {
  google: '[data-ad-client], [id^="google_ads_iframe"]',
  facebook: '.fb_iframe_widget',
  generic: '[class*="advertisement"], [id*="banner"], [class*="ad-container"]'
};

// Eventos para monitorar
const TRACK_EVENTS = [
  'gtm.js',
  'fbq',
  'ga',
  '_qevents',
  'clarity',
  'turnstile'  // Cloudflare Turnstile event
];

// Função para extrair UTM params
function getUtmParams(url) {
  const params = {};
  try {
    const urlObj = new URL(url);
    ['source', 'medium', 'campaign', 'term', 'content'].forEach(param => {
      const value = urlObj.searchParams.get(`utm_${param}`);
      params[param] = value || 'não identificado';
    });
    params.cf_ads = urlObj.searchParams.get('cf_ads') || 'não identificado';
  } catch (e) {
    console.error('Erro ao extrair UTM params:', e);
  }
  return params;
}

// Função para validar domínio
function isAllowedDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return ALLOWED_DOMAINS.some(allowed => domain.includes(allowed));
  } catch (e) {
    return false;
  }
}

const SITE_URLS = [
  'https://brasilquiz.com/sorteio/participe-e-conquiste-um-playstation-5-ou-um-pc-gamer-com-o-cifra-do-bem?utm_source=291&utm_term=291&cf_ads=291',
  'https://brasilquiz.com/sorteio/participe-da-campanha-e-concorra-a-1-iphone-com-o-cifra-do-bem/?utm_source=291&utm_term=291&cf_ads=291',
  'https://brasilquiz.com/sorteio/participe-da-campanha-cifra-do-bem-2-mil-reais-em-compras/?utm_source=291&utm_term=291&cf_ads=291', 
  'https://brasilquiz.com/sorteio/transforme-sua-rotina-em-uma-aventura-ganhe-r300-semanalmente-com-o-cifra-do-bem/?utm_source=291&utm_term=291&cf_ads=291',
  'https://brasilquiz.com/sorteio/transforme-sua-rotina-em-uma-aventura-ganhe-r300-semanalmente-com-o-cifra-do-bem/?utm_source=303&utm_term=303&cf_ads=303',
  'https://brasilquiz.com/sorteio/participe-da-campanha-cifra-do-bem-2-mil-reais-em-compras/?utm_source=303&utm_term=303&cf_ads=303',
  'https://cifradedinheiro.com/acao-solidaria/transforme-sua-casa-participe-da-campanha-transforme-a-sua-casa-escolha-um-eletrodomestico-com-o-cifra-do-bem/?utm_source=303&utm_term=303&cf_ads=303',
  'https://cifradedinheiro.com/acao-solidaria/participe-da-campanha-e-ganhe-r-2-000-em-dividas-pagas-com-cifra-do-bem/?utm_source=303&utm_term=303&cf_ads=303',
  'https://brasilquiz.com/sorteio/transforme-sua-rotina-em-uma-aventura-ganhe-r300-semanalmente-com-o-cifra-do-bem/?utm_source=216&utm_term=216&cf_ads=216',
  'https://cifradedinheiro.com/acao-solidaria/transforme-sua-casa-participe-da-campanha-transforme-a-sua-casa-escolha-um-eletrodomestico-com-o-cifra-do-bem/?utm_source=216&utm_term=216&cf_ads=216',
  'https://brasilquiz.com/sorteio/participe-da-campanha-e-concorra-a-1-iphone-com-o-cifra-do-bem/?utm_source=216&utm_term=216&cf_ads=216',
  'https://brasilquiz.com/sorteio/participe-da-campanha-cifra-do-bem-2-mil-reais-em-compras/?utm_source=216&utm_term=216&cf_ads=216',
  'https://cifradedinheiro.com/acao-solidaria/participe-da-campanha-e-ganhe-r-2-000-em-dividas-pagas-com-cifra-do-bem/?utm_source=216&utm_term=216&cf_ads=216',
  'https://brasilquiz.com/sorteio/participe-da-campanha-cifra-do-bem-2-mil-reais-em-compras/?utm_source=347&utm_term=347&cf_ads=347',
  'https://cifradedinheiro.com/acao-solidaria/transforme-sua-casa-participe-da-campanha-transforme-a-sua-casa-escolha-um-eletrodomestico-com-o-cifra-do-bem/?utm_source=347&utm_term=347&cf_ads=347',
  'https://cifradedinheiro.com/acao-solidaria/participe-da-campanha-e-ganhe-r-2-000-em-dividas-pagas-com-cifra-do-bem/?utm_source=347&utm_term=347&cf_ads=347',
  'https://brasilquiz.com/sorteio/transforme-sua-rotina-em-uma-aventura-ganhe-r300-semanalmente-com-o-cifra-do-bem/?utm_source=347&utm_term=347&cf_ads=347',
  'https://brasilquiz.com/sorteio/participe-e-conquiste-um-playstation-5-ou-um-pc-gamer-com-o-cifra-do-bem/?utm_source=347&utm_term=347&cf_ads=347',
  'https://brasilquiz.com/sorteio/transforme-sua-rotina-em-uma-aventura-ganhe-r300-semanalmente-com-o-cifra-do-bem?utm_source=335&utm_term=335&cf_ads=335',
  'https://cifradedinheiro.com/acao-solidaria/participe-e-conquiste-um-playstation-5-ou-um-pc-gamer-com-o-cifra-do-bem?utm_source=335&utm_term=335&cf_ads=335'


];

const REFERRERS = [
  'https://www.facebook.com/',
  'https://www.tiktok.com/',
  'https://www.google.com/',
  'https://www.instagram.com/'
];

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
  'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84'
];

// Configuração do Tor
const TOR_PROXY = {
  server: 'socks5://127.0.0.1:9053'
};

// Configurações anti-detecção
const BROWSER_ARGS = [
  '--disable-blink-features=AutomationControlled',
  '--disable-features=IsolateOrigins,site-per-process',
  '--disable-web-security',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--disable-gpu'
];
// ==============================

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateHumanBehavior(page) {
  // Aceita o consentimento de cookies se aparecer
  try {
    const consentButton = await page.$('button:has-text("Consent"), [class*="consent-button"], .fc-cta-consent');
    if (consentButton) {
      console.log(chalk.yellow('🍪 Aceitando consentimento de cookies...'));
      // Aguarda antes de clicar no botão de aceitar
      await page.waitForTimeout(getRandomInt(2000, 4000));
      await consentButton.click();
      await page.waitForTimeout(getRandomInt(1000, 2000));
    }
  } catch (error) {
    console.log(chalk.gray('ℹ️ Botão de consentimento não encontrado'));
  }

  // Tenta clicar no botão "QUERO PARTICIPAR!"
  try {
    console.log(chalk.yellow('🔍 Procurando botão de participação...'));
    // Lista de possíveis seletores para botões de participação
    const participateSelectors = [
      'text="QUERO PARTICIPAR!"',
      'text="PARTICIPAR AGORA!"',
      '.wp-block-button__link:has-text("QUERO PARTICIPAR")',
      '.wp-block-button__link:has-text("PARTICIPAR AGORA")',
      'a[href*="como-participar"]',
      'a[href*="inscreva-se-agora"]'
    ];
    
    // Tenta cada seletor até encontrar um que funcione
    for (const selector of participateSelectors) {
      const button = await page.$(selector);
      if (button) {
        // Aguarda um pouco antes de clicar
        await page.waitForTimeout(getRandomInt(2000, 4000));
        
        console.log(chalk.yellow(`🖱️ Clicando no botão de participação: ${selector}`));
        await button.click();
        
        // Aguarda após o clique
        await page.waitForTimeout(getRandomInt(2000, 4000));
        break;
      }
    }

    // Verifica se tem desafio do Cloudflare
    const cloudflareChallenge = await page.$('[id*="challenge"], [class*="turnstile"], iframe[src*="challenges"]');
    if (cloudflareChallenge) {
      console.log(chalk.yellow('🛡️ Desafio Cloudflare detectado, aguardando...'));
      
      // Aguarda o desafio ser completado ou timeout após 30s
      await Promise.race([
        page.waitForSelector('[id*="challenge"]', { state: 'hidden', timeout: 30000 }),
        page.waitForSelector('[class*="turnstile"]', { state: 'hidden', timeout: 30000 })
      ]).catch(() => {
        console.log(chalk.red('⚠️ Timeout aguardando verificação Cloudflare'));
      });

      await page.waitForTimeout(getRandomInt(2000, 4000));
    }
  } catch (error) {
    console.log(chalk.gray('ℹ️ Erro ao interagir com botão de participação:', error.message));
  }

  console.log(chalk.yellow('👁️ Verificando visibilidade dos elementos...'));
  
  // Monitora requisições de tracking
  const trackedEvents = new Set();
  page.on('request', request => {
    const url = request.url().toLowerCase();
    TRACK_EVENTS.forEach(event => {
      if (url.includes(event)) {
        trackedEvents.add(event);
        console.log(chalk.gray(`📍 Detectado evento: ${event}`));
      }
    });
  });

  // Verifica anúncios visíveis
  const checkAds = async () => {
    // Adiciona seletor para anúncios no header
    const headerAds = await page.$$('header [id*="banner"], header [class*="ad"]');
    if (headerAds.length > 0) {
      console.log(chalk.green(`📢 Encontrados ${headerAds.length} anúncios no header`));
      
      for (const ad of headerAds) {
        const isVisible = await ad.isVisible();
        if (isVisible) {
          // Tenta clicar no anúncio com 30% de chance
          if (Math.random() < 0.3) {
            try {
              await ad.click();
              console.log(chalk.green('🖱️ Clicou em anúncio do header'));
              await page.waitForTimeout(getRandomInt(2000, 4000));
            } catch (error) {
              console.log(chalk.gray('ℹ️ Não foi possível clicar no anúncio do header'));
            }
          }
        }
      }
    }

    for (const [platform, selector] of Object.entries(AD_SELECTORS)) {
      const ads = await page.$$(selector);
      if (ads.length > 0) {
        console.log(chalk.green(`📢 Encontrados ${ads.length} anúncios do tipo ${platform}`));
        
        for (const ad of ads) {
          const isVisible = await ad.isVisible();
          if (isVisible) {
            // Rola até o anúncio
            await ad.scrollIntoViewIfNeeded();
            await page.waitForTimeout(getRandomInt(2000, 4000));
            
            // Tenta clicar no anúncio com 30% de chance
            if (Math.random() < 0.3) {
              try {
                await ad.click();
                console.log(chalk.green(`🖱️ Clicou em anúncio do tipo ${platform}`));
                await page.waitForTimeout(getRandomInt(2000, 4000));
              } catch (error) {
                console.log(chalk.gray(`ℹ️ Não foi possível clicar no anúncio do tipo ${platform}`));
              }
            }
          }
        }
      }
    }
  };

  // Random scrolling
  const scrollSteps = getRandomInt(3, 7);
  for (let i = 0; i < scrollSteps; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, (Math.random() * 0.4 + 0.1) * window.innerHeight);
    });
    await checkAds();
    await page.waitForTimeout(getRandomInt(700, 2000));
  }

  // Random mouse movements
  const moveCount = getRandomInt(4, 8);
  for (let i = 0; i < moveCount; i++) {
    const x = getRandomInt(100, 1000);
    const y = getRandomInt(100, 600);
    await page.mouse.move(x, y, { steps: getRandomInt(5, 15) });
    await page.waitForTimeout(getRandomInt(500, 1500));
  }

  // Possible text input if we find a suitable field
  try {
    const inputSelector = 'input[type="text"], input[type="email"], textarea';
    const hasInput = await page.$(inputSelector);
    if (hasInput) {
      await page.focus(inputSelector);
      await page.keyboard.type('teste' + getRandomInt(100, 999), { delay: getRandomInt(100, 300) });
    }
  } catch (error) {
    // Ignore errors if no suitable input field is found
  }

  // Possible button click with a low probability
  try {
    const buttonSelector = 'button, a.btn, .button, [role="button"]';
    const hasButton = await page.$(buttonSelector);
    if (hasButton && Math.random() < 0.3) {
      await page.click(buttonSelector);
      await page.waitForTimeout(getRandomInt(2000, 4000));
    }
  } catch (error) {
    // Ignore errors if no suitable button is found or click fails
  }
}

async function visitSite(visitNumber) {
  console.log(`\n🔵 Visitando site (${visitNumber}/${TOTAL_VISITS})`);

  const visitData = new VisitData();
  let browser;
  let retries = 0;
  const MAX_RETRIES = 3;

  while (retries < MAX_RETRIES) {
    try {
      browser = await chromium.launch({
        headless: true,
        args: BROWSER_ARGS
      });

      const context = await browser.newContext({
        userAgent: getRandom(USER_AGENTS),
        viewport: { width: getRandomInt(1200, 1920), height: getRandomInt(700, 1080) },
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
        colorScheme: 'light',
        proxy: TOR_PROXY,
        ignoreHTTPSErrors: true
      });

      // Adiciona headers extras para parecer mais real
      await context.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
      });

      const page = await context.newPage();
      const site = getRandom(SITE_URLS);
      const referrer = getRandom(REFERRERS);

      // Valida o domínio antes de prosseguir
      if (!isAllowedDomain(site)) {
        throw new Error(`Domínio não permitido: ${new URL(site).hostname}`);
      }

      visitData.url = site;
      visitData.referrer = referrer;
      visitData.interactions.domain = new URL(site).hostname;
      visitData.utm_params = getUtmParams(site);
      visitData.source = visitData.utm_params.source !== 'não identificado' 
        ? visitData.utm_params.source 
        : new URL(referrer).hostname.replace('www.', '').split('.')[0];

      console.log(`🌎 Abrindo: ${site}`);
      
      // Aguarda um pouco antes de navegar
      await page.waitForTimeout(getRandomInt(1000, 3000));
      
      const response = await page.goto(site, { 
        referer: referrer,
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      if (!response || response.status() >= 400) {
        throw new Error(`Página retornou status ${response?.status() || 'desconhecido'}`);
      }

      // Aguarda e aceita o consentimento de cookies se aparecer
      try {
        // Espera o diálogo de consentimento aparecer
        const dialogVisible = await page.waitForSelector('.fc-dialog-container, .fc-consent-root, .fc-dialog', { 
          timeout: 5000,
          state: 'visible'
        }).catch(() => null);
        
        if (dialogVisible) {
          console.log(chalk.yellow('🍪 Diálogo de cookies detectado, tentando aceitar...'));
          
          // Lista de possíveis seletores para botões de aceite
          const consentSelectors = [
            '.fc-button-label:has-text("Consent")',
            '.fc-cta-consent',
            '.fc-cta-do-not-consent',
            'button:has-text("Accept")',
            'button:has-text("Agree")',
            '[aria-label*="consent"]',
            '[aria-label*="accept"]'
          ];
          
          // Tenta cada seletor até encontrar um que funcione
          for (const selector of consentSelectors) {
            const button = await page.$(selector);
            if (button) {
              await button.click();
              console.log(chalk.green('✅ Cookies aceitos'));
              break;
            }
          }
          
          // Aguarda um pouco após clicar
          await page.waitForTimeout(getRandomInt(1000, 2000));
          
          // Verifica se o diálogo sumiu
          const dialogGone = await page.waitForSelector('.fc-dialog-container, .fc-consent-root, .fc-dialog', {
            state: 'hidden',
            timeout: 5000
          }).catch(() => null);
          
          if (!dialogGone) {
            console.log(chalk.yellow('⚠️ Diálogo pode ainda estar visível, continuando mesmo assim...'));
            await page.waitForTimeout(getRandomInt(1000, 2000));
          }
        }
      } catch (error) {
        console.log(chalk.gray('ℹ️ Nenhum diálogo de consentimento encontrado ou já aceito'));
      }

      // Simula comportamento mais natural
      console.log(chalk.yellow('🕒 Iniciando contagem de tempo de visualização...'));
      const viewStartTime = Date.now();
      
      // Monitora scroll e interações
      let scrollCount = 0;
      let interactionCount = 0;
      
      // Monitora eventos de tracking
      page.on('request', request => {
        const url = request.url().toLowerCase();
        TRACK_EVENTS.forEach(event => {
          if (url.includes(event)) {
            visitData.tracking_events.add(event);
            console.log(chalk.gray(`📍 Evento detectado: ${event}`));
          }
        });
      });

      for (let i = 0; i < getRandomInt(4, 8); i++) {
        await page.mouse.move(
          getRandomInt(100, 1000),
          getRandomInt(100, 600),
          { steps: getRandomInt(5, 15) }
        );
        interactionCount++;
        visitData.interactions.mouse_movements++;
        
        await page.evaluate(() => {
          window.scrollBy(0, Math.random() * window.innerHeight * 0.5);
        });
        scrollCount++;
        visitData.interactions.scrolls++;
        
        await page.waitForTimeout(getRandomInt(1000, 3000));
      }

      // Garante tempo mínimo de visualização
      const elapsedTime = Date.now() - viewStartTime;
      const remainingTime = Math.max(0, MIN_VIEW_TIME - elapsedTime);
      
      if (remainingTime > 0) {
        console.log(chalk.yellow(`⏳ Aguardando mais ${Math.round(remainingTime/1000)}s para view válida...`));
        await page.waitForTimeout(remainingTime);
      }

      const finalWait = getRandomInt(2000, 5000);
      await page.waitForTimeout(finalWait);
      
      const totalTime = Date.now() - viewStartTime;
      visitData.interactions.time_on_page = Math.round(totalTime/1000);
      
      console.log(chalk.green(`✅ Visita ${visitNumber} válida:`));
      console.log(chalk.gray('📊 Dados coletados:'));
      console.log(chalk.gray(JSON.stringify(visitData, null, 2)));
      
      await browser.close();
      return;
      
    } catch (err) {
      retries++;
      console.error(`❌ Erro durante visita ${visitNumber} (tentativa ${retries}/${MAX_RETRIES}):`, err.message);
      
      if (browser) {
        await browser.close().catch(() => {});
      }
      
      if (retries < MAX_RETRIES) {
        const waitTime = retries * 3000;
        console.log(`⏳ Aguardando ${waitTime/1000}s antes de tentar novamente...`);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  }
  
  console.log(`⛔ Falha após ${MAX_RETRIES} tentativas para a visita ${visitNumber}`);
}

async function start() {
  console.log(chalk.cyan.bold('🚀 Iniciando script de visitas automáticas'));
  console.log(chalk.cyan(`📊 Total de visitas: ${TOTAL_VISITS}`));
  console.log(chalk.cyan(`🔒 Usando Tor na porta 9053`));
  
  for (let i = 1; i <= TOTAL_VISITS; i++) {
    await visitSite(i);
    
    if (i < TOTAL_VISITS) {
      const waitTime = getRandomInt(5000, 15000);
      console.log(chalk.yellow(`⏳ Aguardando ${waitTime/1000}s antes da próxima visita...`));
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  
  console.log(chalk.green.bold('✅ Script finalizado com sucesso!'));
}

// Handle interruption gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow.bold('\n⚠️ Script interrompido pelo usuário'));
  process.exit(0);
});

start().catch(err => {
  console.error(chalk.red.bold('❌ Erro fatal no script:'), err);
  process.exit(1);
});