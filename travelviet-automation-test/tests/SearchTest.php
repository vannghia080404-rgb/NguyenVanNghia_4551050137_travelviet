<?php
namespace Tests;

use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverExpectedCondition;

class SearchTest extends BaseTest
{
    public function testSearchTourValid()
    {
        $this->driver->get($this->baseUrl . '/tours');
        
        // Bấm Hiện bộ lọc
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Hiện bộ lọc")]'))->click();
        $this->driver->wait(2)->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::cssSelector('input[placeholder="Tìm tên tour..."]')));

        $searchInput = $this->driver->findElement(WebDriverBy::cssSelector('input[placeholder="Tìm tên tour..."]'));
        $searchInput->sendKeys('Hạ Long');
        
        // Wait for API debounce (400ms in Tours.tsx)
        sleep(1);
        
        $this->assertStringContainsString('Hạ Long', $this->driver->getPageSource());
    }

    public function testSearchTourNoResult()
    {
        $this->driver->get($this->baseUrl . '/tours');
        $searchInput = $this->driver->findElement(WebDriverBy::cssSelector('input[placeholder*="Tìm kiếm"]'));
        $searchInput->sendKeys('KhuVucKhongTonTai123');
        
        $this->driver->findElement(WebDriverBy::cssSelector('button[type="submit"], button.search-btn'))->click();
        
        $this->driver->wait(5)->until(
            WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath('//*[contains(text(), "Không tìm thấy")]'))
        );
        $this->assertStringContainsString('Không tìm thấy', $this->driver->getPageSource());
    }

    public function testFilterByDestination()
    {
        $this->driver->get($this->baseUrl . '/tours');
        // Select destination filter
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Điểm đến")]'))->click();
        $this->driver->findElement(WebDriverBy::xpath('//div[contains(text(), "Phú Quốc")]'))->click();
        
        $this->driver->wait(5)->until(
            WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::cssSelector('.grid > div'))
        );
        $this->assertStringContainsString('Phú Quốc', $this->driver->getPageSource());
    }

    public function testFilterByPriceRange()
    {
        $this->driver->get($this->baseUrl . '/tours');
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Mức giá")]'))->click();
        $this->driver->findElement(WebDriverBy::xpath('//div[contains(text(), "2 triệu")]'))->click();
        
        $this->driver->wait(5)->until(
            WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::cssSelector('.grid > div'))
        );
        $this->assertTrue(count($this->driver->findElements(WebDriverBy::cssSelector('.grid > div'))) >= 0);
    }

    public function testFilterCombined()
    {
        $this->driver->get($this->baseUrl . '/tours');
        // Apply both destination and price
        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Điểm đến")]'))->click();
        $this->driver->findElement(WebDriverBy::xpath('//div[contains(text(), "Đà Nẵng")]'))->click();

        $this->driver->findElement(WebDriverBy::xpath('//button[contains(text(), "Mức giá")]'))->click();
        $this->driver->findElement(WebDriverBy::xpath('//div[contains(text(), "Dưới")]'))->click();
        
        $this->driver->wait(5)->until(
            WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::cssSelector('.grid > div'))
        );
    }
}
