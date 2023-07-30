<?php
$file = "../site/dont-use-that-page-01010.html";

if(file_exists($file)) {
    unlink($file);
} else {
    header("HTTP/1.0 400 Bad Request");
}