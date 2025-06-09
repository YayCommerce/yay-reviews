<?php

namespace YayReviews\License;

defined( 'ABSPATH' ) || exit;

/**
 * CorePlugin
 *
 * @package CorePlugin
 */
class CorePlugin {

	public static function get( $name ) {
		$data = array(
			'path'        => YAY_REVIEWS_PLUGIN_PATH,
			'url'         => YAY_REVIEWS_PLUGIN_URL,
			'basename'    => YAY_REVIEWS_PLUGIN_BASENAME,
			'version'     => YAY_REVIEWS_VERSION,
			'slug'        => 'yaymail',
			'link'        => 'https://yaycommerce.com/yaymail-woocommerce-email-customizer/',
			'download_id' => '4216',
		);

		if ( isset( $data[ $name ] ) ) {
			return $data[ $name ];
		}
		return null;
	}
}
