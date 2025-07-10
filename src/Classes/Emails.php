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
		add_action( 'woocommerce_update_options_email_yay_reviews_reminder', array( $this, 'save_reminder_email_settings' ) );
		add_action( 'woocommerce_update_options_email_yay_reviews_reward', array( $this, 'save_reward_email_settings' ) );
		add_filter( 'woocommerce_email_preview_placeholders', array( $this, 'add_placeholders' ), 10, 2 );
	}

	public function register_email_classes( $email_classes ) {
		// Reminder Email
		require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Emails/ReminderEmail.php';
		require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Emails/RewardEmail.php';
		$settings         = Helpers::get_all_settings();
		$reminder_enabled = isset( $settings['addons']['reminder_enabled'] ) ? $settings['addons']['reminder_enabled'] : false;
		$reward_enabled   = isset( $settings['addons']['reward_enabled'] ) ? $settings['addons']['reward_enabled'] : false;
		if ( $reminder_enabled ) {
			$email_classes['Yay_Reviews_Reminder'] = new \YayReviews\Emails\ReminderEmail();
		}
		if ( $reward_enabled ) {
			$email_classes['Yay_Reviews_Reward'] = new \YayReviews\Emails\RewardEmail();
		}

		return $email_classes;
	}

	public function register_email_actions( $actions ) {
		// Register our custom email action
		$actions[] = 'yay_reviews_reminder_email_notification';
		$actions[] = 'yay_reviews_reward_email_notification';
		return $actions;
	}

	public function save_reminder_email_settings() {
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

	public function save_reward_email_settings() {
		if ( ! isset( $_GET['page'] ) || 'wc-settings' !== $_GET['page'] ) {
			return;
		}

		if ( ! isset( $_GET['tab'] ) || 'email' !== $_GET['tab'] ) {
			return;
		}

		if ( ! isset( $_GET['section'] ) || 'yay_reviews_reward' !== $_GET['section'] ) {
			return;
		}

		// Save reward email settings
		$settings                    = Helpers::get_all_settings();
		$email_settings              = $settings['email']['reward'];
		$subject                     = isset( $_POST['woocommerce_yay_reviews_reward_subject'] ) && ! empty( $_POST['woocommerce_yay_reviews_reward_subject'] ) ? sanitize_text_field( $_POST['woocommerce_yay_reviews_reward_subject'] ) : '';
		$heading                     = isset( $_POST['woocommerce_yay_reviews_reward_heading'] ) && ! empty( $_POST['woocommerce_yay_reviews_reward_heading'] ) ? sanitize_text_field( $_POST['woocommerce_yay_reviews_reward_heading'] ) : '';
		$content                     = isset( $_POST['woocommerce_yay_reviews_reward_content'] ) && ! empty( $_POST['woocommerce_yay_reviews_reward_content'] ) ? sanitize_text_field( $_POST['woocommerce_yay_reviews_reward_content'] ) : '';
		$footer                      = isset( $_POST['woocommerce_yay_reviews_reward_footer'] ) && ! empty( $_POST['woocommerce_yay_reviews_reward_footer'] ) ? sanitize_text_field( $_POST['woocommerce_yay_reviews_reward_footer'] ) : '';
		$email_settings['subject']   = ! empty( $subject ) ? $subject : $email_settings['subject'];
		$email_settings['heading']   = ! empty( $heading ) ? $heading : $email_settings['heading'];
		$email_settings['content']   = ! empty( $content ) ? $content : $email_settings['content'];
		$email_settings['footer']    = ! empty( $footer ) ? $footer : $email_settings['footer'];
		$settings['email']['reward'] = $email_settings;
		Helpers::update_settings( $settings );
	}

	public function add_placeholders( $placeholders, $email_type ) {
		if ( 'YayReviews\Emails\ReminderEmail' === $email_type ) {
			$placeholders['{review_products}'] = Helpers::get_review_products( 'sample' );
			$placeholders['{site_title}']      = get_bloginfo( 'name' );
			$placeholders['{customer_name}']   = 'John Doe';
		}
		if ( 'YayReviews\Emails\RewardEmail' === $email_type ) {
			$placeholders['{site_title}']    = get_bloginfo( 'name' );
			$placeholders['{customer_name}'] = 'John Doe';
			$placeholders['{coupon_code}']   = '123456';
			$placeholders['{product_name}']  = 'Sample Product';
		}
		return $placeholders;
	}
}
