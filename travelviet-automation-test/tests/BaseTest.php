<?php

namespace Tests;

use Facebook\WebDriver\Remote\DesiredCapabilities;
use Facebook\WebDriver\Remote\RemoteWebDriver;
use PHPUnit\Framework\TestCase;
use Facebook\WebDriver\Chrome\ChromeOptions;

class BaseTest extends TestCase
{
    protected $driver;
    protected $baseUrl = 'http://localhost:8080'; // Vite frontend URL

    protected function setUp(): void
    {
        // Require ChromeDriver running on port 9515 (e.g., via `chromedriver --port=9515`)
        $serverUrl = 'http://localhost:9515';
        
        $options = new ChromeOptions();
        $options->setBinary('C:\Users\nghia\Downloads\chrome-win64 (1)\chrome-win64\chrome.exe');
        
        $capabilities = DesiredCapabilities::chrome();
        $capabilities->setCapability(ChromeOptions::CAPABILITY_W3C, $options);
        
        $this->driver = RemoteWebDriver::create($serverUrl, $capabilities);
        $this->driver->manage()->window()->maximize();
    }

    protected function tearDown(): void
    {
        if ($this->driver) {
            $this->driver->quit();
        }
    }
}
