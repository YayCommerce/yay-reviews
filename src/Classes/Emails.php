<?php
namespace YayReviews\Classes;

use YayReviews\Emails\PlaceholderProcessors\ReminderPlaceholderProcessor;
use YayReviews\Emails\PlaceholderProcessors\RewardPlaceholderProcessor;
use YayReviews\Models\SettingsModel;
use YayReviews\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Emails {
	use SingletonTrait;

	public function __construct() {
		add_filter( 'woocommerce_email_classes', array( $this, 'register_email_classes' ) );
		// add_filter( 'woocommerce_email_actions', array( $this, 'register_email_actions' ) );
		add_filter( 'woocommerce_email_preview_placeholders', array( $this, 'add_placeholders' ), 10, 2 );
	}

	public function register_email_classes( $email_classes ) {
		$addon_settings   = SettingsModel::get_settings( 'addons', array() );
		$reminder_enabled = $addon_settings['reminder_enabled'] ?? false;
		$reward_enabled   = $addon_settings['reward_enabled'] ?? false;
		if ( $reminder_enabled ) {
			$email_classes['YayRev_Reminder'] = new \YayReviews\Emails\ReminderEmail();
		}
		if ( $reward_enabled ) {
			$email_classes['YayRev_Reward'] = new \YayReviews\Emails\RewardEmail();
		}

		return $email_classes;
	}

	public function register_email_actions( $actions ) {
		// Register our custom email action
		$actions[] = 'yayrev_reminder_email_notification';
		$actions[] = 'yayrev_reward_email_notification';
		return $actions;
	}

	public function add_placeholders( $placeholders, $email_type ) {
		if ( 'YayReviews\Emails\ReminderEmail' === $email_type ) {
			return ( new ReminderPlaceholderProcessor() )->get_placeholders();
		}
		if ( 'YayReviews\Emails\RewardEmail' === $email_type ) {
			return ( new RewardPlaceholderProcessor() )->get_placeholders();
		}
		return $placeholders;
	}
}
