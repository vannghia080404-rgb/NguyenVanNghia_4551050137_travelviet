<?php

namespace Tests;

use Pages\LoginPage;
use Facebook\WebDriver\WebDriverExpectedCondition;

class AuthTest extends BaseTest
{
    /**
     * Kịch bản: ST02 - Đăng nhập
     */
    public function testLoginSuccess()
    {
        $loginPage = new LoginPage($this->driver);
        $loginPage->load($this->baseUrl);
        
        // Use a valid account from seeders
        $loginPage->loginAs('test@example.com', 'password');

        // Wait for redirect to home or dashboard by checking URL
        $this->driver->wait(10)->until(
            WebDriverExpectedCondition::urlContains('/') // assuming it redirects to root
        );

        $this->assertStringNotContainsString('login', $this->driver->getCurrentURL());
    }

    /**
     * Kịch bản: ST03 - Đăng nhập sai
     */
    public function testLoginFailure()
    {
        $loginPage = new LoginPage($this->driver);
        $loginPage->load($this->baseUrl);
        
        // Use invalid credentials
        $loginPage->loginAs('wrong@example.com', 'wrongpassword');

        // Verify error message
        $errorMessage = $loginPage->getErrorMessage();
        $this->assertNotEmpty($errorMessage);
        $this->assertStringContainsStringIgnoringCase('không đúng', $errorMessage);
    }
}
