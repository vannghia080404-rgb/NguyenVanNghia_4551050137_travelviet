const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Listen for console logs
    page.on('console', msg => {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}]: ${msg.text()}`);
    });

    // Listen for page errors (uncaught exceptions)
    page.on('pageerror', err => {
        console.error(`[PAGE ERROR]: ${err.toString()}`);
    });

    // Listen for request failures
    page.on('requestfailed', request => {
        console.warn(`[REQUEST FAILED]: ${request.url()} - ${request.failure().errorText}`);
    });

    try {
        console.log("Navigating to http://localhost:8080/destinations...");
        await page.goto('http://localhost:8080/destinations', { waitUntil: 'load', timeout: 15000 });
        console.log("Page loaded. Waiting 5 seconds for any async issues...");
        await page.waitForTimeout(5000);
        console.log("Done!");
    } catch (e) {
        console.error("Navigation error:", e);
    } finally {
        await browser.close();
    }
})();
