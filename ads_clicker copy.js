import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'pt-BR',
    javaScriptEnabled: true,
    bypassCSP: true,
    ignoreHTTPSErrors: true,
    storageState: undefined,
    permissions: ['geolocation'],
    geolocation: { latitude: -23.5505, longitude: -46.6333 },
    extraHTTPHeaders: {
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });

  const page = await context.newPage();

try {
  const ipPage = await context.newPage();
  const ipResp = await ipPage.goto('https://api.ipify.org?format=json', { timeout: 10000 });
  const ipJson = await ipResp.json();
  visitData.ip = ipJson.ip;
  console.log(chalk.blue(`🌐 IP Tor detectado: ${ipJson.ip}`));
  await ipPage.close();
} catch (err) {
  console.log(chalk.red('⚠️ Falha ao obter IP da sessão:', err.message));
}

  
  const session = await context.newCDPSession(page);
  await session.send('Browser.setWindowBounds', {
    windowId: (await session.send('Browser.getWindowForTarget')).windowId,
    bounds: { windowState: 'maximized' }
  });

  page.on('request', request => {
    const url = request.url();
    if (url.includes('adsbygoogle.js') || url.includes('googlesyndication') || url.includes('doubleclick')) {
      console.log('📡 Requisição de anúncio detectada:', url);
    }
  });

  page.on('popup', popup => {
    console.log('🆕 Janela popup aberta (possível clique em anúncio)');
    popup.on('load', async () => {
      const popupUrl = popup.url();
      console.log('🌐 Popup carregado:', popupUrl);
    });
  });

  const URL = 'https://brasilquiz.com/sorteio/participe-e-conquiste-um-playstation-5-ou-um-pc-gamer-com-o-cifra-do-bem/?utm_source=698&utm_term=698&cf_ads=698';
  console.log('🌍 Abrindo página:', URL);
  await page.goto(URL, { waitUntil: 'load', timeout: 120000 });


  // Delay maior para carregamento completo dos scripts de anúncios
  await page.waitForTimeout(getRandomInt(4000, 8000));

    const response = await page.goto(site, { 
      referer: referrer,
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });
    
    if (!response || response.status() >= 400) {
      throw new Error(`Página retornou status ${response?.status() || 'desconhecido'}`);
    }
    
    await page.waitForTimeout(4000); // 🔒 Garante 4 segundos com a página aberta
    


  const screenshotPath = path.join(process.cwd(), 'screenshot_ads_fullscreen.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('📸 Screenshot salva em:', screenshotPath);

  console.log('🔍 Procurando iframe de anúncio Google...');
  const adFrame = await page.waitForSelector('iframe[id^="google_ads_iframe"]', { timeout: 20000 }).catch(() => null);

  if (!adFrame) {
    console.log('❌ Nenhum iframe de anúncio encontrado.');
    await browser.close();
    return;
  }

  const box = await adFrame.boundingBox();

  if (!box) {
    console.log('❌ Não foi possível obter boundingBox do iframe.');
    await browser.close();
    return;
  }

  console.log(`📐 Coordenadas do anúncio: x=${box.x}, y=${box.y}`);

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  console.log('🖱️ Movendo mouse com trajetória realista até o anúncio...');
  await page.mouse.move(centerX - 100, centerY - 100, { steps: 20 });
  await page.waitForTimeout(1200);
  await page.mouse.move(centerX - 50, centerY - 50, { steps: 15 });
  await page.waitForTimeout(1200);
  await page.mouse.move(centerX, centerY, { steps: 10 });

  await page.waitForTimeout(4000);

  console.log('🖱️ Simulando clique real com mouse down/up...');
  await page.mouse.down({ button: 'left' });
  await page.waitForTimeout(200);
  await page.mouse.up({ button: 'left' });

  await page.waitForTimeout(8000);

  console.log('✅ Clique real enviado com sucesso.');

  await browser.close();
})();
