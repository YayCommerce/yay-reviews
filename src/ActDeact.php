<?php

namespace YayReviews;

use YayReviews\Queue\EmailQueue;
use YayReviews\SingletonTrait;
/**
 * Activate and deactive method of the plugin and relates.
 */
class ActDeact {
	use SingletonTrait;

	protected function __construct() {}

	public static function activate() {
		update_option( 'yayrev_version', YAYREV_VERSION );

		EmailQueue::create_table();
	}

	public static function deactivate() {
		// remove cron job
		wp_clear_scheduled_hook( 'yayrev_reminder_email' );
	}
}
