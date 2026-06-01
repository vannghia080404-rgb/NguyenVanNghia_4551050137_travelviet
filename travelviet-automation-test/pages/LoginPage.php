<?php

namespace Pages;

use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverExpectedCondition;
use Facebook\WebDriver\Remote\RemoteWebDriver;

class LoginPage
{
    private $driver;

    // Locators based on standard input types and attributes (No custom IDs needed)
    private $emailInput = "input[type='email']";
    private $passwordInput = "input[type='password']";
    private $submitButton = "button[type='submit']";
    private $errorMessage = ".text-destructive, .text-red-500"; // Assuming Tailwind classes for errors

    public function __construct(RemoteWebDriver $driver)
    {
        $this->driver = $driver;
    }

    public function load($baseUrl)
    {
        $this->driver->get($baseUrl . '/login');
        // Wait until email input is present
        $this->driver->wait(10)->until(
            WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::cssSelector($this->emailInput))
        );
    }

    public function loginAs($email, $password)
    {
        $this->driver->findElement(WebDriverBy::cssSelector($this->emailInput))->sendKeys($email);
        $this->driver->findElement(WebDriverBy::cssSelector($this->passwordInput))->sendKeys($password);
        $this->driver->findElement(WebDriverBy::cssSelector($this->submitButton))->click();
    }

    public function getErrorMessage()
    {
        $this->driver->wait(5)->until(
            WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::cssSelector($this->errorMessage))
        );
        return $this->driver->findElement(WebDriverBy::cssSelector($this->errorMessage))->getText();
    }
}
