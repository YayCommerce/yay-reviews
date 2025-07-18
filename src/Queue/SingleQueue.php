<?php

namespace YayReviews\Queue;

abstract class SingleQueue {

	protected $id;
	protected $type;
	protected $subject;
	protected $body;
	protected $status;
	protected $customer_email;
	protected $created_at;
	protected $scheduled_event;
	protected $email_data;

	public function __construct( $data ) {

		if ( empty( $data ) ) {
			return;
		}

		$this->id = $data->id ?? '';
		$this->type = $data->type ?? 'reminder';
		$this->subject = $data->subject ?? '';
		$this->body = $data->body ?? '';
		$this->status = $data->status ?? 0;
		$this->customer_email = $data->customer_email ?? '';
		$this->created_at = $data->created_at ?? '';
		$this->scheduled_event = $data->scheduled_event ?? '';
		$this->email_data = maybe_unserialize( $data->email_data ?? '' );
	}

	public function get_id() {
		return $this->id;
	}

	public function get_type() {
		return $this->type;
	}

	public function get_subject() {
		return $this->subject;
	}

	public function get_body() {
		return $this->body;
	}

	/**
	 * Get the status of the email queue
	 * 
	 * @return int The status of the email queue. 0: pending, 1: sent, 2: dismissed
	 */
	public function get_status() {
		return $this->status;
	}

	public function get_customer_email() {
		return $this->customer_email;
	}

	public function get_created_at() {
		return $this->created_at;
	}

	public function get_scheduled_event() {
		return maybe_unserialize( $this->scheduled_event );
	}

	public function get_email_data() {
		return $this->email_data;
	}

	public function get_delivery_time() {
		if ( '0' === $this->get_status() ) {
			return __( 'Send in', 'yay-reviews' ) . ' ' . human_time_diff( $this->get_scheduled_event()['timestamp'], current_time( 'timestamp' ) );
		} 
		if ( '1' === $this->get_status() ) {
			return $this->get_created_at();
		}
		return '';
	}

	public function set_created_at( $created_at ) {
		$this->created_at = $created_at;
	}

	public function set_status( $status ) {
		$this->status = $status;
	}

	public function get_object_data() {
		return [
			'id' => $this->get_id(),
			'type' => $this->get_type(),
			'subject' => $this->get_subject(),
			'body' => $this->get_body(),
			'status' => $this->get_status(),
			'customer_email' => $this->get_customer_email(),
			'created_at' => $this->get_created_at(),
			'scheduled_event' => $this->get_scheduled_event(),
			'email_data' => $this->get_email_data(),
			'delivery_time' => $this->get_delivery_time(),
		];
	}
}