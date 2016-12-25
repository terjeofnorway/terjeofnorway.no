<?php

/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/general.php
 */



/* Sniff the server port */
if(isset($_SERVER['HTTPS'])){
    if($_SERVER['HTTPS'] == '1'){
        $serverPort = '443';
    } else {
        $serverPort = '80';
    }
} else {
    $serverPort = $_SERVER['SERVER_PORT'];
}

define('SITE_URL', 'http://' . $_SERVER['SERVER_NAME']);


define('INSTALLATION_PATH', realpath(dirname(__FILE__) . '/../'));
define('RESOURCES_PATH', realpath(dirname(__FILE__) . '/../../resources/'));

// The site basepath
define('CRAFT_PATH', realpath(dirname(__FILE__) . '/../') . '/');



return array(
    '*' => array(
        'omitScriptNameInUrls' => true,
        // Environmental variables
        // We can use these variables in the URL and Path settings
        // within the Craft Control Panel. For example:
        //    siteUrl   can be references as {siteUrl}
        //    basePath  can be references as {basePath}
        'environmentVariables' => array(
            'basePath' => CRAFT_PATH,
            'siteUrl' => SITE_URL,
            'baseInstallation' => INSTALLATION_PATH,
            'resourcesPath' => RESOURCES_PATH
        ),
    ),

    'terjeofnorway.dev' => array(
        'devMode' => true,
    ),

    'terjeofnorway.no' => array(
        'cooldownDuration' => 0,
    )
);
