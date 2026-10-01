import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  
  await page.goto("http://localhost:5173/cli?code=FEBB-7352", { waitUntil: "networkidle0" });
  await page.screenshot({ path: "screenshot.png" });
  
  await browser.close();
})();
