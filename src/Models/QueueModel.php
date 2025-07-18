<?php

namespace YayRev\Models;

use YayRev\Queue\EmailQueue;
use YayRev\Queue\ReminderQueue;
use YayRev\Queue\RewardQueue;

class QueueModel {

	public static function get_queue_class( $type ) {
		switch ( $type ) {
			case 'reward':
				return RewardQueue::class;
			default:
				return ReminderQueue::class;
		}
	}

	/*
	 * Find email queue by id
	 *
	 * @param int $id The ID of the email queue to find.
	 *
	 * @return array The email queue data.
	 */
	public static function find_by_id( $id ) {
		$data = EmailQueue::query_queue( $id );
		if ( empty( $data ) ) {
			return null;
		}
		$instance_class = self::get_queue_class( $data->type );
		return new $instance_class( $data );
	}

	/**
	 * Count email queue
	 *
	 * @return int The count of the email queue.
	 */
	public static function count() {
		return EmailQueue::query_queue_count();
	}

	/**
	 * Find all email queue
	 *
	 * @param int $page The page number.
	 * @param int $per_page The number of items per page.
	 *
	 * @return array The email queue data.
	 */
	public static function find_all( $page = 1, $per_page = 10 ) {
		$result = EmailQueue::query_queue_list( $page, $per_page );

		return array_map(
			function( $item ) {
				$instance_class = self::get_queue_class( $item->type );
				return new $instance_class( $item );
			},
			$result
		);
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
	public static function create( $data ) {
		return EmailQueue::insert_queue( $data );
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
	public static function update( $id, $data ) {
		return EmailQueue::update_queue( $id, $data );
	}
}
