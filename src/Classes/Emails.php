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
		add_action( 'woocommerce_update_options_email_yay_reviews_reminder', array( $this, 'save_email_settings' ) );
	}

	public function register_email_classes( $email_classes ) {
		// Reminder Email
		require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Emails/ReminderEmail.php';
		$email_classes['Yay_Reviews_Reminder'] = new \YayReviews\Emails\ReminderEmail();

		return $email_classes;
	}

	public function register_email_actions( $actions ) {
		// Register our custom email action
		$actions[] = 'yay_reviews_reminder_email_notification';
		return $actions;
	}

	public function save_email_settings() {
		if ( ! isset( $_GET['page'] ) || 'wc-settings' !== $_GET['page'] ) {
			return;
		}

		if ( ! isset( $_GET['tab'] ) || 'email' !== $_GET['tab'] ) {
			return;
		}

		if ( ! isset( $_GET['section'] ) || 'yay_reviews_reminder' !== $_GET['section'] ) {
			return;
		}

		// Save reminder email settings
		$settings                      = Helpers::get_all_settings();
		$email_settings                = $settings['email']['reminder'];
		$subject                       = isset( $_POST['woocommerce_yay_reviews_reminder_subject'] ) && ! empty( $_POST['woocommerce_yay_reviews_reminder_subject'] ) ? sanitize_text_field( $_POST['woocommerce_yay_reviews_reminder_subject'] ) : '';
		$heading                       = isset( $_POST['woocommerce_yay_reviews_reminder_heading'] ) && ! empty( $_POST['woocommerce_yay_reviews_reminder_heading'] ) ? sanitize_text_field( $_POST['woocommerce_yay_reviews_reminder_heading'] ) : '';
		$content                       = isset( $_POST['woocommerce_yay_reviews_reminder_content'] ) && ! empty( $_POST['woocommerce_yay_reviews_reminder_content'] ) ? sanitize_text_field( $_POST['woocommerce_yay_reviews_reminder_content'] ) : '';
		$footer                        = isset( $_POST['woocommerce_yay_reviews_reminder_footer'] ) && ! empty( $_POST['woocommerce_yay_reviews_reminder_footer'] ) ? sanitize_text_field( $_POST['woocommerce_yay_reviews_reminder_footer'] ) : '';
		$email_settings['subject']     = ! empty( $subject ) ? $subject : $email_settings['subject'];
		$email_settings['heading']     = ! empty( $heading ) ? $heading : $email_settings['heading'];
		$email_settings['content']     = ! empty( $content ) ? $content : $email_settings['content'];
		$email_settings['footer']      = ! empty( $footer ) ? $footer : $email_settings['footer'];
		$settings['email']['reminder'] = $email_settings;
		Helpers::update_settings( $settings );
	}
}
