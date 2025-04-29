import { chromium } from 'playwright';
import chalk from 'chalk';
import { CONFIG } from './config.mjs';

// Utility functions
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Human behavior simulation
class HumanBehaviorSimulator {
  constructor(page) {
    this.page = page;
  }

  async randomDelay(min = 500, max = 2000) {
    const delay = getRandomInt(min, max);
    await this.page.waitForTimeout(delay);
    return delay;
  }

  async scroll() {
    const scrollSteps = getRandomInt(3, 7);
    
    for (let i = 0; i < scrollSteps; i++) {
      await this.page.evaluate(() => {
        window.scrollBy(0, (Math.random() * 0.4 + 0.1) * window.innerHeight);
      });
      await this.randomDelay(700, 2000);
    }
  }

  async moveMouseRandomly() {
    const moveCount = getRandomInt(4, 8);
    
    for (let i = 0; i < moveCount; i++) {
      const x = getRandomInt(100, 1000);
      const y = getRandomInt(100, 600);
      await this.page.mouse.move(x, y, { steps: getRandomInt(5, 15) });
      await this.randomDelay(500, 1500);
    }
  }

  async tryTypeIntoField() {
    try {
      const inputSelectors = [
        'input[type="text"]', 
        'input[type="email"]', 
        'textarea',
        'input[name="email"]',
        'input[name="name"]'
      ];
      
      for (const selector of inputSelectors) {
        const hasInput = await this.page.$(selector);
        if (hasInput) {
          await this.page.focus(selector);
          await this.randomDelay(300, 800);
          
          const textOptions = [
            'teste' + getRandomInt(100, 999),
            'visitante' + getRandomInt(100, 999),
            'usuario' + getRandomInt(100, 999) + '@gmail.com'
          ];
          
          await this.page.keyboard.type(getRandom(textOptions), { 
            delay: getRandomInt(100, 300) 
          });
          
          return true;
        }
      }
    } catch (error) {
      // Ignore errors if no suitable input field is found
    }
    return false;
  }

  async tryClickButton() {
    try {
      // Only click buttons with a 30% probability
      if (Math.random() > 0.3) return false;
      
      const buttonSelectors = [
        'button:not([type="submit"])',
        'a.btn', 
        '.button:not(.submit)', 
        '[role="button"]'
      ];
      
      for (const selector of buttonSelectors) {
        const buttons = await this.page.$$(selector);
        if (buttons.length > 0) {
          // Click a random button from those found
          const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
          await randomButton.click();
          await this.randomDelay(2000, 4000);
          return true;
        }
      }
    } catch (error) {
      // Ignore errors if no suitable button is found or click fails
    }
    return false;
  }

  async simulateFullBehavior() {
    console.log(chalk.yellow('👤 Simulando comportamento humano...'));
    
    // Initial delay after page load
    await this.randomDelay(1000, 3000);
    
    // First scroll
    await this.scroll();
    
    // Mouse movements
    await this.moveMouseRandomly();
    
    // Try to type in a field
    const typed = await this.tryTypeIntoField();
    if (typed) {
      await this.randomDelay(1000, 2000);
    }
    
    // More scrolling
    await this.scroll();
    
    // Try to click a non-submit button
    const clicked = await this.tryClickButton();
    if (clicked) {
      await this.randomDelay(2000, 4000);
      await this.scroll();
    }
    
    // Final random delay
    const finalDelay = await this.randomDelay(
      CONFIG.MIN_VISIT_DURATION, 
      CONFIG.MAX_VISIT_DURATION
    );
    
    console.log(chalk.yellow(`⏱️ Permaneceu na página por ${Math.round(finalDelay/1000)}s adicionais`));
  }
}

// Site visitor class
class SiteVisitor {
  constructor() {
    this.totalVisits = CONFIG.TOTAL_VISITS;
    this.maxRetries = CONFIG.MAX_RETRIES;
  }

  async setupBrowser() {
    // Launch browser with improved stealth settings
    const browser = await chromium.launch(CONFIG.BROWSER_OPTIONS);
    
    // Create context with proxy and stealth settings
    const context = await browser.newContext({
      userAgent: getRandom(CONFIG.USER_AGENTS),
      viewport: { 
        width: getRandomInt(1200, 1920), 
        height: getRandomInt(700, 1080) 
      },
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
      colorScheme: 'light',
      proxy: {
        server: CONFIG.PROXY.SERVER,
        username: CONFIG.PROXY.USERNAME,
        password: CONFIG.PROXY.PASSWORD
      },
      ignoreHTTPSErrors: true,
      javaScriptEnabled: true,
      hasTouch: Math.random() > 0.5, // Randomly enable touch
      isMobile: Math.random() > 0.7,  // 30% chance of being mobile
      deviceScaleFactor: Math.random() > 0.5 ? 2 : 1 // Random retina display
    });

    // Set extra HTTP headers to help avoid detection
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive'
    });
    
    return { browser, context };
  }

  async setupPage(context) {
    const page = await context.newPage();
    
    // Set cookies to appear more like a real user
    await context.addCookies([
      {
        name: 'visited_before',
        value: 'true',
        domain: '.cifradedinheiro.com',
        path: '/',
      },
      {
        name: 'session_started',
        value: Date.now().toString(),
        domain: '.cifradedinheiro.com',
        path: '/',
      }
    ]);
    
    // Set up request interception
    await page.route('**/*', route => {
      const request = route.request();
      const resourceType = request.resourceType();
      const url = request.url();
      
      // Block unnecessary resources to speed up loading
      if (['image', 'media', 'font'].includes(resourceType) && Math.random() < 0.3) {
        return route.abort();
      }
      
      // Block tracking and analytics with 50% probability
      if (url.includes('analytics') || 
          url.includes('tracker') || 
          url.includes('pixel') || 
          url.includes('tag-manager')) {
        if (Math.random() < 0.5) {
          return route.abort();
        }
      }
      
      route.continue({
        headers: {
          ...request.headers(),
          'Referer': getRandom(CONFIG.REFERRERS)
        }
      });
    });
    
    // Set page timeout
    page.setDefaultTimeout(CONFIG.PAGE_TIMEOUT);
    
    // Handle dialog automatic dismissal
    page.on('dialog', async dialog => {
      console.log(chalk.yellow(`🔔 Detectado diálogo: ${dialog.type()} - ${dialog.message()}`));
      await dialog.dismiss();
    });
    
    return page;
  }

  async visitSite(visitNumber) {
    console.log(chalk.blue.bold(`\n🔵 Visitando site (${visitNumber}/${this.totalVisits})`));

    let browser;
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        // Setup browser and context
        const setup = await this.setupBrowser();
        browser = setup.browser;
        const context = setup.context;
        
        // Setup page
        const page = await this.setupPage(context);
        
        // Select random URL and referrer
        const site = getRandom(CONFIG.SITE_URLS);
        const referrer = getRandom(CONFIG.REFERRERS);

        console.log(chalk.green(`🌎 Abrindo: ${site}`));
        console.log(chalk.gray(`🔍 Referência: ${referrer}`));
        
        // Add a small delay before navigation
        await page.waitForTimeout(getRandomInt(500, 1500));
        
        // Navigate to page with improved options
        const response = await page.goto(site, { 
          referer: referrer, 
          waitUntil: 'domcontentloaded', 
          timeout: CONFIG.NAVIGATION_TIMEOUT 
        });

        // Wait a bit after initial load
        await page.waitForTimeout(getRandomInt(1000, 3000));
        
        // Check response
        if (!response) {
          throw new Error('Sem resposta do servidor');
        }
        
        const status = response.status();
        if (status >= 400) {
          throw new Error(`Página retornou status ${status}`);
        }

        // Simulate human behavior
        const humanSimulator = new HumanBehaviorSimulator(page);
        await humanSimulator.simulateFullBehavior();

        console.log(chalk.green(`✅ Visita ${visitNumber} concluída com sucesso`));
        
        await browser.close();
        return; // Success, exit the retry loop
        
      } catch (err) {
        retries++;
        console.error(chalk.red(`❌ Erro durante visita ${visitNumber} (tentativa ${retries}/${this.maxRetries}):`, err.message));
        
        if (browser) {
          try {
            await browser.close();
          } catch (closeErr) {
            // Ignore browser close errors
          }
        }
        
        if (retries < this.maxRetries) {
          const waitTime = retries * 3000; // Increasing backoff time
          console.log(chalk.yellow(`⏳ Aguardando ${waitTime/1000}s antes de tentar novamente...`));
          await new Promise(r => setTimeout(r, waitTime));
        }
      }
    }
    
    console.log(chalk.red.bold(`⛔ Falha após ${this.maxRetries} tentativas para a visita ${visitNumber}`));
  }

  async start() {
    console.log(chalk.cyan.bold('🚀 Iniciando script de visitas automáticas'));
    console.log(chalk.cyan(`📊 Total de visitas: ${this.totalVisits}`));
    console.log(chalk.cyan(`🔑 Usando proxy: ${CONFIG.PROXY.SERVER}`));
    
    let completedVisits = 0;
    
    for (let i = 1; i <= this.totalVisits; i++) {
      await this.visitSite(i);
      completedVisits++;
      
      if (i < this.totalVisits) {
        const waitTime = getRandomInt(
          CONFIG.MIN_WAIT_BETWEEN_VISITS, 
          CONFIG.MAX_WAIT_BETWEEN_VISITS
        );
        console.log(chalk.yellow(`⏳ Aguardando ${waitTime/1000}s antes da próxima visita...`));
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
    
    console.log(chalk.green.bold(`✅ Script finalizado com ${completedVisits}/${this.totalVisits} visitas completas`));
  }
}

// Handle interruption gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow.bold('\n⚠️ Script interrompido pelo usuário'));
  process.exit(0);
});

// Run the script
const visitor = new SiteVisitor();
visitor.start().catch(err => {
  console.error(chalk.red.bold('❌ Erro fatal no script:'), err);
  process.exit(1);
});