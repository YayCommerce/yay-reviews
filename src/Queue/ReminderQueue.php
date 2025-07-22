<?php

namespace YayRev\Queue;

class ReminderQueue extends SingleQueue {
	public function dequeue( $order_id ) {
		$timestamp = $this->get_scheduled_event()['timestamp'];
		return wp_unschedule_event( $timestamp, 'yayrev_reminder_email', array( $order_id, $this->id ) );
	}

	public function on_stage() {
		// TODO: Implement on_stage() method.
	}
}
