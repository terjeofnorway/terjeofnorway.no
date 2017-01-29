<?php


/** This class reads the query string and fetches the resource
 *  from the resources folder, making it transparent to the frontend client, while
 *  also reparating the resource folder from the public_html
 *
 *  Author: Terje Karlsen, Dinamo
 */
class ResourceProxy
{


    private static $RESOURCES_DIRECTORY;
    private static $MIME_TYPES = array(
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        'zip' => 'application/x-compressed',
        'pdf' => 'application/pdf',
        'mp4'=> 'video/mp4'
    );


    /* Inits the resource fetch
     * @return void
     */
    public static function init()
    {

        /* Cascade dir variable to set correct resource directory
         * based on environment and available resource dir */
        self::$RESOURCES_DIRECTORY = '/resources/';




        // Read the file path form the query string by exploding at the '&' character.
        $filePath = explode('&', $_SERVER['QUERY_STRING'])[1];

        // Combine with the stage_installation.
        $assetFolder = realpath(dirname(__FILE__) . '/../../') . self::$RESOURCES_DIRECTORY;
        $assetPath = $assetFolder . $filePath;


        self::outputResource($assetPath);

    }


    /* Gets the mime type by looking at extention
     * @return $mimeType The mimetype represented as string
     */

    private static function getMimeType($filePath)
    {
        $ext = strtolower(substr($filePath, strrpos($filePath,'.') + 1));
        $mimeType = self::$MIME_TYPES[$ext] ? self::$MIME_TYPES[$ext] : false;

        return $mimeType;
    }


    /* Find the actual physical file and redirect to the
     * client with the appropriate mime type
     */
    private static function outputResource($assetPath)
    {
        $mimeType = self::getMimeType($assetPath);

        if (!$mimeType) {
            die('invalid mime');
        }

        if (file_exists($assetPath)) {
            $file = @ fopen($assetPath, 'rb');

            if ($file) {
                header('Content-type: ' . $mimeType);
                header('Content-length: ' . filesize($assetPath));
                fpassthru($file);
                header("HTTP/1.1 200 OK");
                exit;
            } else {
                self::throwFileNotFound();
            }
        } else {
            self::throwFileNotFound();
        }

    }


    /* Throws appropriate 404
     */
    private static function throwFileNotFound()
    {
        http_response_code(404);

        die();
    }

}



ResourceProxy::init();

?>