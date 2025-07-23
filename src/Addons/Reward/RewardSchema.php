<?php

namespace YayRev\Addons\Reward;

class RewardSchema {

	public const TABLE_NAME = 'yayrev_reward';

	public static function create_table() {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;

		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) === $table_name ) { // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			if ( ! $wpdb->get_var( $wpdb->prepare( 'SHOW COLUMNS FROM %i LIKE %s', $table_name, 'last_trigger_comment_id' ) ) ) { // phpcs:ignore.
				$wpdb->query( $wpdb->prepare( 'ALTER TABLE %i ADD COLUMN last_trigger_comment_id bigint', $table_name ) ); // phpcs:ignore.
			}
			return;
		}

		// create table for email queue
		/* @codingStandardsIgnoreStart */
		$wpdb->query(
			$wpdb->prepare(
				'CREATE TABLE %i (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				customer_id bigint,
				customer_email varchar(255),
				created_at datetime NOT NULL,
				last_trigger_comment_id bigint,
				PRIMARY KEY (id)
				)
				ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
				',
				$table_name
			)
		);
		/* @codingStandardsIgnoreEnd */

	}

	public static function insert_reward( $data ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		$wpdb->insert( $table_name, $data );// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return $wpdb->insert_id;
		/* @codingStandardsIgnoreEnd */
	}

	public static function query_last_customer_reward( $id ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_name} WHERE customer_id = %d ORDER BY created_at DESC LIMIT 1", $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		/* @codingStandardsIgnoreEnd */
	}

	public static function query_last_customer_reward_by_email( $email ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_name} WHERE customer_email = %s ORDER BY created_at DESC LIMIT 1", $email ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		/* @codingStandardsIgnoreEnd */
	}

}
