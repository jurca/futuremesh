<?php
echo "Content-Type: text/html; charset=UTF-8\n\n";

// process GET parameters
if (!isset($_SERVER['QUERY_STRING'])) {
    $_SERVER['QUERY_STRING'] = '';
}
$getParams = explode('&', $_SERVER['QUERY_STRING']);
foreach ($getParams as $param) {
    $param = explode('=', $param, 2);
    if (!isset($param[1])) {
        $param[1] = '';
    }
    $_GET[$param[0]] = urldecode($param[1]);
}

// process POST parameters
if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    // process non-file form data
    if ($_SERVER['CONTENT_TYPE'] == 'application/x-www-form-urlencoded') {
        $handle = fopen('php://stdin', 'rb');
        $data = fread($handle, $_SERVER['CONTENT_LENGTH']);
        fclose($handle);
        $data = ltrim($data);
        $postParams = explode('&', $data);
        foreach ($postParams as $param) {
            $param = explode('=', $param, 2);
            if (!isset($param[1])) {
                $param[1] = '';
            }
            $_POST[$param[0]] = urldecode($param[1]);
        }
        unset($handle);
        unset($postParams);
        unset($data);
    } else { // data containing files
        $boundary = explode('boundary=', $_SERVER['CONTENT_TYPE'], 2);
        $boundary = '--' . $boundary[1];
        $handle = fopen('php://stdin', 'rb');
        $data = fread($handle, $_SERVER['CONTENT_LENGTH']);
        $buffer = '';
        while ($data != '') {
            $buffer .= substr($data, 0, 1);
            $data = substr($data, 1);
            if (substr($buffer, -strlen($boundary)) == $boundary) {
                $buffer = substr($buffer, 0, strlen($buffer) -
                        strlen($boundary));
                // process data part - separate it into lines first
                $line = '';
                $lines = array();
                $buffer = ltrim($buffer); // remove linebreak from beggining
                // remove linebreak from end of the buffer content
                $buffer = preg_replace("/\r?\n?$/s", '', $buffer);
                while ($buffer != '') {
                    $line .= substr($buffer, 0, 1);
                    $buffer = substr($buffer, 1);
                    if ((substr($line, -1) == "\r") &&
                            (substr($buffer, 0, 1) != "\n")) {
                        $lines[] = $headersDone ? $line : substr($line, 0, -1);
                        if (trim($line) == '') {
                            $lines[] = $buffer;
                            $buffer = '';
                        }
                        $line = '';
                    } elseif (substr($line, -2) == "\r\n") {
                        $lines[] = $headersDone ? $line : substr($line, 0, -2);
                        if (trim($line) == '') {
                            $lines[] = $buffer;
                            $buffer = '';
                        }
                        $line = '';
                    } elseif (substr($line, -1) == "\n") {
                        $lines[] = $headersDone ? $line : substr($line, 0, -1);
                        if (trim($line) == '') {
                            $lines[] = $buffer;
                            $buffer = '';
                        }
                        $line = '';
                    }
                }
                if (!empty($lines)) {
                    // process the headers and content (the last item of array)
                    print_r($lines);
                }
            }
        }
        fclose($handle);
        unset($handle);
        unset($data);
        unset($boundary);
        unset($buffer);
        unset($line);
    }
}
unset($getParams);
unset($param);
?>