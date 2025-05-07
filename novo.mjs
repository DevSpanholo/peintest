import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
            has_touch=True,
            is_mobile=True,
            viewport={'width': 375, 'height': 667},
            locale='pt-BR',
            geolocation={"latitude": -23.5505, "longitude": -46.6333},
            permissions=['geolocation']
        )

        page = await context.new_page()
        url = 'https://brasilquiz.com/sorteio/participe-e-conquiste-um-playstation-5-ou-um-pc-gamer-com-o-cifra-do-bem/?utm_source=698&utm_term=698&cf_ads=698'
        print(f"🌍 Abrindo página: {url}")
        await page.goto(url, wait_until='load', timeout=120000)

        await page.wait_for_timeout(7000)

        print('🔍 Procurando iframe de anúncio Google...')
        ad_frame = await page.query_selector('iframe[id^="google_ads_iframe"]')
        if not ad_frame:
            print('❌ Nenhum iframe de anúncio encontrado.')
            await browser.close()
            return

        box = await ad_frame.bounding_box()
        if not box:
            print('❌ Não foi possível obter boundingBox do iframe.')
            await browser.close()
            return

        print(f"📐 Coordenadas do anúncio: x={box['x']}, y={box['y']}")
        center_x = box['x'] + box['width'] / 2
        center_y = box['y'] + box['height'] / 2

        print('🖱️ Movendo mouse com trajetória realista até o anúncio...')
        await page.mouse.move(center_x - 100, center_y - 100, steps=20)
        await page.wait_for_timeout(1200)
        await page.mouse.move(center_x - 50, center_y - 50, steps=15)
        await page.wait_for_timeout(1200)
        await page.mouse.move(center_x, center_y, steps=10)
        await page.wait_for_timeout(4000)

        print('🖱️ Simulando clique real com mouse down/up...')
        await page.mouse.down(button='left')
        await page.wait_for_timeout(200)
        await page.mouse.up(button='left')
        await page.wait_for_timeout(5000)

        print('✅ Clique real enviado com sucesso.')
        await browser.close()

asyncio.run(run())
