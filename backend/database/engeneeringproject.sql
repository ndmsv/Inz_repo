-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: engeneegingproject
-- ------------------------------------------------------
-- Server version	8.0.33

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
-- Table structure for table `course_tasks`
--

DROP TABLE IF EXISTS `course_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_tasks` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `COURSE_ID` int NOT NULL,
  `TASK_NAME` varchar(255) NOT NULL,
  `TASK_DESCRIPTION` varchar(1500) DEFAULT NULL,
  `CREATION_DATE` timestamp NOT NULL,
  `OPENING_DATE` timestamp NOT NULL,
  `CLOSING_DATE` timestamp NOT NULL,
  `LIMITED_ATTACHMENTS` bit(1) NOT NULL,
  `ATTACHMENTS_NUMBER` int DEFAULT NULL,
  `LIMITED_ATTACHMENT_TYPES` bit(1) NOT NULL,
  `ATTACHMENT_TYPES` varchar(500) DEFAULT NULL,
  `IS_DELETED` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_tasks`
--

LOCK TABLES `course_tasks` WRITE;
/*!40000 ALTER TABLE `course_tasks` DISABLE KEYS */;
INSERT INTO `course_tasks` VALUES (1,1,'first task','test task','2024-06-16 16:53:54','2024-06-17 14:42:19','2024-06-23 17:45:19',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(2,1,'another task','','2024-06-16 16:59:44','2024-06-16 14:55:10','2024-06-27 14:55:09',_binary '',5,_binary '','.txt;.jpg;.png;.pdf;.exe',_binary '\0'),(3,1,'test','','2024-06-16 17:12:20','2024-06-16 14:55:10','2024-06-27 14:56:09',_binary '\0',NULL,_binary '\0',NULL,_binary ''),(4,1,'test2','','2024-06-16 17:18:04','2024-06-16 15:14:32','2024-06-17 15:14:32',_binary '\0',NULL,_binary '\0',NULL,_binary ''),(5,1,'test3','','2024-06-16 15:24:53','2024-06-16 15:14:32','2024-06-18 15:14:32',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(6,1,'test4','','2024-06-18 16:26:22','2024-06-17 16:22:34','2024-06-18 16:22:34',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(7,1,'test','abc','2024-06-18 17:03:32','2024-06-15 17:00:54','2024-06-23 17:00:54',_binary '',5,_binary '\0',NULL,_binary '\0'),(8,1,'a','','2024-06-18 17:19:16','2024-06-17 17:18:49','2024-06-18 17:18:50',_binary '\0',NULL,_binary '\0',NULL,_binary ''),(9,1,'abc','','2024-06-18 17:22:22','2024-06-17 17:21:00','2024-06-18 17:21:00',_binary '\0',NULL,_binary '\0',NULL,_binary ''),(10,1,'litwa','Litwo, Ojczyzno moja! ty jesteś jak zdrowie; Ile cię trzeba cenić, ten tylko się dowie, Kto cię stracił. Dziś piękność twą w całej ozdobie Widzę i opisuję, bo tęsknię po tobie. Panno święta, co Jasnej bronisz Częstochowy I w Ostrej świecisz Bramie! Ty, co gród zamkowy Nowogródzki ochraniasz z jego wiernym ludem! Jak mnie dziecko do zdrowia powróciłaś cudem (— Gdy od płaczącej matki, pod Twoją opiekę Ofiarowany martwą podniosłem powiekę; I zaraz mogłem pieszo, do Twych świątyń progu Iść za wrócone życie podziękować Bogu —) Tak nas powrócisz cudem na Ojczyzny łono!... Tymczasem, przenoś moją duszę utęsknioną Do tych pagórków leśnych, do tych łąk zielonych, Szeroko nad błękitnym Niemnem rozciągnionych; Do tych pól malowanych zbożem rozmaitem, Wyzłacanych pszenicą, posrebrzanych żytem; Gdzie bursztynowy świerzop, gryka jak śnieg biała, Gdzie panieńskim rumieńcem dzięcielina pała, A wszystko przepasane jakby wstęgą, miedzą Zieloną, na niej zrzadka ciche grusze siedzą.','2024-06-18 17:32:36','2024-06-25 17:31:00','2024-06-27 17:31:00',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(11,10,'test','sprawdzam czy tu też działa gites','2024-06-18 17:37:03','2024-06-18 17:36:00','2024-06-18 17:37:00',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(12,1,'aaa','a','2024-06-19 17:35:23','2024-06-19 17:34:00','2024-06-26 17:34:00',_binary '\0',NULL,_binary '','.png;.txt',_binary ''),(13,1,'abc','','2024-06-24 15:50:47','2024-06-24 15:50:00','2024-07-03 15:50:00',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(14,1,'kotki płotki','testy','2024-06-24 15:51:13','2024-07-04 15:50:00','2024-07-06 15:50:00',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(15,1,'next','tutaj miejsce na opis','2024-06-24 15:51:58','2024-07-03 15:51:00','2024-07-03 19:51:00',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(16,1,'coś','','2024-06-24 15:52:22','2024-06-25 15:52:00','2024-06-28 15:52:00',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(17,1,'jeszcze jeden','','2024-06-24 15:52:37','2024-06-25 15:52:00','2024-06-26 15:52:00',_binary '\0',NULL,_binary '\0',NULL,_binary '\0'),(18,11,'esej','napisz rozprawkę o tym że kotki są najcudowniejsze \npraca powinna zawierać argument z 3 części dziadów, min 200 słów ','2024-06-24 18:06:24','2024-06-24 18:03:00','2024-07-23 17:37:00',_binary '\0',NULL,_binary '','.py;.sys;.mp3;.docx',_binary '\0');
/*!40000 ALTER TABLE `course_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `COURSE_NAME` varchar(255) NOT NULL,
  `COURSE_DESC` varchar(1500) DEFAULT NULL,
  `COURSE_OWNER_ID` int NOT NULL,
  `COURSE_PASSWORD` varchar(255) DEFAULT NULL,
  `IS_DELETED` bit(1) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'test course','test course',1,NULL,_binary '\0'),(2,'nowy kurs','testowy kurs',4,NULL,_binary ''),(3,'nowy kurs 2','kolejny testowy kurs',4,'$2a$11$cvLu51dw8a3pfaDkU5R/Bue1Hsme1Sa4VfXH2rSWJzzTWyroWhdpK',_binary '\0'),(9,'nowy kurs 3','test czy dobrze już działa',4,NULL,_binary ''),(10,'abc','Litwo, Ojczyzno moja! ty jesteś jak zdrowie;\nIle cię trzeba cenić, ten tylko się dowie,\nKto cię stracił. Dziś piękność twą w całej ozdobie\nWidzę i opisuję, bo tęsknię po tobie.\n\nPanno święta, co Jasnej bronisz Częstochowy\nI w Ostrej świecisz Bramie! Ty, co gród zamkowy\nNowogródzki ochraniasz z jego wiernym ludem!\nJak mnie dziecko do zdrowia powróciłaś cudem\n(— Gdy od płaczącej matki, pod Twoją opiekę\nOfiarowany martwą podniosłem powiekę;\nI zaraz mogłem pieszo, do Twych świątyń progu\nIść za wrócone życie podziękować Bogu —)\nTak nas powrócisz cudem na Ojczyzny łono!...\nTymczasem, przenoś moją duszę utęsknioną\nDo tych pagórków leśnych, do tych łąk zielonych,\nSzeroko nad błękitnym Niemnem rozciągnionych;\nDo tych pól malowanych zbożem rozmaitem,\nWyzłacanych pszenicą, posrebrzanych żytem;\nGdzie bursztynowy świerzop, gryka jak śnieg biała,\nGdzie panieńskim rumieńcem dzięcielina pała,\nA wszystko przepasane jakby wstęgą, miedzą\nZieloną, na niej zrzadka ciche grusze siedzą.',4,NULL,_binary '\0'),(11,'reologia kotków','',6,'$2a$11$Kybj/PQ6RU.IAyJmdLZIMOhVGxgsKXC3JxkZ3/6.K3sd9ysGnQLhy',_binary '\0'),(12,'test','test',4,'$2a$11$HudXLVsecuHjZ9HF7BvtEew42SKKtuxzhahUec8duKfeu1EfMWcqW',_binary '\0');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_posts`
--

DROP TABLE IF EXISTS `forum_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_posts` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `POST_TITLE` varchar(400) NOT NULL,
  `POST_DESCRIPTION` varchar(1500) DEFAULT NULL,
  `CREATED_ON` datetime NOT NULL,
  `USER_ID` int NOT NULL,
  `IS_DELETED` bit(1) NOT NULL DEFAULT b'0',
  `VOTES_COUNT` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_posts`
--

LOCK TABLES `forum_posts` WRITE;
/*!40000 ALTER TABLE `forum_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submission_attachments`
--

DROP TABLE IF EXISTS `submission_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submission_attachments` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `SUBMISSION_ID` int NOT NULL,
  `ADDED_ON` datetime DEFAULT NULL,
  `FILE_NAME` varchar(200) NOT NULL,
  `FILE_PATH` varchar(200) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submission_attachments`
--

LOCK TABLES `submission_attachments` WRITE;
/*!40000 ALTER TABLE `submission_attachments` DISABLE KEYS */;
INSERT INTO `submission_attachments` VALUES (13,5,'2024-06-24 08:43:19','logoMS.png','D:\\Projekt_inz\\encrypted_files\\962e68ac-6612-474c-9a79-9379b6f35367.png'),(14,5,'2024-06-24 08:43:19','Materiały BV - skanowanie surowców, materiałów.docx','D:\\Projekt_inz\\encrypted_files\\0454f85c-35b7-44ed-882c-4d3759449404.docx'),(15,5,'2024-06-24 08:43:19','unknown.png','D:\\Projekt_inz\\encrypted_files\\0f064bc5-a9e0-4ac6-8de1-8da6c84400dd.png'),(16,5,'2024-06-24 08:43:19','vlc-3.0.21-win64.exe','D:\\Projekt_inz\\encrypted_files\\05236f2d-039b-4555-aa24-416489d85087.exe'),(20,6,'2024-06-24 08:56:19','urocze sarenki (1).docx','D:\\Projekt_inz\\encrypted_files\\4adcd3f8-c4a3-487c-ade8-39106d0f1273.docx'),(21,7,'2024-06-24 09:00:28','Kod źródłowy.zip','D:\\Projekt_inz\\encrypted_files\\45c313bb-5eb1-4376-b216-8484a6e95af9.zip'),(23,9,'2024-06-24 11:10:56','Informatyka_2023_praktyki_zwolnienie_nowy (1).docx','D:\\Projekt_inz\\encrypted_files\\2cc2a13d-0be1-444d-b50b-84b83e6a83eb.docx'),(24,9,'2024-06-24 11:10:56','Jakub Głuszek Lab 5.ipynb','D:\\Projekt_inz\\encrypted_files\\c8ae8ff6-2f90-43a4-8ea1-f587f9721536.ipynb'),(25,9,'2024-06-24 11:10:56','MachineStd-Medium.otf','D:\\Projekt_inz\\encrypted_files\\e080bba5-e895-4efb-b3c4-0d38825176d8.otf'),(26,10,'2024-06-24 12:32:44','unknown.png','D:\\Projekt_inz\\encrypted_files\\abb86c72-790f-48f1-8c0d-a975bfad26f3.png'),(27,10,'2024-06-24 12:32:44','logoMS.png','D:\\Projekt_inz\\encrypted_files\\7862b949-7c00-4dac-8750-cb14ef032c73.png'),(29,11,'2024-06-24 19:30:20','Kwa kwa kwa kwa miauuu miauuu miauuu.docx','D:\\Projekt_inz\\encrypted_files\\268f1a88-6870-4c42-a200-b4fcec7272dd.docx'),(31,12,'2024-06-24 20:12:45','reologia.docx','D:\\Projekt_inz\\encrypted_files\\a3347bd3-6f1c-4a0e-8968-ddc79dbeac2a.docx'),(32,12,'2024-06-24 20:12:45','Time.py','D:\\Projekt_inz\\encrypted_files\\0f48c6eb-f13d-47d4-9ffb-1c734d1dcfc6.py'),(33,8,'2024-06-25 06:54:44','logoMS.png','D:\\Projekt_inz\\encrypted_files\\ffc3843e-bbf5-4aef-b7d3-5acfe08e6a15.png'),(34,8,'2024-06-25 06:54:44','Projekt-Android-Jakub-Głuszek-Filip-Gołyszny-Filip-Gawlas.pdf','D:\\Projekt_inz\\encrypted_files\\08b9c2dd-2edd-4b12-b633-75eb98774dac.pdf'),(35,13,'2024-06-25 06:58:12','Projekt-Android-Jakub-Głuszek-Filip-Gołyszny-Filip-Gawlas.pdf','D:\\Projekt_inz\\encrypted_files\\ab3d114e-6b4c-4ff7-9caa-f0f53d05d056.pdf');
/*!40000 ALTER TABLE `submission_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_submissions`
--

DROP TABLE IF EXISTS `task_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_submissions` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TASK_ID` int NOT NULL,
  `USER_ID` int NOT NULL,
  `ADDED_ON` datetime DEFAULT NULL,
  `SUBMISSION_NOTE` varchar(1000) DEFAULT NULL,
  `IS_DELETED` bit(1) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_submissions`
--

LOCK TABLES `task_submissions` WRITE;
/*!40000 ALTER TABLE `task_submissions` DISABLE KEYS */;
INSERT INTO `task_submissions` VALUES (5,1,4,'2024-06-24 08:43:19','aaa',_binary '\0'),(6,7,4,'2024-06-24 08:56:19',NULL,_binary '\0'),(7,1,1,'2024-06-24 09:00:28',NULL,_binary '\0'),(8,2,4,'2024-06-25 06:54:44','notatka',_binary '\0'),(9,1,3,'2024-06-24 11:10:56','wrzucamy dane ',_binary '\0'),(10,10,2,'2024-06-24 12:32:44',NULL,_binary '\0'),(11,11,5,'2024-06-24 19:30:20',NULL,_binary '\0'),(12,18,5,'2024-06-24 20:12:45',NULL,_binary '\0'),(13,7,3,'2024-06-25 06:58:12','avc',_binary '\0'),(14,2,3,'2024-10-09 17:05:49','tads',_binary '\0');
/*!40000 ALTER TABLE `task_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_types`
--

DROP TABLE IF EXISTS `user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_types` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TYPE_ID` int NOT NULL,
  `TYPE_NAME` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `TYPE_PASSWORD` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_types`
--

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;
INSERT INTO `user_types` VALUES (1,0,'Administrator','$2a$11$Mmo5iUU2mlrAbmI0h6ihn.Bv04aNGIsLfF8mRzie0/7oraOq40pwq'),(2,1,'Student',NULL),(3,2,'Teacher','$2a$11$Mmo5iUU2mlrAbmI0h6ihn.Bv04aNGIsLfF8mRzie0/7oraOq40pwq');
/*!40000 ALTER TABLE `user_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `USER_LOGIN` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `USER_PASSWORD` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `USER_TYPE` int NOT NULL,
  `NAME` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `SURNAME` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test','$2a$11$Mmo5iUU2mlrAbmI0h6ihn.Bv04aNGIsLfF8mRzie0/7oraOq40pwq',0,NULL,NULL),(2,'abc','$2a$11$0cnobCiB2xKBm2f88wCT3uQXVAjecZQ96.Go1qPvXQIHySbXNmr1.',2,NULL,NULL),(3,'abcd','$2a$11$nQCcdk1nXWcGmfAuh/WNkOHUtrHt1MASI8Bb34OVmApI5l1Z5Yuhe',1,'Marcin','Ryt'),(4,'ndmsv','$2a$11$EWX4fmi5oBCeZHm8spawsukKp.1Viu3Zu1zGva2gjXZqJYIVIz/Ae',0,'Jakub','Głuszek'),(5,'kwaczy_tester','$2a$11$/z8FJBERDJYwlU6v4VN80OCohnwu0TaWMOjm//IPd2hqkGcTVUwBi',1,'Dzielne','Kwaczątko'),(6,'nauczyciel miaukania','$2a$11$J4U.9BrSfRxZ3NLplkX.vuNS8CcASyonvsBuHfqlGIiCOnfI8UEum',2,'kotki','płotki');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_in_course`
--

DROP TABLE IF EXISTS `users_in_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_in_course` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `USER_ID` int NOT NULL,
  `COURSE_ID` int NOT NULL,
  `IS_OWNER` bit(1) NOT NULL,
  `IS_DELETED` bit(1) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_in_course`
--

LOCK TABLES `users_in_course` WRITE;
/*!40000 ALTER TABLE `users_in_course` DISABLE KEYS */;
INSERT INTO `users_in_course` VALUES (1,1,1,_binary '',_binary '\0'),(2,4,2,_binary '',_binary '\0'),(3,4,3,_binary '',_binary '\0'),(4,4,9,_binary '',_binary '\0'),(5,4,10,_binary '',_binary '\0'),(6,1,2,_binary '\0',_binary '\0'),(7,1,9,_binary '',_binary '\0'),(8,2,1,_binary '',_binary '\0'),(9,1,3,_binary '\0',_binary '\0'),(10,1,10,_binary '\0',_binary '\0'),(11,3,1,_binary '\0',_binary '\0'),(12,3,3,_binary '\0',_binary '\0'),(13,4,1,_binary '\0',_binary '\0'),(14,5,10,_binary '\0',_binary '\0'),(15,6,11,_binary '',_binary '\0'),(16,5,11,_binary '\0',_binary '\0'),(17,4,11,_binary '\0',_binary '\0'),(18,4,12,_binary '',_binary '\0'),(19,2,12,_binary '\0',_binary '\0'),(20,1,12,_binary '\0',_binary '');
/*!40000 ALTER TABLE `users_in_course` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-28 21:07:11
