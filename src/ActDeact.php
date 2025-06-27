<?php

namespace YayReviews;

use YayReviews\SingletonTrait;
/**
 * Activate and deactive method of the plugin and relates.
 */
class ActDeact {
	use SingletonTrait;

	protected function __construct() {}

	public static function activate() {
		// create table for email logs
		global $wpdb;
		$table_name = $wpdb->prefix . 'yay_reviews_email_logs';
		$sql        = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            type varchar(255) NOT NULL,
            subject varchar(255),
            body longtext,
            status int(1),
            customer_email varchar(255),
            created_at datetime NOT NULL,
            scheduled_event longtext,
            PRIMARY KEY (id)
        )";
		$wpdb->query( $sql );
	}

	public static function deactivate() {
	}
}
