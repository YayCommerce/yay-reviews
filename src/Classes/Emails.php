<?php
namespace YayReviews\Classes;

use YayReviews\Constants\EmailConstants;
use YayReviews\Emails\PlaceholderProcessors\ReminderPlaceholderProcessor;
use YayReviews\Emails\ReminderEmail;
use YayReviews\Models\SettingsModel;
use YayReviews\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Emails {
	use SingletonTrait;

	public function __construct() {
		add_filter( 'woocommerce_email_classes', array( $this, 'register_email_classes' ) );
		add_filter( 'woocommerce_email_actions', array( $this, 'register_email_actions' ) );
		add_filter( 'woocommerce_email_preview_placeholders', array( $this, 'add_placeholders' ), 10, 2 );
		add_action( 'yayrev_after_update_settings', array( $this, 'update_woocommerce_email_settings' ), 10, 1 );
	}

	public function register_email_classes( $email_classes ) {
		$reminder_enabled   = SettingsModel::get_settings( 'addons.reminder_enabled' );
		if ( $reminder_enabled ) {
			$email_classes['YayRev_Reminder_Email'] = new \YayReviews\Emails\ReminderEmail();
		}

		return $email_classes;
	}

	public function register_email_actions( $actions ) {
		// Register our custom email action
		$actions[] = EmailConstants::REMINDER_EMAIL_ACTION;
		return $actions;
	}

	public function add_placeholders( $placeholders, $email_type ) {
		if ( 'YayReviews\Emails\ReminderEmail' === $email_type ) {
			return ( new ReminderPlaceholderProcessor() )->get_placeholders();
		}
		return $placeholders;
	}

	public function update_woocommerce_email_settings( $saved_data ) {
		$email_settings = $saved_data['email'];
		if ( empty( $email_settings['reminder'] ) ) {
			return;
		}
		ReminderEmail::update_email_settings( $email_settings['reminder'] );
	}
}
