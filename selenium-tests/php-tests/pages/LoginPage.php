<?php
namespace Pages;

use Facebook\WebDriver\WebDriver;
use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverExpectedCondition;

class LoginPage {
    protected $driver;
    protected $baseUrl = 'http://localhost:5173';

    // Locators
    private $emailInput = WebDriverBy::name('email');
    private $passwordInput = WebDriverBy::name('password');
    private $loginButton = WebDriverBy::xpath('//button[@type="submit"]');
    private $errorMessage = WebDriverBy::cssSelector('.text-destructive');
    private $userMenu = WebDriverBy::cssSelector('.lucide-user'); // Assuming avatar/menu icon

    public function __construct(WebDriver $driver) {
        $this->driver = $driver;
    }

    public function goTo() {
        $this->driver->get($this->baseUrl . '/login');
        return $this;
    }

    public function loginAs($email, $password) {
        // Wait for elements to be present
        $this->driver->wait(5)->until(
            WebDriverExpectedCondition::presenceOfElementLocated($this->emailInput)
        );
        
        $this->driver->findElement($this->emailInput)->sendKeys($email);
        $this->driver->findElement($this->passwordInput)->sendKeys($password);
        $this->driver->findElement($this->loginButton)->click();
    }

    public function getErrorMessage() {
        $this->driver->wait(5)->until(
            WebDriverExpectedCondition::presenceOfElementLocated($this->errorMessage)
        );
        return $this->driver->findElement($this->errorMessage)->getText();
    }

    public function isLoggedIn() {
        // Check if user menu/avatar appears indicating successful login
        $this->driver->wait(5)->until(
            WebDriverExpectedCondition::presenceOfElementLocated($this->userMenu)
        );
        return count($this->driver->findElements($this->userMenu)) > 0;
    }
}
