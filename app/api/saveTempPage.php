<?php
$_POST = json_decode(file_get_contents("php://input"), true);

$newFile = "../site/dont-use-that-page-01010.html";

if($_POST["html"]) {
    file_put_contents($newFile, $_POST["html"]);
} else {
    header("HTTP/1.0 400 Bad Request");
}