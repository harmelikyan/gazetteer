

<?php
//error handler
ini_set('display_errors', 'On');
error_reporting(E_ALL);

//runtime
$executionStartTime = microtime(true);
//api path
$url = 'https://openexchangerates.org/api/latest.json?symbols=' . $_REQUEST['code'] . '&app_id=9318991c2a37411d929bbcca815c62a4';



$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
//Set an option for a cURL transfer
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//provide the URL to use in the request
curl_setopt($ch, CURLOPT_URL, $url);
//curl execution
$result = curl_exec($ch);
//Close a cURL session
curl_close($ch);

$decode = json_decode($result, true);




    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode;

    header('Content-Type: application/json; charset=UTF-8');



echo json_encode($output);

?>
