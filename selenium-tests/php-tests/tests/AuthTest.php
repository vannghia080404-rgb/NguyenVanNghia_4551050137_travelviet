<?php
namespace Tests;

use PHPUnit\Framework\TestCase;
use Facebook\WebDriver\Remote\RemoteWebDriver;
use Facebook\WebDriver\Remote\DesiredCapabilities;
use Pages\LoginPage;

class AuthTest extends TestCase {
    protected $driver;

    protected function setUp(): void {
        // Requires Selenium Server running on port 4444 (e.g. java -jar selenium-server.jar standalone)
        $serverUrl = 'http://localhost:4444/wd/hub';
        $this->driver = RemoteWebDriver::create($serverUrl, DesiredCapabilities::chrome());
    }

    // ST02: Đăng nhập thành công
    public function testSuccessfulLogin() {
        $loginPage = new LoginPage($this->driver);
        $loginPage->goTo();
        
        // Use an existing test user
        $loginPage->loginAs('test@gmail.com', '123456');
        
        $this->assertTrue($loginPage->isLoggedIn(), "Navbar should display user avatar after successful login.");
    }

    // ST03: Đăng nhập sai
    public function testFailedLogin() {
        $loginPage = new LoginPage($this->driver);
        $loginPage->goTo();
        
        $loginPage->loginAs('test@gmail.com', 'wrongpassword');
        
        $errorMessage = $loginPage->getErrorMessage();
        $this->assertStringContainsString("không đúng", strtolower($errorMessage), "Error message should appear for wrong credentials.");
    }

    protected function tearDown(): void {
        if ($this->driver !== null) {
            $this->driver->quit();
        }
    }
}
