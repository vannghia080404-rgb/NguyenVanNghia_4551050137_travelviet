const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const outputDir = __dirname;

    try {
        console.log('Testing Registration...');
        await page.goto('http://localhost:8081/register', { waitUntil: 'networkidle2' });

        // Nhấn nút Đăng ký khi để trống (TC04)
        await page.click('button[type="submit"]');
        await sleep(1500);
        await page.screenshot({ path: path.join(outputDir, 'TC04_error_empty_registration.png') });
        console.log('Saved TC04_error_empty_registration.png');

        console.log('Testing Login...');
        await page.goto('http://localhost:8081/login', { waitUntil: 'networkidle2' });

        // Nhập sai mật khẩu (TC06)
        await page.type('input[type="email"]', 'test@example.com');
        await page.type('input[type="password"]', 'wrongpass');
        await page.click('button[type="submit"]');
        await sleep(1500);
        await page.screenshot({ path: path.join(outputDir, 'TC06_error_wrong_password.png') });
        console.log('Saved TC06_error_wrong_password.png');

        console.log('Testing Destinations Page Layout (TC30)...');
        await page.goto('http://localhost:8081/destinations', { waitUntil: 'networkidle2' });
        await sleep(2500);
        await page.screenshot({ path: path.join(outputDir, 'TC30_destinations_layout.png') });
        console.log('Saved TC30_destinations_layout.png');

    } catch (err) {
        console.error('Error during testing:', err);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
