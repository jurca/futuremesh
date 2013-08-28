<?php
header('Content-Type: application/json');

if (!isset($_GET['dir'])) {
    echo '{"error":"Please specify the dir parameter"}';
    exit;
}

$dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . $_GET['dir'];
$contents = glob($dir . DIRECTORY_SEPARATOR . '*');
$files = array();
foreach ($contents as $file) {
    $files[] = basename($file);
}
echo json_encode($files);
