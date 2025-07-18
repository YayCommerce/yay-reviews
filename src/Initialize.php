<?php
namespace YayRev;

use YayRev\SingletonTrait;


/**
 * YayReviews Plugin Initializer
 */
class Initialize {

	use SingletonTrait;

	/**
	 * The Constructor that load the engine classes
	 */
	protected function __construct() {
		\YayRev\Classes\Emails::get_instance();
		\YayRev\Classes\Cron::get_instance();
		\YayRev\Register\RegisterFacade::get_instance();
		\YayRev\RestAPI::get_instance();
		\YayRev\Ajax::get_instance();
		// check queue table exists and create if not exists
		ActDeact::activate();
	}
}
