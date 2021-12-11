<?php
/*
Database credentials. Assuming you are running MySQL
server with default setting (user 'root' with no password)
*/
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'idoharuki');
define('DB_PASSWORD', 'imilab');
define('DB_NAME', 'cardata');

//PODを使ってMySQL
try{
    $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME,
    DB_USERNAME, DB_PASSWORD);
    // set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    
}
catch(PDOException $e){
    die("Error: Could not connect. " . $e->getMessage());
}
?>
