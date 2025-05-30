<?php
namespace YayReviews;

use YayReviews\SingletonTrait;


/**
 * YayReviews Plugin Initializer
 */
class Initialize {

	use SingletonTrait;

	/**
	 * The Constructor that load the engine classes
	 */
	protected function __construct() {
		\YayReviews\I18n::get_instance();
		\YayReviews\Classes\Emails::get_instance();
		\YayReviews\Classes\Cron::get_instance();
		\YayReviews\Register\RegisterFacade::get_instance();
		\YayReviews\RestAPI::get_instance();
	}
}
