<?php
 
    $url = file_get_contents("countryBorders.geo.json");
    $json = json_decode($url);
    $features = $json->features;
    $country_code = $_GET['countryCode'];

    $geometries = "";
    for($i = 0; $i < count($features); $i++) {
        $feature = $features[$i];
        if($feature->properties->iso_a2 == $country_code){
        $geometries = $feature->geometry;
        } 

    }

    echo json_encode($geometries);
 
?>
    


   