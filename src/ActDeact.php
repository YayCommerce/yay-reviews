<?php

namespace YayReviews;

use YayReviews\SingletonTrait;
use YayReviews\Classes\Helpers;
/**
 * Activate and deactive method of the plugin and relates.
 */
class ActDeact {
	use SingletonTrait;

	protected function __construct() {}

	public static function activate() {
		update_option( 'yay_reviews_version', YAY_REVIEWS_VERSION );
		// check if table exists
		global $wpdb;
		$table_name = $wpdb->prefix . 'yay_reviews_email_queue';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" ) !== $table_name ) {
			// create table for email queue
			$wpdb->query(
				"CREATE TABLE $table_name (
					id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
					type varchar(255) NOT NULL,
					subject varchar(255),
					body longtext,
					status int(1),
					customer_email varchar(255),
					created_at datetime NOT NULL,
					scheduled_event longtext,
					email_data longtext,
					PRIMARY KEY (id)
				)
				ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
			"
			);
		}

	}

	public static function deactivate() {
		// remove cron job
		wp_clear_scheduled_hook( 'yay_reviews_reminder_email' );
	}
}
