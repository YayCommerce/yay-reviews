<?php
namespace YayReviews;

use YayReviews\SingletonTrait;

defined( 'ABSPATH' ) || exit;
/**
 * I18n Logic
 *
 * @method static I18n get_instance()
 */
class I18n {

	use SingletonTrait;

	private function __construct() {
		add_action( 'init', array( $this, 'load_plugin_text_domain' ) );
		add_filter( 'yay_reviews_translations', array( $this, 'get_translations' ) );
	}

	public static function load_plugin_text_domain() {
		if ( function_exists( 'determine_locale' ) ) {
			$locale = determine_locale();
		} else {
			$locale = is_admin() ? get_user_locale() : get_locale();
		}

		unload_textdomain( 'yay-reviews' );
		load_textdomain( 'yay-reviews', YAY_REVIEWS_PLUGIN_PATH . '/languages/yay-reviews-' . $locale . '.mo' );

		load_plugin_textdomain( 'yay-reviews', false, YAY_REVIEWS_PLUGIN_PATH . '/languages/' );
	}

	public function get_translations() {
		$translations = get_translations_for_domain( 'yay-reviews' );
		$messages     = array();

		$entries = $translations->entries;
		foreach ( $entries as $key => $entry ) {
			$messages[ $entry->singular ] = $entry->translations;
		}

		return array(
			'locale_data' => array(
				'messages' => $messages,
			),
		);
	}
}
