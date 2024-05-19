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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'test course','test course',1,NULL,_binary '\0'),(2,'nowy kurs','testowy kurs',4,NULL,_binary '\0'),(3,'nowy kurs 2','kolejny testowy kurs',4,'$2a$11$cvLu51dw8a3pfaDkU5R/Bue1Hsme1Sa4VfXH2rSWJzzTWyroWhdpK',_binary '\0'),(9,'nowy kurs 3','test czy dobrze już działa',4,NULL,_binary '\0'),(10,'abc','Litwo, Ojczyzno moja! ty jesteś jak zdrowie;\nIle cię trzeba cenić, ten tylko się dowie,\nKto cię stracił. Dziś piękność twą w całej ozdobie\nWidzę i opisuję, bo tęsknię po tobie.\n\nPanno święta, co Jasnej bronisz Częstochowy\nI w Ostrej świecisz Bramie! Ty, co gród zamkowy\nNowogródzki ochraniasz z jego wiernym ludem!\nJak mnie dziecko do zdrowia powróciłaś cudem\n(— Gdy od płaczącej matki, pod Twoją opiekę\nOfiarowany martwą podniosłem powiekę;\nI zaraz mogłem pieszo, do Twych świątyń progu\nIść za wrócone życie podziękować Bogu —)\nTak nas powrócisz cudem na Ojczyzny łono!...\nTymczasem, przenoś moją duszę utęsknioną\nDo tych pagórków leśnych, do tych łąk zielonych,\nSzeroko nad błękitnym Niemnem rozciągnionych;\nDo tych pól malowanych zbożem rozmaitem,\nWyzłacanych pszenicą, posrebrzanych żytem;\nGdzie bursztynowy świerzop, gryka jak śnieg biała,\nGdzie panieńskim rumieńcem dzięcielina pała,\nA wszystko przepasane jakby wstęgą, miedzą\nZieloną, na niej zrzadka ciche grusze siedzą.',4,NULL,_binary '\0');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test','$2a$11$Mmo5iUU2mlrAbmI0h6ihn.Bv04aNGIsLfF8mRzie0/7oraOq40pwq',0,NULL,NULL),(2,'abc','$2a$11$0cnobCiB2xKBm2f88wCT3uQXVAjecZQ96.Go1qPvXQIHySbXNmr1.',2,NULL,NULL),(3,'abcd','$2a$11$nQCcdk1nXWcGmfAuh/WNkOHUtrHt1MASI8Bb34OVmApI5l1Z5Yuhe',1,'Marcin','Ryt'),(4,'ndmsv','$2a$11$EWX4fmi5oBCeZHm8spawsukKp.1Viu3Zu1zGva2gjXZqJYIVIz/Ae',0,'Jakub','Głuszek');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_in_course`
--

LOCK TABLES `users_in_course` WRITE;
/*!40000 ALTER TABLE `users_in_course` DISABLE KEYS */;
INSERT INTO `users_in_course` VALUES (1,1,1,_binary '',_binary '\0'),(2,4,2,_binary '',_binary '\0'),(3,4,3,_binary '',_binary '\0'),(4,4,9,_binary '',_binary '\0'),(5,4,10,_binary '',_binary '\0'),(6,1,2,_binary '\0',_binary '\0'),(7,1,9,_binary '\0',_binary '\0'),(8,2,1,_binary '\0',_binary '\0'),(9,1,3,_binary '\0',_binary '\0'),(10,1,10,_binary '\0',_binary '\0'),(11,3,1,_binary '\0',_binary '\0'),(12,3,3,_binary '\0',_binary '\0');
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

-- Dump completed on 2024-05-19 17:58:20
