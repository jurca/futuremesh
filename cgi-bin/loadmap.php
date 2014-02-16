<?php
//header('Content-Type: application/octet-stream');

if (!isset($_GET['name'])) {
    echo "Specify the name parameter (file name)";
    exit;
}

$path = dirname(__DIR__) . DIRECTORY_SEPARATOR . "data" . DIRECTORY_SEPARATOR;
$file = $path . "maps" . DIRECTORY_SEPARATOR . $_GET['name'];

echo file_get_contents($file);
