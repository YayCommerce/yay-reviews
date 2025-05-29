<?php
namespace YayReviews\Classes;

use YayReviews\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Emails {
	use SingletonTrait;

	public function __construct() {
		add_filter( 'woocommerce_email_classes', array( $this, 'register_email_classes' ) );
		add_filter( 'woocommerce_email_actions', array( $this, 'register_email_actions' ) );
	}

	public function register_email_classes( $email_classes ) {
		if ( Helpers::get_settings( 'addons', 'reminder', false ) ) {
			// Reminder Email
			require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Emails/ReminderEmail.php';
			$email_classes['YayReviews_Reminder_Email'] = new \YayReviews\Emails\ReminderEmail();
		}
		return $email_classes;
	}

	public function register_email_actions( $actions ) {
		$actions[] = 'yay_reviews_reminder_email_notification';
		return $actions;
	}
}
