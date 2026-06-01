package com.travelviet.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class BookingPage {
    private WebDriver driver;
    private WebDriverWait wait;
    
    // Locators for Step 1
    private By numPeopleInput = By.name("numPeople");
    private By dateSelector = By.cssSelector(".react-datepicker-wrapper input");
    private By nextButton = By.xpath("//button[contains(text(), 'Tiếp tục')]");
    
    // Locators for Step 2
    private By passengerName = By.name("passengers[0].fullName");
    private By step2Identifier = By.xpath("//h3[contains(text(), 'Thông tin hành khách')]");
    private By backButton = By.xpath("//button[contains(text(), 'Quay lại')]");
    
    // Error
    private By errorMessage = By.cssSelector(".text-destructive");

    public BookingPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public BookingPage setNumPeople(String count) {
        wait.until(ExpectedConditions.presenceOfElementLocated(numPeopleInput));
        WebElement input = driver.findElement(numPeopleInput);
        input.clear();
        input.sendKeys(count);
        return this;
    }

    public BookingPage clickNext() {
        driver.findElement(nextButton).click();
        return this;
    }

    public boolean isStep2Displayed() {
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(step2Identifier));
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public BookingPage clickBack() {
        wait.until(ExpectedConditions.elementToBeClickable(backButton)).click();
        return this;
    }
    
    public String getErrorMessage() {
        wait.until(ExpectedConditions.presenceOfElementLocated(errorMessage));
        return driver.findElement(errorMessage).getText();
    }
}
