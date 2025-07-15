<?php

namespace YayReviews\Classes;

class EmailQueue {

	public const TABLE_NAME = 'yayrev_email_queue';

	public static function create_table() {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;

		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) === $table_name ) { // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			return;
		}

		// create table for email queue
		/* @codingStandardsIgnoreStart */
		$wpdb->query(
			$wpdb->prepare(
				'CREATE TABLE %i (
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
				ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
				',
				$table_name
			)
		);
		/* @codingStandardsIgnoreEnd */

	}

	public static function get_queue( $id ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_name} WHERE id = %d", $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		/* @codingStandardsIgnoreEnd */
	}

	public static function get_queue_count() {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		return $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		/* @codingStandardsIgnoreEnd */
	}

	public static function get_queue_list( $page = 1, $per_page = 10 ) {
		global $wpdb;
		$offset     = ( $page - 1 ) * $per_page;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_name} ORDER BY created_at DESC LIMIT %d OFFSET %d", $per_page, $offset ), ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		/* @codingStandardsIgnoreEnd */
	}

	public static function insert_queue( $data ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		return $wpdb->insert( $table_name, $data );
	}

	public static function update_queue( $id, $data ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		$wpdb->update( $table_name, $data, array( 'id' => $id ) );
		return $wpdb->last_error;
	}
}
