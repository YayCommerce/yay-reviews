<?php

namespace YayRev;

use YayRev\Queue\EmailQueue;
use YayRev\SingletonTrait;
/**
 * Activate and deactive method of the plugin and relates.
 */
class ActDeact {
	use SingletonTrait;

	protected function __construct() {}

	public static function activate() {
		update_option( 'yayrev_version', YAYREV_VERSION );

		EmailQueue::create_table();

		if ( class_exists( 'YayRev\Addons\Reward\RewardSchema' ) ) {
			\YayRev\Addons\Reward\RewardSchema::create_table();
		}

		do_action( 'yayrev_activate' );
	}

	public static function deactivate() {
		// remove cron job
		wp_clear_scheduled_hook( 'yayrev_reminder_email' );
		do_action( 'yayrev_deactivate' );
	}
}
