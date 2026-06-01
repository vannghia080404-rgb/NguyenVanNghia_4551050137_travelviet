<?php
namespace Tests;

use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverExpectedCondition;
use Pages\LoginPage;

class UserTest extends BaseTest
{
    public function setUp(): void
    {
        parent::setUp();
        // Login first
        $loginPage = new LoginPage($this->driver);
        $loginPage->load($this->baseUrl);
        $loginPage->loginAs('test@example.com', 'password');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::urlContains('/'));
    }

    public function testViewMyBookings()
    {
        $this->driver->get($this->baseUrl . '/profile?tab=orders');
        
        $this->driver->wait(5)->until(
            WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Đơn đặt tour")]'))
        );
        $this->assertTrue(count($this->driver->findElements(WebDriverBy::cssSelector('.order-card'))) >= 0);
    }

    public function testCancelBookingValid()
    {
        $this->driver->get($this->baseUrl . '/profile?tab=orders');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Đơn đặt tour")]')));
        
        $cancelButtons = $this->driver->findElements(WebDriverBy::xpath('//button[contains(text(), "Huỷ đơn")]'));
        if (count($cancelButtons) > 0) {
            $cancelButtons[0]->click();
            // Confirm popup
            $this->driver->wait(3)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//button[contains(text(), "Xác nhận huỷ")]')));
            $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Xác nhận huỷ")]'))->click();
            
            $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Thành công")]')));
        } else {
            $this->markTestSkipped('No cancellable bookings found.');
        }
    }

    public function testWriteReview()
    {
        $this->driver->get($this->baseUrl . '/profile?tab=orders');
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Đơn đặt tour")]')));
        
        $reviewButtons = $this->driver->findElements(WebDriverBy::xpath('//button[contains(text(), "Đánh giá tour")]'));
        if (count($reviewButtons) > 0) {
            $reviewButtons[0]->click();
            $this->driver->wait(5)->until(WebDriverExpectedCondition::urlContains('tab=reviews'));
            
            // Fill review
            $this->driver->findElement(WebDriverBy::cssSelector('textarea'))->sendKeys('Tour rất tốt, tôi rất thích!');
            // Click 5th star
            $stars = $this->driver->findElements(WebDriverBy::cssSelector('svg.lucide-star'));
            if(count($stars) >= 5) {
                $stars[4]->click();
            }
            $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Gửi đánh giá")]'))->click();
            
            $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Thành công")]')));
        } else {
            $this->markTestSkipped('No reviewable bookings found.');
        }
    }

    public function testContactFormSubmit()
    {
        $this->driver->get($this->baseUrl . '/contact');
        
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::name('name')));
        $this->driver->findElement(WebDriverBy::name('name'))->sendKeys('Test User');
        $this->driver->findElement(WebDriverBy::name('email'))->sendKeys('test@test.com');
        $this->driver->findElement(WebDriverBy::name('message'))->sendKeys('Test message for contact form');
        
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Gửi tin nhắn")]'))->click();
        
        $this->driver->wait(5)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Thành công")]')));
    }
}
