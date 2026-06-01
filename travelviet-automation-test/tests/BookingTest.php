<?php
namespace Tests;

use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverExpectedCondition;
use Pages\LoginPage;

class BookingTest extends BaseTest
{
    public function setUp(): void
    {
        parent::setUp();
        // Login first for booking tests
        $loginPage = new LoginPage($this->driver);
        $loginPage->load($this->baseUrl);
        $loginPage->loginAs('test@example.com', 'password');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::urlContains('/'));
    }

    public function testBookingStep1Valid()
    {
        $this->driver->get($this->baseUrl . '/tours/kham-pha-vinh-ha-long-tren-du-thuyen-5-sao');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//button[contains(text(), "Đặt ngay")]')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Đặt ngay")]'))->click();
        
        $this->driver->wait(5)->until(WebDriverExpectedCondition::urlContains('/booking/'));
        
        // Select date and quantity
        $this->driver->findElement(WebDriverBy::cssSelector('input[type="date"]'))->sendKeys(date('Y-m-d', strtotime('+5 days')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Tiếp tục")]'))->click();
        
        // Verify Step 2 is shown
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::cssSelector('input[name="passengers.0.fullName"]')));
    }

    public function testBookingStep1ExceedSlots()
    {
        $this->driver->get($this->baseUrl . '/tours/kham-pha-vinh-ha-long-tren-du-thuyen-5-sao');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//button[contains(text(), "Đặt ngay")]')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Đặt ngay")]'))->click();
        
        // Try to increase guests beyond limit
        for($i=0; $i<50; $i++) {
            try { $this->driver->findElement(WebDriverBy::xpath('//button/lucide-plus'))->click(); } catch (\Exception $e) {}
        }
        $this->driver->findElement(WebDriverBy::cssSelector('input[type="date"]'))->sendKeys(date('Y-m-d', strtotime('+5 days')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Tiếp tục")]'))->click();
        
        $this->driver->wait(3)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "vượt quá")]')));
    }

    public function testBookingStep2EmptyFields()
    {
        // ... (Navigating to Step 2)
        $this->testBookingStep1Valid();
        
        // Empty fields, just click Next
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Tiếp tục")]'))->click();
        
        // Check for validation error
        $this->driver->wait(3)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "không được để trống")]')));
    }

    public function testBookingStep3CashPayment()
    {
        // Go through Step 1
        $this->testBookingStep1Valid();
        
        // Fill Step 2
        $this->driver->findElement(WebDriverBy::cssSelector('input[name="passengers.0.fullName"]'))->sendKeys('Nguyen Van A');
        $this->driver->findElement(WebDriverBy::cssSelector('input[name="passengers.0.phone"]'))->sendKeys('0123456789');
        $this->driver->findElement(WebDriverBy::cssSelector('input[name="passengers.0.idCard"]'))->sendKeys('012345678912');
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Tiếp tục")]'))->click();
        
        // Step 3: Cash Payment
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//button[contains(text(), "Tiền mặt")]')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Tiền mặt")]'))->click();
        
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Thanh toán")]'))->click();
        
        // Verify success
        $this->driver->wait(10)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Thành công")]')));
    }
}
