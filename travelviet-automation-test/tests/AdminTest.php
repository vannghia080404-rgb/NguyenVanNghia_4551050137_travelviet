<?php
namespace Tests;

use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverExpectedCondition;
use Pages\LoginPage;

class AdminTest extends BaseTest
{
    public function setUp(): void
    {
        parent::setUp();
        // Login as admin
        $loginPage = new LoginPage($this->driver);
        $loginPage->load($this->baseUrl);
        // Assuming admin account
        $loginPage->loginAs('admin@travelviet.vn', '123456'); // updated credentials
        $this->driver->wait(5)->until(WebDriverExpectedCondition::urlContains('/'));
    }

    public function testAdminAccess()
    {
        $this->driver->get($this->baseUrl . '/admin/dashboard');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Dashboard")]')));
        $this->assertStringContainsString('Dashboard', $this->driver->getPageSource());
    }

    public function testAddTourValid()
    {
        $this->driver->get($this->baseUrl . '/admin/tours');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//button[contains(text(), "Thêm Tour")]')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Thêm Tour")]'))->click();
        
        // Wait for modal
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::name('name')));
        $this->driver->findElement(WebDriverBy::name('name'))->sendKeys('Test Tour Selenium');
        $this->driver->findElement(WebDriverBy::name('price'))->sendKeys('1500000');
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Lưu")]'))->click();
        
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Thành công")]')));
    }

    public function testAddTourValidation()
    {
        $this->driver->get($this->baseUrl . '/admin/tours');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//button[contains(text(), "Thêm Tour")]')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Thêm Tour")]'))->click();
        
        // Save without data
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//button[contains(text(), "Lưu")]')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Lưu")]'))->click();
        
        $this->assertStringContainsString('lỗi', strtolower($this->driver->getPageSource()));
    }

    public function testManageDestinations()
    {
        $this->driver->get($this->baseUrl . '/admin/destinations');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//button[contains(text(), "Thêm Điểm Đến")]')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Thêm Điểm Đến")]'))->click();
        
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::name('name')));
        $this->driver->findElement(WebDriverBy::name('name'))->sendKeys('Selenium Destination');
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Lưu")]'))->click();
        
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Thành công")]')));
    }

    public function testViewBookingsList()
    {
        $this->driver->get($this->baseUrl . '/admin/bookings');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Quản lý đơn đặt")]')));
        
        // Assert there is a table or list
        $this->assertTrue(count($this->driver->findElements(WebDriverBy::cssSelector('table'))) > 0);
    }

    public function testChangeBookingStatus()
    {
        $this->driver->get($this->baseUrl . '/admin/bookings');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Quản lý đơn đặt")]')));
        
        // Change status to Contacted
        $buttons = $this->driver->findElements(WebDriverBy::xpath('//button[contains(text(), "Xác nhận đã liên hệ")]'));
        if (count($buttons) > 0) {
            $buttons[0]->click();
            $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Thành công")]')));
        }
    }

    public function testAddHotel()
    {
        $this->driver->get($this->baseUrl . '/admin/hotels');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//button[contains(text(), "Thêm Khách Sạn") or contains(text(), "Khách sạn mới")]')));
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Thêm Khách Sạn") or contains(text(), "Khách sạn mới")]'))->click();
        
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::name('name')));
        $this->driver->findElement(WebDriverBy::name('name'))->sendKeys('Selenium Hotel');
        $this->driver->findElement(WebDriverBy::name('price_per_night'))->sendKeys('500000');
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Lưu")]'))->click();
        
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Thành công")]')));
    }
}
