<?php
//header('Content-Type: application/octet-stream');

if (!isset($_GET['name'])) {
    echo "Specify the name parameter (file name)";
    exit;
}

$path = dirname(__DIR__) . DIRECTORY_SEPARATOR . "data" . DIRECTORY_SEPARATOR;
$file = $path . "maps" . DIRECTORY_SEPARATOR . $_GET['name'];

$data = file_get_contents($file);
if (substr($data, 0, 1) === '3') {
    $packFormat = 'n*'; // unsigned 16-bit integer, big endian
    $data = array_values(unpack($packFormat, substr($data, 1)));
    $data = '2' . json_encode($data);
}
echo $data;
