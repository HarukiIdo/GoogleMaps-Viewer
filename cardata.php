<?php
require("carconfig.php");//includeみたいなん



function parseToXML($htmlStr)
{
$xmlStr=str_replace('<','&lt;',$htmlStr);
$xmlStr=str_replace('>','&gt;',$xmlStr);
$xmlStr=str_replace('"','&quot;',$xmlStr);
$xmlStr=str_replace("'",'&#39;',$xmlStr);
$xmlStr=str_replace("&",'&amp;',$xmlStr);
return $xmlStr;
}

// Select all the rows in the maphprkers table
try{
  // $sql = "select * from markers where 1";
  $sql = "select * from conference";

  $result = $pdo->query($sql);
  if($result->rowCount() > 0){
    header("Content-type: text/xml");
    // Start XML file, echo parent node
    echo "<?xml version='1.0' ?>";
    echo '<conference>';
    $ind=0;
    while($row = $result->fetch()){
      // Add to XML document node
      echo '<marker ';
      echo 'vehicletype="' . $row['vehicletype'] . '" ';
      echo 'loopcount="' . $row['loopcount'] . '" ';
      echo 'car_ego_lat="' . $row['car_ego_lat'] . '" ';
      echo 'car_ego_lng="' . $row['car_ego_lng'] . '" ';
      echo 'car_ego_angle="' . $row['car_ego_angle'] . '" ';
      echo 'tra_total="' . $row['tra_total'] . '" ';
      echo 'tra_num="' . $row['tra_num'] . '" ';
      echo 'tra_lat="' . $row['tra_lat'] . '" ';
      echo 'tra_lng="' . $row['tra_lng'] . '" ';
      echo 'tra_ang="' . $row['tra_ang'] . '" ';
      echo 'tra_carflag="' . $row['tra_carflag'] . '" ';
      echo 'infra_ego_lat="' . $row['infra_ego_lat'] . '" ';
      echo 'infra_ego_lng="' . $row['infra_ego_lng'] . '" ';
      echo 'infra_ego_angle="' . $row['infra_ego_angle'] . '" ';
      echo 'jointflag="' . $row['jointflag'] . '" ';
      // echo 'car_loopcount="' . $row['car_loopcount'] . '" ';
      // echo 'car_GPStime="' . $row['car_GPStime'] . '" ';
      // echo 'car_ego_lat="' . $row['car_ego_lat'] . '" ';
      // echo 'car_ego_lng="' . $row['car_ego_lng'] . '" ';
      // echo 'car_ego_angle="' . $row['car_ego_angle'] . '" ';
      // echo 'car_tra_total="' . $row['car_tra_total'] . '" ';
      // echo 'car_tra_num="' . $row['car_tra_num'] . '" ';
      // echo 'car_tra_lat="' . $row['car_tra_lat'] . '" ';
      // echo 'car_tra_lng="' . $row['car_tra_lng'] . '" ';
      // echo 'car_tra_ang="' . $row['car_tra_ang'] . '" ';
      // echo 'car_tra_carflag="' . $row['car_tra_carflag'] . '" ';

      echo '/>';
      $ind = $ind + 1;
    }
    // End XML file
      echo '</conference>';
  }
}
catch(PDOException $e){
  die("ERROR: Could not able to execute $sql. " . $e->getMessage());
}
?>
