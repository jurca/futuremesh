<?php
header('Content-Type: application/json');

if (!isset($_POST['name'])) {
    echo "Specify the name parameter (file name)";
    exit;
}

if (!isset($_POST['data'])) {
    echo "Specify the data parameter (map data)";
    exit;
}

$path = dirname(__DIR__) . DIRECTORY_SEPARATOR . "data" . DIRECTORY_SEPARATOR;
$file = $path . "maps" . DIRECTORY_SEPARATOR . $_POST['name'];

$data = $_POST['data'];
file_put_contents($file, $data);
chmod($file, 0666);
