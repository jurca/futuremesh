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
if (substr($data, 0, 1) === '2') {
    $data = json_decode(substr($data, 1));
    $packFormat = 'n*'; // unsigned 16-bit integer, big endian
    $data = '3' . call_user_func_array('pack',
            array_merge(array($packFormat), $data));
}
file_put_contents($file, $data);
chmod($file, 0666);
