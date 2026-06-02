CREATE DATABASE  IF NOT EXISTS `travelviet` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `travelviet`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: travelviet
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking_travelers`
--

DROP TABLE IF EXISTS `booking_travelers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_travelers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_card` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_travelers_booking_id_foreign` (`booking_id`),
  CONSTRAINT `booking_travelers_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_travelers`
--

LOCK TABLES `booking_travelers` WRITE;
/*!40000 ALTER TABLE `booking_travelers` DISABLE KEYS */;
INSERT INTO `booking_travelers` VALUES (1,1,'cc','ccccc','2026-05-09','ccc','2026-05-29 02:56:26','2026-05-29 02:56:26'),(2,1,'xxx','xxxxxx','2026-05-17','xxx','2026-05-29 02:56:26','2026-05-29 02:56:26'),(3,1,'xxx','xxxx','2026-05-17','xxxxx','2026-05-29 02:56:26','2026-05-29 02:56:26'),(4,2,'d','ddd','2026-05-31','ddd','2026-05-29 02:57:44','2026-05-29 02:57:44'),(5,3,'fgffg','fgfg','2026-05-08','gfgffg','2026-05-29 03:14:26','2026-05-29 03:14:26'),(6,4,'gh','g','2026-05-09','g','2026-05-29 03:16:11','2026-05-29 03:16:11'),(7,5,'ss','ss','2026-05-09','ssss','2026-05-29 03:18:22','2026-05-29 03:18:22'),(8,6,'ss','ss','2026-05-09','ssss','2026-05-29 03:18:23','2026-05-29 03:18:23'),(10,8,'fgjkjj','gdfghkjk;l','2026-05-31','0000000','2026-05-30 00:46:07','2026-05-30 00:46:07'),(11,9,'fgjkjj','gdfghkjk;l','2026-05-31','0000000','2026-05-30 00:46:27','2026-05-30 00:46:27'),(12,10,'fgjkjj','gdfghkjk;l','2026-05-31','0000000','2026-05-30 00:46:32','2026-05-30 00:46:32'),(13,11,'fgjkjj','gdfghkjk;l','2026-05-31','0000000','2026-05-30 00:46:38','2026-05-30 00:46:38'),(14,12,'ưdfghj','sdfg','2026-05-01','sdfgh','2026-05-30 00:49:01','2026-05-30 00:49:01'),(15,13,'ávdbfngmn','sdcvb','2026-05-16','sdfg','2026-05-30 01:08:15','2026-05-30 01:08:15'),(16,14,'sddhbm','sdfb','2026-05-03','ádfbn','2026-05-30 01:12:23','2026-05-30 01:12:23'),(17,15,'fghg','qưdefrgh','2026-06-12','ádfgh','2026-06-01 00:49:32','2026-06-01 00:49:32'),(18,16,'g','g','2026-06-13','g','2026-06-01 00:53:01','2026-06-01 00:53:01');
/*!40000 ALTER TABLE `booking_travelers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `tour_id` bigint unsigned NOT NULL,
  `departure_date` date NOT NULL,
  `num_people` int NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vnpay',
  `payment_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_receipt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `payment_receipt_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `hotel_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookings_booking_code_unique` (`booking_code`),
  KEY `bookings_user_id_foreign` (`user_id`),
  KEY `bookings_tour_id_foreign` (`tour_id`),
  KEY `bookings_hotel_id_foreign` (`hotel_id`),
  CONSTRAINT `bookings_hotel_id_foreign` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_tour_id_foreign` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'BK-TOMTSY',1,1,'2026-06-01',3,7500000.00,'confirmed','viettel_money','completed',NULL,NULL,NULL,'2026-05-29 02:56:26','2026-05-29 03:12:50',2),(2,'BK-ONMVJU',1,1,'2026-06-01',1,2500000.00,'cancelled','viettel_money','refunded','/storage/receipts/1780048768_dreamina-2026-05-15-4065-Tiếp tục cảnh quan từ ảnh gốc, góc máy q.jpeg',NULL,NULL,'2026-05-29 02:57:44','2026-05-29 03:46:16',NULL),(3,'BK-2TTTYW',1,1,'2026-07-05',1,2500000.00,'contacted','viettel_money','pending',NULL,NULL,NULL,'2026-05-29 03:14:26','2026-05-29 22:13:32',2),(4,'BK-MFDFO1',1,1,'2026-05-30',1,2500000.00,'completed','vnpay','completed',NULL,NULL,NULL,'2026-05-29 03:16:11','2026-05-29 03:52:14',1),(5,'BK-THEPHV',1,1,'2026-05-30',1,2500000.00,'confirmed','cash','pending',NULL,NULL,NULL,'2026-05-29 03:18:22','2026-05-29 03:48:38',2),(6,'BK-IKEXEP',1,1,'2026-05-30',1,2500000.00,'cancelled','cash','failed',NULL,NULL,NULL,'2026-05-29 03:18:23','2026-05-30 19:55:27',2),(8,'BK-K7ZRJJ',1,1,'2026-06-27',1,2500000.00,'completed','viettel_money','pending',NULL,NULL,NULL,'2026-05-30 00:46:07','2026-05-30 19:56:48',2),(9,'BK-HUHJPD',1,1,'2026-06-27',1,2500000.00,'cancelled','viettel_money','pending',NULL,'[Hệ thống] Tự động hủy đơn do quá 3 giờ không thanh toán.',NULL,'2026-05-30 00:46:27','2026-05-31 08:27:24',2),(10,'BK-GGHD5P',1,1,'2026-06-27',1,2500000.00,'cancelled','viettel_money','pending',NULL,'[Hệ thống] Tự động hủy đơn do quá 3 giờ không thanh toán.',NULL,'2026-05-30 00:46:32','2026-05-31 08:27:24',2),(11,'BK-YMU3PK',1,1,'2026-06-27',1,2500000.00,'cancelled','viettel_money','pending',NULL,'[Hệ thống] Tự động hủy đơn do quá 3 giờ không thanh toán.',NULL,'2026-05-30 00:46:38','2026-05-31 08:27:24',2),(12,'BK-ZUIQZS',1,1,'2026-07-12',1,2500000.00,'completed','viettel_money','pending',NULL,NULL,NULL,'2026-05-30 00:49:01','2026-05-30 20:38:25',2),(13,'BK-FG8AHB',1,1,'2026-06-14',1,2500000.00,'cancelled','viettel_money','completed','/storage/receipts/1780128524_z7881731520558_de39a798a838f8c72d45fa888025c401.jpg',NULL,NULL,'2026-05-30 01:08:15','2026-05-30 19:52:04',NULL),(14,'BK-EFRHVZ',1,1,'2026-06-20',1,2500000.00,'cancelled','viettel_money','refunded','/storage/receipts/1780129365_vannghia.jpg',NULL,NULL,'2026-05-30 01:12:23','2026-05-30 19:50:27',2),(15,'BK-L6JTU1',1,1,'2026-06-20',1,2500000.00,'pending','viettel_money','pending',NULL,NULL,NULL,'2026-06-01 00:49:32','2026-06-01 00:49:32',NULL),(16,'BK-2LHCV8',1,1,'2026-06-10',1,2500000.00,'pending','viettel_money','pending',NULL,NULL,NULL,'2026-06-01 00:53:01','2026-06-01 00:53:01',2);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('travelviet-cache-site_settings_global','a:25:{s:12:\"company_name\";s:29:\"Công ty Du lịch TravelViet\";s:13:\"company_phone\";s:9:\"123456789\";s:13:\"company_email\";s:21:\"nghia080404@gmail.com\";s:15:\"company_address\";s:53:\"123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh\";s:11:\"company_map\";N;s:15:\"social_facebook\";s:53:\"https://www.facebook.com/nv.nghia.547569?locale=vi_VN\";s:14:\"social_youtube\";s:30:\"https://youtube.com/travelviet\";s:13:\"social_tiktok\";N;s:11:\"social_zalo\";s:10:\"0356589637\";s:21:\"payment_vnpay_enabled\";s:5:\"false\";s:23:\"payment_viettel_enabled\";s:4:\"true\";s:20:\"payment_momo_enabled\";s:5:\"false\";s:20:\"payment_cash_enabled\";s:4:\"true\";s:10:\"page_terms\";s:17:\"<p>Đfffff...</p>\";s:12:\"page_privacy\";s:19:\"<p>Đfffffft...</p>\";s:10:\"page_about\";s:19:\"<p>Đanffffy...</p>\";s:8:\"page_faq\";s:55:\"<p>Đang cập nhật câu hỏi thường gặp...</p>\";s:21:\"stat_experience_years\";s:3:\"10+\";s:20:\"stat_happy_customers\";s:7:\"15.000+\";s:17:\"stat_destinations\";s:2:\"4+\";s:11:\"stat_rating\";s:3:\"5/5\";s:23:\"social_facebook_enabled\";s:4:\"true\";s:22:\"social_youtube_enabled\";s:5:\"false\";s:21:\"social_tiktok_enabled\";s:5:\"false\";s:19:\"social_zalo_enabled\";s:4:\"true\";}',1780371276);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (2,'Khám phá','kham-pha','Những chuyến đi mang tính trải nghiệm, khám phá vùng đất mới.','2026-05-26 23:24:46','2026-05-26 23:24:46'),(3,'Sinh thái','sinh-thai','Trải nghiệm du lịch gần gũi với thiên nhiên.','2026-05-26 23:24:46','2026-05-26 23:24:46'),(4,'Biển đảo','bien-dao','Tận hưởng vẻ đẹp của những bãi biển và hòn đảo hoang sơ.','2026-05-26 23:24:46','2026-05-26 23:24:46'),(5,'Văn hoá','van-hoa','Khám phá các di sản, nét đẹp văn hóa và lịch sử.','2026-05-26 23:24:46','2026-05-26 23:24:46'),(6,'Nghỉ dưỡng','nghi-duong','Tận hưởng dịch vụ cao cấp, thư giãn tâm hồn.','2026-05-26 23:24:46','2026-05-26 23:24:46');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_ranks`
--

DROP TABLE IF EXISTS `customer_ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_ranks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_spending` decimal(15,2) NOT NULL DEFAULT '0.00',
  `discount_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `badge_icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_ranks`
--

LOCK TABLES `customer_ranks` WRITE;
/*!40000 ALTER TABLE `customer_ranks` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_ranks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinations`
--

DROP TABLE IF EXISTS `destinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `destinations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `destinations_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinations`
--

LOCK TABLES `destinations` WRITE;
/*!40000 ALTER TABLE `destinations` DISABLE KEYS */;
INSERT INTO `destinations` VALUES (1,'Hà Nội','Thủ đô ngàn năm văn hiến','north','ha-noi','https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=800','Trung tâm văn hóa, lịch sử lâu đời của Việt Nam với 36 phố phường.','from-red-600/20','2026-05-26 23:24:46','2026-05-26 23:24:46'),(2,'Hạ Long','Kỳ quan thiên nhiên thế giới','north','ha-long','https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800','Hàng ngàn hòn đảo đá vôi kỳ vĩ và những hang động tuyệt đẹp.','from-emerald-600/20','2026-05-26 23:24:46','2026-05-26 23:24:46'),(3,'Sa Pa','Thành phố trong sương','north','sa-pa','https://images.unsplash.com/photo-1543333995-a78aea2fee50?auto=format&fit=crop&q=80&w=800','Những thửa ruộng bậc thang tuyệt đẹp và đỉnh Fansipan hùng vĩ.','from-green-600/20','2026-05-26 23:24:46','2026-05-26 23:24:46'),(4,'Đà Nẵng','Thành phố đáng sống','central','da-nang','https://images.unsplash.com/photo-1559508551-44bff1de756b?auto=format&fit=crop&q=80&w=800','Sự kết hợp hoàn hảo giữa biển xanh, cát trắng và núi non kỳ vĩ.','from-blue-600/20','2026-05-26 23:24:46','2026-05-26 23:24:46'),(5,'Hội An','Phố cổ yên bình','central','hoi-an','https://images.unsplash.com/photo-1555921015-c26206080b81?auto=format&fit=crop&q=80&w=800','Những nét kiến trúc cổ kính được bảo tồn qua hàng trăm năm.','from-yellow-600/20','2026-05-26 23:24:46','2026-05-26 23:24:46'),(6,'Đà Lạt','Thành phố ngàn hoa','central','da-lat','https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&q=80&w=800','Khí hậu ôn đới quanh năm, rừng thông và những hồ nước nên thơ.','from-pink-600/20','2026-05-26 23:24:46','2026-05-26 23:24:46'),(7,'Phú Quốc','Đảo Ngọc','south','phu-quoc','https://images.unsplash.com/photo-1586528116311-ad8ed7444ce2?auto=format&fit=crop&q=80&w=800','Thiên đường nghỉ dưỡng với những bãi biển đẹp nhất Việt Nam.','from-cyan-600/20','2026-05-26 23:24:46','2026-05-26 23:24:46');
/*!40000 ALTER TABLE `destinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotels`
--

DROP TABLE IF EXISTS `hotels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotels` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `price_per_night` decimal(10,2) NOT NULL,
  `star` tinyint unsigned NOT NULL,
  `available_rooms` int unsigned NOT NULL DEFAULT '0',
  `tour_id` bigint unsigned NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `sold_out_dates` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hotels_tour_id_foreign` (`tour_id`),
  CONSTRAINT `hotels_tour_id_foreign` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotels`
--

LOCK TABLES `hotels` WRITE;
/*!40000 ALTER TABLE `hotels` DISABLE KEYS */;
INSERT INTO `hotels` VALUES (1,'jj','hhh',NULL,NULL,NULL,NULL,NULL,'active',0.00,3,0,1,0,'[]','2026-05-26 23:48:02','2026-06-01 01:04:56'),(2,'ffff','ffff',NULL,NULL,NULL,NULL,NULL,'active',0.00,3,11,1,1,'[]','2026-05-29 02:54:36','2026-06-01 01:09:38');
/*!40000 ALTER TABLE `hotels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itineraries`
--

DROP TABLE IF EXISTS `itineraries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itineraries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `day_number` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `meals` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `itineraries_tour_id_foreign` (`tour_id`),
  CONSTRAINT `itineraries_tour_id_foreign` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itineraries`
--

LOCK TABLES `itineraries` WRITE;
/*!40000 ALTER TABLE `itineraries` DISABLE KEYS */;
INSERT INTO `itineraries` VALUES (13,4,1,'Đón khách & Tham quan','Xe đón quý khách tại điểm hẹn. Bắt đầu hành trình và tham quan các địa điểm đầu tiên.','Trưa, Tối','2026-05-26 23:28:00','2026-05-26 23:28:00'),(14,4,2,'Khám phá & Trải nghiệm','Khám phá các điểm đến nổi tiếng trong khu vực, thưởng thức đặc sản.','Sáng, Trưa, Tối','2026-05-26 23:28:00','2026-05-26 23:28:00'),(15,4,3,'Mua sắm & Tiễn khách','Tự do mua sắm đặc sản làm quà. Xe đưa quý khách về lại điểm đón ban đầu.','Sáng, Trưa','2026-05-26 23:28:00','2026-05-26 23:28:00'),(16,5,1,'Đón khách & Tham quan','Xe đón quý khách tại điểm hẹn. Bắt đầu hành trình và tham quan các địa điểm đầu tiên.','Trưa, Tối','2026-05-26 23:28:00','2026-05-26 23:28:00'),(17,5,2,'Khám phá & Trải nghiệm','Khám phá các điểm đến nổi tiếng trong khu vực, thưởng thức đặc sản.','Sáng, Trưa, Tối','2026-05-26 23:28:01','2026-05-26 23:28:01'),(18,5,3,'Mua sắm & Tiễn khách','Tự do mua sắm đặc sản làm quà. Xe đưa quý khách về lại điểm đón ban đầu.','Sáng, Trưa','2026-05-26 23:28:01','2026-05-26 23:28:01'),(28,2,1,'Đón khách & Tham quan','Xe đón quý khách tại điểm hẹn. Bắt đầu hành trình và tham quan các địa điểm đầu tiên.','Trưa, Tối','2026-05-29 02:51:41','2026-05-29 02:51:41'),(29,2,2,'Khám phá & Trải nghiệm','Khám phá các điểm đến nổi tiếng trong khu vực, thưởng thức đặc sản.','Sáng, Trưa, Tối','2026-05-29 02:51:41','2026-05-29 02:51:41'),(30,2,3,'Mua sắm & Tiễn khách','Tự do mua sắm đặc sản làm quà. Xe đưa quý khách về lại điểm đón ban đầu.','Sáng, Trưa','2026-05-29 02:51:42','2026-05-29 02:51:42'),(31,3,1,'Đón khách & Tham quan','Xe đón quý khách tại điểm hẹn. Bắt đầu hành trình và tham quan các địa điểm đầu tiên.','Trưa, Tối','2026-05-29 02:51:45','2026-05-29 02:51:45'),(32,3,2,'Khám phá & Trải nghiệm','Khám phá các điểm đến nổi tiếng trong khu vực, thưởng thức đặc sản.','Sáng, Trưa, Tối','2026-05-29 02:51:45','2026-05-29 02:51:45'),(33,3,3,'Mua sắm & Tiễn khách','Tự do mua sắm đặc sản làm quà. Xe đưa quý khách về lại điểm đón ban đầu.','Sáng, Trưa','2026-05-29 02:51:45','2026-05-29 02:51:45'),(37,1,1,'','','','2026-05-30 20:31:29','2026-05-30 20:31:29'),(38,1,2,'','','','2026-05-30 20:31:29','2026-05-30 20:31:29'),(39,1,3,'','','','2026-05-30 20:31:29','2026-05-30 20:31:29');
/*!40000 ALTER TABLE `itineraries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (1,'default','{\"uuid\":\"d69d3132-f005-402c-a811-e1ae20942878\",\"displayName\":\"App\\\\Mail\\\\VerifyRegistrationMail\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:31:\\\"App\\\\Mail\\\\VerifyRegistrationMail\\\":3:{s:3:\\\"otp\\\";s:6:\\\"490851\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:18:\\\"nnghiauu@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1779848610,\"delay\":null}',0,NULL,1779848610,1779848610),(2,'default','{\"uuid\":\"bc28a256-42e8-49ba-ad07-95bf3c9555a9\",\"displayName\":\"App\\\\Mail\\\\VerifyRegistrationMail\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:31:\\\"App\\\\Mail\\\\VerifyRegistrationMail\\\":3:{s:3:\\\"otp\\\";s:6:\\\"599359\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:18:\\\"nnghiauu@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1779848741,\"delay\":null}',0,NULL,1779848741,1779848741);
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_05_03_061055_create_travelviet_tables',1),(5,'2026_05_03_063844_create_personal_access_tokens_table',1),(6,'2026_05_06_052343_create_reviews_table',1),(7,'2026_05_06_060041_add_reply_to_reviews_table',1),(8,'2026_05_11_030702_add_payment_receipt_to_bookings_table',1),(9,'2026_05_11_033614_add_auth_fields_to_users_table',1),(10,'2026_05_12_091349_add_featured_to_tours_table',1),(11,'2026_05_12_095444_add_region_to_destinations_table',1),(12,'2026_05_16_034132_add_map_url_to_tours_table',1),(13,'2026_05_19_012425_create_site_settings_table',1),(14,'2026_05_19_013405_create_notifications_table',1),(15,'2026_05_19_020446_create_team_members_table',1),(16,'2026_05_19_020552_add_avatar_to_users_table',1),(17,'2026_05_19_033119_add_region_to_tours_table',1),(18,'2026_05_28_000001_create_hotels_table',1),(19,'2026_05_29_000000_add_hotel_id_to_bookings_table',1),(20,'2026_05_30_000000_add_extra_fields_to_hotels_table',1),(21,'2026_05_31_000000_add_is_default_to_hotels_table',1),(22,'2026_06_01_000000_add_sold_out_dates_to_hotels_table',1),(23,'2026_06_02_000000_fix_missing_columns',1),(24,'2026_05_16_023051_add_extra_fields_to_destinations_table',2),(25,'2026_05_25_110654_add_services_and_policies_to_tours_table',2),(26,'2026_05_27_032856_create_subscribers_table',3),(27,'2026_05_27_042815_create_customer_ranks_table',4),(28,'2026_05_27_042837_create_promotions_table',4),(29,'2026_05_27_042853_add_loyalty_fields_to_users_table',5),(30,'2026_05_27_051258_add_target_url_to_promotions_table',6),(31,'2026_05_29_092407_add_badge_to_promotions_table',7),(32,'2026_05_29_103010_add_admin_notes_to_bookings_table',8),(33,'2026_05_30_083436_add_bank_info_to_users_table',9),(34,'2026_05_31_034634_add_booking_id_to_reviews_table',10);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint unsigned NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('23a72391-028b-42b7-8a73-6e0d21cc2285','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',6,'{\"title\":\"Th\\u00f4ng b\\u00e1o b\\u1ea3o tr\\u00ec h\\u1ec7 th\\u1ed1ng\",\"message\":\"H\\u1ec7 th\\u1ed1ng s\\u1ebd t\\u1ea1m ng\\u01b0ng b\\u1ea3o tr\\u00ec t\\u1eeb 00:00 - 02:00 ng\\u00e0y mai \\u0111\\u1ec3 n\\u00e2ng c\\u1ea5p. Ch\\u00fang t\\u00f4i xin l\\u1ed7i v\\u00ec s\\u1ef1 b\\u1ea5t ti\\u1ec7n n\\u00e0y.\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}',NULL,'2026-05-31 23:00:38','2026-05-31 23:00:38'),('34ca1f8f-4af3-4ca2-b011-e51eaa262f7e','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',6,'{\"title\":\"\\u01afu \\u0111\\u00e3i \\u0111\\u1eb7c bi\\u1ec7t m\\u00f9a h\\u00e8!\",\"message\":\"TravelViet t\\u1eb7ng b\\u1ea1n m\\u00e3 gi\\u1ea3m gi\\u00e1 15% cho t\\u1ea5t c\\u1ea3 tour t\\u1eeb nay \\u0111\\u1ebfn cu\\u1ed1i th\\u00e1ng. \\u00c1p d\\u1ee5ng m\\u00e3: SUMMER15\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}',NULL,'2026-06-01 08:58:40','2026-06-01 08:58:40'),('55c1d336-54bd-4c66-8fcc-e930f3342be5','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',1,'{\"title\":\"er\",\"message\":\"vvvvnnnnnmmmmmmm\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}','2026-05-31 22:58:02','2026-05-31 21:50:22','2026-05-31 22:58:02'),('6bc4e8d0-cb4c-4a28-9961-2bd84ef384f2','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',6,'{\"title\":\"Ch\\u00e0o m\\u1eebng \\u0111\\u1ebfn v\\u1edbi TravelViet!\",\"message\":\"C\\u1ea3m \\u01a1n b\\u1ea1n \\u0111\\u00e3 tin t\\u01b0\\u1edfng l\\u1ef1a ch\\u1ecdn TravelViet. Kh\\u00e1m ph\\u00e1 ngay h\\u00e0ng tr\\u0103m tour h\\u1ea5p d\\u1eabn \\u0111ang ch\\u1edd \\u0111\\u00f3n b\\u1ea1n!\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}',NULL,'2026-05-31 23:00:45','2026-05-31 23:00:45'),('6f8d28af-2182-4e63-8593-b4389557029e','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',6,'{\"title\":\"sale 20%\",\"message\":\"haha\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}',NULL,'2026-05-31 22:57:35','2026-05-31 22:57:35'),('790eac27-1daa-4b4e-89fe-53d682b99ebd','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',1,'{\"title\":\"ttyuiuoio\",\"message\":\"34e5r6t7y89ui\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}','2026-05-31 21:49:22','2026-05-31 21:49:07','2026-05-31 21:49:22'),('809fde57-1036-48d8-aedd-d0dcc9379a86','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',1,'{\"title\":\"Th\\u00f4ng b\\u00e1o b\\u1ea3o tr\\u00ec h\\u1ec7 th\\u1ed1ng\",\"message\":\"H\\u1ec7 th\\u1ed1ng s\\u1ebd t\\u1ea1m ng\\u01b0ng b\\u1ea3o tr\\u00ec t\\u1eeb 00:00 - 02:00 ng\\u00e0y mai \\u0111\\u1ec3 n\\u00e2ng c\\u1ea5p. Ch\\u00fang t\\u00f4i xin l\\u1ed7i v\\u00ec s\\u1ef1 b\\u1ea5t ti\\u1ec7n n\\u00e0y.\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}','2026-05-31 23:03:08','2026-05-31 23:00:38','2026-05-31 23:03:08'),('95339432-8609-43fe-a6a4-734bb4eee827','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',6,'{\"title\":\"ttyuiuoio\",\"message\":\"34e5r6t7y89ui\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}',NULL,'2026-05-31 21:49:07','2026-05-31 21:49:07'),('ba8a1ce7-7ce8-458b-adc5-8358a76e7ad0','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',1,'{\"title\":\"sale 20%\",\"message\":\"haha\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}','2026-05-31 22:58:01','2026-05-31 22:57:35','2026-05-31 22:58:01'),('bbcec18e-59bc-4c42-affa-e30ef93b6bbd','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',1,'{\"title\":\"Ch\\u00e0o m\\u1eebng \\u0111\\u1ebfn v\\u1edbi TravelViet!\",\"message\":\"C\\u1ea3m \\u01a1n b\\u1ea1n \\u0111\\u00e3 tin t\\u01b0\\u1edfng l\\u1ef1a ch\\u1ecdn TravelViet. Kh\\u00e1m ph\\u00e1 ngay h\\u00e0ng tr\\u0103m tour h\\u1ea5p d\\u1eabn \\u0111ang ch\\u1edd \\u0111\\u00f3n b\\u1ea1n!\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}','2026-05-31 23:03:08','2026-05-31 23:00:45','2026-05-31 23:03:08'),('c3c99e95-3c3a-44d4-812a-1a6c1781eacb','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',1,'{\"title\":\"\\u01afu \\u0111\\u00e3i \\u0111\\u1eb7c bi\\u1ec7t m\\u00f9a h\\u00e8!\",\"message\":\"TravelViet t\\u1eb7ng b\\u1ea1n m\\u00e3 gi\\u1ea3m gi\\u00e1 15% cho t\\u1ea5t c\\u1ea3 tour t\\u1eeb nay \\u0111\\u1ebfn cu\\u1ed1i th\\u00e1ng. \\u00c1p d\\u1ee5ng m\\u00e3: SUMMER15\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}',NULL,'2026-06-01 08:58:40','2026-06-01 08:58:40'),('f878a644-55c7-47a3-a74d-3ea7ae22fde4','App\\Notifications\\AdminBroadcastNotification','App\\Models\\User',6,'{\"title\":\"er\",\"message\":\"vvvvnnnnnmmmmmmm\",\"broadcast_type\":\"all\",\"icon\":\"bell\"}',NULL,'2026-05-31 21:50:22','2026-05-31 21:50:22');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `transaction_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `bank_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_booking_id_foreign` (`booking_id`),
  CONSTRAINT `payments_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'auth_token','d53547b590b40aedb4f039565f2ae7abe911da7027da55c9a7fa3ed6e004e4a7','[\"*\"]','2026-05-24 23:35:31',NULL,'2026-05-24 23:28:48','2026-05-24 23:35:31'),(8,'App\\Models\\User',1,'auth_token','5b8e706e7aa4e4b907c2c41f19c235f3df5231c68b970483e0024ef3624eaf9b','[\"*\"]','2026-05-25 03:32:59',NULL,'2026-05-25 03:29:19','2026-05-25 03:32:59'),(9,'App\\Models\\User',5,'auth_token','07fdc181bf692f105fce13cca8f9c417dd99b2cab878640c5c61b8f592673a67','[\"*\"]','2026-05-26 20:07:06',NULL,'2026-05-26 20:06:46','2026-05-26 20:07:06'),(13,'App\\Models\\User',1,'auth_token','9f354098b2bdea551e67d5a6db996ed874960f3a61e2480596b91bb2c7723586','[\"*\"]','2026-05-26 21:50:11',NULL,'2026-05-26 21:32:16','2026-05-26 21:50:11'),(14,'App\\Models\\User',1,'auth_token','4d05b6cba8cc8b6cad6ab00a85dff471e86af54e35ab1846b42c1c4d149d271a','[\"*\"]','2026-05-26 22:07:24',NULL,'2026-05-26 21:52:42','2026-05-26 22:07:24'),(20,'App\\Models\\User',6,'auth_token','b419355892431c08dd264c8eed5e9ef5145e5089422b1bda7ed4554d2f6ebea2','[\"*\"]','2026-05-29 03:37:09',NULL,'2026-05-29 03:36:51','2026-05-29 03:37:09'),(24,'App\\Models\\User',1,'auth_token','34503ea84c151cca3f681b457838ab189eef113524105745b236e3a524b165f0','[\"*\"]','2026-05-30 19:48:49',NULL,'2026-05-30 00:43:30','2026-05-30 19:48:49'),(33,'App\\Models\\User',1,'auth_token','c227e38e53ccd13f042e7c5674d6cddcb4784af70551bc64dbeba39dbc2da3de','[\"*\"]',NULL,NULL,'2026-05-30 22:23:41','2026-05-30 22:23:41'),(34,'App\\Models\\User',1,'auth_token','92c8d3a9562652ee8ecabcd4d72234645cef7f21614af86b153f437206676b33','[\"*\"]',NULL,NULL,'2026-05-30 22:23:50','2026-05-30 22:23:50'),(35,'App\\Models\\User',1,'auth_token','25cb98eeefa1f5b60eec981ad7f69cc7be8fa759f693fde171e19fcee3cfdaaf','[\"*\"]',NULL,NULL,'2026-05-30 22:23:59','2026-05-30 22:23:59'),(36,'App\\Models\\User',1,'auth_token','415656aaff5c045f6ee5627e20db0a63a173bb2a59213dd7f4f9921d7e7eb1a1','[\"*\"]',NULL,NULL,'2026-05-30 22:24:08','2026-05-30 22:24:08'),(37,'App\\Models\\User',1,'auth_token','7282d783d034351f32653230f8c2c9c09a547a5cf84665f862f3328c7dfd381f','[\"*\"]',NULL,NULL,'2026-05-30 22:24:16','2026-05-30 22:24:16'),(38,'App\\Models\\User',1,'auth_token','340513ac84f72acc1d72bbd84700a395301f3cfc737bf4778d44a11e32dfc619','[\"*\"]',NULL,NULL,'2026-05-30 22:24:25','2026-05-30 22:24:25'),(39,'App\\Models\\User',1,'auth_token','9e1be99689d7ae7a0e60a11206105d549fd0ced4f8b1cdedc39d1c85c5694b33','[\"*\"]',NULL,NULL,'2026-05-30 22:24:34','2026-05-30 22:24:34'),(40,'App\\Models\\User',1,'auth_token','848ca6e6f1f1b9e08a32023439e6c4b9abb266cc6072d2ed2f1a6ae371e40d04','[\"*\"]','2026-05-31 23:03:16',NULL,'2026-05-30 22:28:02','2026-05-31 23:03:16'),(46,'App\\Models\\User',1,'auth_token','34c31d11d61e0bb909a9872bade4eace0ee8b4e0830ae859f67807b318612173','[\"*\"]','2026-06-01 20:38:00',NULL,'2026-06-01 01:49:12','2026-06-01 20:38:00');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_type` enum('percent','fixed_amount','gift') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percent',
  `discount_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `required_rank_id` bigint unsigned DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `target_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `badge` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `promotions_required_rank_id_foreign` (`required_rank_id`),
  CONSTRAINT `promotions_required_rank_id_foreign` FOREIGN KEY (`required_rank_id`) REFERENCES `customer_ranks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'Chào Hè Rực Rỡ 2026','Giảm giá 10% cho các chuyến du lịch giải nhiệt mùa hè. Cùng gia đình tận hưởng kỳ nghỉ tuyệt vời.','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800','percent',10.00,NULL,1,'/tours?category=bien-dao','2026-05-01 00:00:00','2026-08-31 00:00:00','active','Hot','2026-05-26 23:25:33','2026-05-29 02:33:34'),(2,'Tri Ân Khách Hàng Thân Thiết','Giảm 500.000đ dành cho khách hàng đã từng đặt tour tại TravelViet.','https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800','fixed_amount',500000.00,NULL,0,'/tours','2026-01-01 00:00:00','2026-12-31 23:59:59','active',NULL,'2026-05-26 23:25:33','2026-05-26 23:29:36');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `tour_id` bigint unsigned NOT NULL,
  `rating` int NOT NULL DEFAULT '5',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_approved` tinyint(1) NOT NULL DEFAULT '1',
  `admin_reply` text COLLATE utf8mb4_unicode_ci,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `booking_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_user_id_foreign` (`user_id`),
  KEY `reviews_tour_id_foreign` (`tour_id`),
  KEY `reviews_booking_id_foreign` (`booking_id`),
  CONSTRAINT `reviews_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_tour_id_foreign` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,1,5,'uy tín , nhân viên nhiệt tình',1,NULL,NULL,'2026-05-30 20:05:20','2026-05-30 20:06:33',NULL);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('QiHtcuBnMqLGesf87N5zBkr7VlpC1ri7N3tMCFxd',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUXF1bnY2b3FtNHc4RW5DSndsZENjN054OE0xZmVHMjJjanhGTDdxRSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779692229);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'company_name','Công ty Du lịch TravelViet','2026-05-25 02:32:36','2026-05-25 02:32:36'),(2,'company_phone','123456789','2026-05-25 02:32:37','2026-05-25 22:24:59'),(3,'company_email','nghia080404@gmail.com','2026-05-25 02:32:37','2026-05-26 19:19:54'),(4,'company_address','123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh','2026-05-25 02:32:37','2026-05-25 02:32:37'),(5,'company_map',NULL,'2026-05-25 02:32:37','2026-05-25 02:32:37'),(6,'social_facebook','https://www.facebook.com/nv.nghia.547569?locale=vi_VN','2026-05-25 02:32:37','2026-05-25 02:32:37'),(7,'social_youtube','https://youtube.com/travelviet','2026-05-25 02:32:37','2026-05-25 02:32:37'),(8,'social_tiktok',NULL,'2026-05-25 02:32:37','2026-05-25 02:32:37'),(9,'social_zalo','0356589637','2026-05-25 02:32:37','2026-05-25 21:18:01'),(10,'payment_vnpay_enabled','false','2026-05-25 02:32:37','2026-05-29 03:24:53'),(11,'payment_viettel_enabled','true','2026-05-25 02:32:37','2026-05-25 02:32:37'),(12,'payment_momo_enabled','false','2026-05-25 02:32:37','2026-05-25 02:32:37'),(13,'payment_cash_enabled','true','2026-05-25 02:32:37','2026-05-25 02:32:37'),(14,'page_terms','<p>Đfffff...</p>','2026-05-25 02:32:37','2026-05-30 00:20:46'),(15,'page_privacy','<p>Đfffffft...</p>','2026-05-25 02:32:38','2026-05-30 00:20:46'),(16,'page_about','<p>Đanffffy...</p>','2026-05-25 02:32:38','2026-05-30 00:20:46'),(17,'page_faq','<p>Đang cập nhật câu hỏi thường gặp...</p>','2026-05-25 02:32:38','2026-05-25 02:32:38'),(18,'stat_experience_years','10+','2026-05-25 02:32:38','2026-05-25 02:32:38'),(19,'stat_happy_customers','15.000+','2026-05-25 02:32:38','2026-05-25 02:32:38'),(20,'stat_destinations','4+','2026-05-25 02:32:38','2026-05-25 02:32:38'),(21,'stat_rating','5/5','2026-05-25 02:32:38','2026-05-25 02:32:38'),(22,'social_facebook_enabled','true','2026-05-25 02:37:46','2026-05-25 02:38:00'),(23,'social_youtube_enabled','false','2026-05-25 02:37:46','2026-05-25 22:24:41'),(24,'social_tiktok_enabled','false','2026-05-25 02:37:46','2026-05-25 02:37:46'),(25,'social_zalo_enabled','true','2026-05-25 02:37:46','2026-05-25 21:18:01');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscribers`
--

DROP TABLE IF EXISTS `subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscribers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscribers_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscribers`
--

LOCK TABLES `subscribers` WRITE;
/*!40000 ALTER TABLE `subscribers` DISABLE KEYS */;
INSERT INTO `subscribers` VALUES (1,'nghia989.y@gmail.com',1,'2026-06-01 08:57:03','2026-06-01 08:57:03');
/*!40000 ALTER TABLE `subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (1,'Nguyễn Văn Nghĩa','Founder & CEO','/storage/team/VlkUxqVo0qcPUnBO4TzxHYENr6zkC9qTDSxkfWcg.jpg','???',1,1,'2026-05-30 20:51:08','2026-05-30 20:53:54');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour_images`
--

DROP TABLE IF EXISTS `tour_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tour_images_tour_id_foreign` (`tour_id`),
  CONSTRAINT `tour_images_tour_id_foreign` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_images`
--

LOCK TABLES `tour_images` WRITE;
/*!40000 ALTER TABLE `tour_images` DISABLE KEYS */;
INSERT INTO `tour_images` VALUES (1,1,'/storage/tours/1780126939_iXC5M0.jpeg','2026-05-30 00:42:20','2026-05-30 00:42:20'),(2,1,'/storage/tours/1780126940_1QZO9z.jpeg','2026-05-30 00:42:20','2026-05-30 00:42:20'),(3,1,'/storage/tours/1780126940_bAlExM.jpeg','2026-05-30 00:42:20','2026-05-30 00:42:20');
/*!40000 ALTER TABLE `tour_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tours`
--

DROP TABLE IF EXISTS `tours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tours` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_id` bigint unsigned NOT NULL,
  `region` enum('Miền Bắc','Miền Trung','Miền Nam') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `duration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_days` int NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `old_price` decimal(15,2) DEFAULT NULL,
  `max_slots` int NOT NULL DEFAULT '15',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `map_url` text COLLATE utf8mb4_unicode_ci,
  `highlights` json DEFAULT NULL,
  `essentials` json DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `rating` decimal(3,1) NOT NULL DEFAULT '0.0',
  `reviews_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `included_services` json DEFAULT NULL,
  `excluded_services` json DEFAULT NULL,
  `cancellation_policy` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tours_slug_unique` (`slug`),
  KEY `tours_destination_id_foreign` (`destination_id`),
  KEY `tours_category_id_foreign` (`category_id`),
  CONSTRAINT `tours_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tours_destination_id_foreign` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tours`
--

LOCK TABLES `tours` WRITE;
/*!40000 ALTER TABLE `tours` DISABLE KEYS */;
INSERT INTO `tours` VALUES (1,'Khám phá Vịnh Hạ Long trên Du thuyền 5 sao','kham-pha-vinh-ha-long-tren-du-thuyen-5-sao',2,NULL,6,'2 Ngày 1 Đêm',2,2500000.00,3200000.00,20,'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800','HOT','Trải nghiệm đẳng cấp trên du thuyền 5 sao, tham quan các hang động tuyệt đẹp, chèo kayak trên vịnh và thưởng thức hải sản tươi ngon.','https://www.google.com/maps/place/Ph%C6%B0%E1%BB%9Dng%20H%C3%A0%20Tu%2C%20T%E1%BB%89nh%20Qu%E1%BA%A3ng%20Ninh%2C%2001040/@20.949590780937942,107.17029448904334,16z','[\"Ngủ đêm trên du thuyền sang trọng\", \"Chèo Kayak khám phá hang luồn\", \"Tham quan Hang Sửng Sốt\"]','[\"CCCD/CMND\", \"Kem chống nắng\", \"Giày thể thao\", \"Mũ/Nón\"]','active',0,5.0,2,'2026-05-26 23:24:46','2026-05-30 20:37:28','[\"Xe đưa đón cao cấp\", \"Khách sạn 3-5 sao\", \"Ăn uống theo chương trình\", \"Hướng dẫn viên nhiệt tình\"]','[\"Chi phí mua sắm cá nhân\", \"Tiền tip cho HDV (không bắt buộc)\", \"Vé tham quan ngoài chương trình\"]','[\"Hủy trước 7 ngày: Hoàn 100%\", \"Hủy 3-6 ngày: Hoàn 50%\", \"Hủy dưới 3 ngày: Không hoàn tiền\"]'),(2,'Sapa Mù Sương - Chinh phục đỉnh Fansipan','sapa-mu-suong-chinh-phuc-dinh-fansipan',3,NULL,2,'3 Ngày 2 Đêm',3,2800000.00,3000000.00,25,'https://images.unsplash.com/photo-1543333995-a78aea2fee50?auto=format&fit=crop&q=80&w=800',NULL,'Hành trình đến với thị trấn trong sương, chinh phục đỉnh Fansipan - nóc nhà Đông Dương và giao lưu văn hóa với các dân tộc bản địa.',NULL,'[\"Vé cáp treo Fansipan\", \"Tham quan Bản Cát Cát\", \"Thưởng thức đặc sản Tây Bắc\"]','[\"CCCD/CMND\", \"Kem chống nắng\", \"Giày thể thao\", \"Mũ/Nón\"]','active',0,0.0,0,'2026-05-26 23:24:46','2026-05-30 20:21:47','[\"Xe đưa đón cao cấp\", \"Khách sạn 3-5 sao\", \"Ăn uống theo chương trình\", \"Hướng dẫn viên nhiệt tình\"]','[\"Chi phí mua sắm cá nhân\", \"Tiền tip cho HDV (không bắt buộc)\", \"Vé tham quan ngoài chương trình\"]','[\"Hủy trước 7 ngày: Hoàn 100%\", \"Hủy 3-6 ngày: Hoàn 50%\", \"Hủy dưới 3 ngày: Không hoàn tiền\"]'),(3,'Hành trình Di sản: Đà Nẵng - Hội An - Bà Nà Hills','hanh-trinh-di-san-da-nang-hoi-an-ba-na-hills',4,NULL,5,'4 Ngày 3 Đêm',4,4500000.00,5200000.00,30,'https://images.unsplash.com/photo-1559508551-44bff1de756b?auto=format&fit=crop&q=80&w=800',NULL,'Khám phá dải đất miền Trung với các di sản văn hóa thế giới, trải nghiệm cáp treo Bà Nà Hills và vẻ đẹp lung linh của Phố cổ Hội An.',NULL,'[\"Vui chơi tại Sun World Bà Nà Hills\", \"Khám phá Phố cổ Hội An về đêm\", \"Tắm biển Mỹ Khê\"]','[\"CCCD/CMND\", \"Kem chống nắng\", \"Giày thể thao\", \"Mũ/Nón\"]','active',0,0.0,0,'2026-05-26 23:24:46','2026-05-30 20:21:47','[\"Xe đưa đón cao cấp\", \"Khách sạn 3-5 sao\", \"Ăn uống theo chương trình\", \"Hướng dẫn viên nhiệt tình\"]','[\"Chi phí mua sắm cá nhân\", \"Tiền tip cho HDV (không bắt buộc)\", \"Vé tham quan ngoài chương trình\"]','[\"Hủy trước 7 ngày: Hoàn 100%\", \"Hủy 3-6 ngày: Hoàn 50%\", \"Hủy dưới 3 ngày: Không hoàn tiền\"]'),(4,'Thiên đường Đảo Ngọc Phú Quốc','thien-duong-dao-ngoc-phu-quoc',7,NULL,4,'3 Ngày 2 Đêm',3,3500000.00,4000000.00,20,'https://images.unsplash.com/photo-1586528116311-ad8ed7444ce2?auto=format&fit=crop&q=80&w=800',NULL,'Tận hưởng kỳ nghỉ dưỡng tuyệt vời tại Phú Quốc với biển xanh, cát trắng, nắng vàng và tham gia tour 4 đảo hấp dẫn.',NULL,'[\"Tour lặn ngắm san hô 4 đảo\", \"Tham quan VinWonders Phú Quốc\", \"Ngắm hoàng hôn Bãi Trường\"]','[\"CCCD/CMND\", \"Kem chống nắng\", \"Giày thể thao\", \"Mũ/Nón\"]','active',1,0.0,0,'2026-05-26 23:24:46','2026-05-30 20:21:47','[\"Xe đưa đón cao cấp\", \"Khách sạn 3-5 sao\", \"Ăn uống theo chương trình\", \"Hướng dẫn viên nhiệt tình\"]','[\"Chi phí mua sắm cá nhân\", \"Tiền tip cho HDV (không bắt buộc)\", \"Vé tham quan ngoài chương trình\"]','[\"Hủy trước 7 ngày: Hoàn 100%\", \"Hủy 3-6 ngày: Hoàn 50%\", \"Hủy dưới 3 ngày: Không hoàn tiền\"]'),(5,'Đà Lạt Mộng Mơ - Thành phố ngàn hoa','da-lat-mong-mo-thanh-pho-ngan-hoa',6,NULL,3,'3 Ngày 2 Đêm',3,2200000.00,2500000.00,15,'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&q=80&w=800',NULL,'Thư giãn trong không khí se lạnh của Đà Lạt, dạo quanh Hồ Xuân Hương và ngắm nhìn những đồi thông, vườn hoa tuyệt đẹp.',NULL,'[\"Tham quan Thung lũng Tình Yêu\", \"Check-in Quảng trường Lâm Viên\", \"Thưởng thức cafe view đồi núi\"]','[\"CCCD/CMND\", \"Kem chống nắng\", \"Giày thể thao\", \"Mũ/Nón\"]','active',0,0.0,0,'2026-05-26 23:24:46','2026-05-30 20:21:47','[\"Xe đưa đón cao cấp\", \"Khách sạn 3-5 sao\", \"Ăn uống theo chương trình\", \"Hướng dẫn viên nhiệt tình\"]','[\"Chi phí mua sắm cá nhân\", \"Tiền tip cho HDV (không bắt buộc)\", \"Vé tham quan ngoài chương trình\"]','[\"Hủy trước 7 ngày: Hoàn 100%\", \"Hủy 3-6 ngày: Hoàn 50%\", \"Hủy dưới 3 ngày: Không hoàn tiền\"]');
/*!40000 ALTER TABLE `tours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_spent` decimal(15,2) NOT NULL DEFAULT '0.00',
  `rank_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `otp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`),
  KEY `users_rank_id_foreign` (`rank_id`),
  CONSTRAINT `users_rank_id_foreign` FOREIGN KEY (`rank_id`) REFERENCES `customer_ranks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin TravelViet','admin@travelviet.vn',NULL,NULL,'2026-05-24 23:28:23','$2y$12$EhsMLA9xT9B5Glz.Dk5/x.q3JRCHpc/uFdEwdB/s3EKTgYv3Dvqxq','admin',NULL,10000000.00,NULL,'2026-05-24 23:14:20','2026-05-30 19:49:41',NULL,NULL,NULL,'/storage/avatars/yT92sh8DwSsFE1mR6vYJPp4lzjoxTS0nlL6MFVuP.jpg','Nghia','123456789','NGUYEN VAN NGHIA');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `tour_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wishlists_user_id_foreign` (`user_id`),
  KEY `wishlists_tour_id_foreign` (`tour_id`),
  CONSTRAINT `wishlists_tour_id_foreign` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-02 10:39:15
