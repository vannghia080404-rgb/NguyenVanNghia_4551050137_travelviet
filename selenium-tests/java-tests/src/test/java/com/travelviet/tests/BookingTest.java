package com.travelviet.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import com.travelviet.pages.BookingPage;

import static org.junit.jupiter.api.Assertions.*;

public class BookingTest {
    private WebDriver driver;
    private BookingPage bookingPage;
    
    @BeforeAll
    static void setupClass() {
        WebDriverManager.chromedriver().setup();
    }
    
    @BeforeEach
    void setupTest() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        // Assuming user is logged in and is on a booking page for a specific tour
        // In a real test suite, you'd perform login first, then navigate to /tours/tour-slug/booking
        driver.get("http://localhost:5173/tours/kham-pha-vinh-ha-long/booking"); // Example slug
        bookingPage = new BookingPage(driver);
    }
    
    // ST07: Booking bước 1 (Hợp lệ)
    @Test
    void testBookingStep1Valid() {
        bookingPage.setNumPeople("2").clickNext();
        assertTrue(bookingPage.isStep2Displayed(), "Step 2 should be displayed after valid Step 1");
    }
    
    // ST10: Validate trống số người
    @Test
    void testBookingStep1EmptyFields() {
        bookingPage.setNumPeople("0").clickNext();
        String error = bookingPage.getErrorMessage();
        assertNotNull(error, "Error message should be displayed for invalid number of people");
    }
    
    // ST11: Back bước
    @Test
    void testBookingGoBackToStep1() {
        bookingPage.setNumPeople("2").clickNext();
        assertTrue(bookingPage.isStep2Displayed(), "Should be on Step 2");
        
        bookingPage.clickBack();
        // Check if back on step 1 (NumPeople input is present)
        assertFalse(bookingPage.isStep2Displayed(), "Should not be on Step 2 after clicking back");
    }

    @AfterEach
    void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
