<?php

namespace YayRev\Queue;

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

	public static function query_queue( $id ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_name} WHERE id = %d", $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		/* @codingStandardsIgnoreEnd */
	}

	public static function query_queue_count() {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		return $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		/* @codingStandardsIgnoreEnd */
	}

	public static function query_queue_list( $page = 1, $per_page = 10 ) {
		global $wpdb;
		$offset     = ( $page - 1 ) * $per_page;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_name} ORDER BY created_at DESC LIMIT %d OFFSET %d", $per_page, $offset ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		/* @codingStandardsIgnoreEnd */
	}

	/**
	 * Insert email queue
	 *
	 * @param array $data An associative array of data to insert.
	 *   - 'type' (string): The type of the email queue.
	 *   - 'subject' (string): The subject of the email queue.
	 *   - 'body' (string): The body of the email queue.
	 *   - 'status' (int): The status of the email queue. 0: pending, 1: sent, 2: dismissed
	 *   - 'customer_email' (string): The customer email of the email queue.
	 *   - 'created_at' (string): The created at of the email queue.
	 *   - 'scheduled_event' (string): The scheduled event of the email queue.
	 *   - 'email_data' (string): The email data of the email queue.
	 *
	 * @return string The last error message from the database insert.
	 */
	public static function insert_queue( $data ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		return $wpdb->insert( $table_name, $data );
		/* @codingStandardsIgnoreEnd */
	}

	/**
	 * Update email queue
	 *
	 * @param int $id The ID of the email queue to update.
	 * @param array $data An associative array of data to update.
	 *   - 'type' (string): The type of the email queue.
	 *   - 'subject' (string): The subject of the email queue.
	 *   - 'body' (string): The body of the email queue.
	 *   - 'status' (int): The status of the email queue. 0: pending, 1: sent, 2: dismissed
	 *   - 'customer_email' (string): The customer email of the email queue.
	 *   - 'created_at' (string): The created at of the email queue.
	 *   - 'scheduled_event' (string): The scheduled event of the email queue.
	 *   - 'email_data' (string): The email data of the email queue.
	 *
	 * @return string The last error message from the database update.
	 */
	public static function update_queue( $id, $data ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		/* @codingStandardsIgnoreStart */
		$wpdb->update( $table_name, $data, array( 'id' => $id ) );
		/* @codingStandardsIgnoreEnd */
		return $wpdb->last_error;
	}
}
