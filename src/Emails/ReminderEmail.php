<?php
namespace YayReviews\Emails;

use YayReviews\Classes\Helpers;
use YayReviews\Emails\PlaceholderProcessors\ReminderPlaceholderProcessor;
use YayReviews\Models\SettingsModel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ReminderEmail extends \WC_Email {

	public function __construct() {
		$this->id             = 'yay_reviews_reminder';
		$this->customer_email = true;
		$this->title          = __( 'Review Reminder', 'yay-reviews' );
		$this->description    = __( 'This email is sent to customers to remind them to review their purchased products.', 'yay-reviews' );
		$this->template_html  = 'emails/reminder-email.php';
		$this->template_plain = 'emails/plain/reminder-email.php';
		$this->template_base  = YAY_REVIEWS_PLUGIN_PATH . 'views/';
		$this->placeholders   = ReminderPlaceholderProcessor::DEFAULT_PLACEHOLDERS;

		// Call parent constructor
		parent::__construct();

		// Triggers for this email.
		add_action( 'yay_reviews_reminder_email_notification', array( $this, 'trigger' ), 10, 3 );
	}

	public function trigger( $order_id, $order = false, $email_id = 0 ) {
		$this->setup_locale();

		if ( $order_id && ! is_a( $order, 'WC_Order' ) ) {
			$order = wc_get_order( $order_id );
		}

		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}

		$recipient_email = $order->get_billing_email();

		$this->object    = $order;
		$this->recipient = $recipient_email;

		$placeholder_processor = new ReminderPlaceholderProcessor( array( 'order' => $order ) );

		$this->placeholders = $placeholder_processor->get_placeholders();

		if ( 'sent' === get_post_meta( $order_id, '_yay_reviews_reminder_email_scheduled_sent', true ) ) {
			return;
		}

		if ( $this->is_enabled() && ! empty( $recipient_email ) ) {
			$result = $this->send( $recipient_email, $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
			if ( ! empty( $email_id ) ) {
				Helpers::modify_email_queue(
					false,
					array(
						'id'             => $email_id,
						'status'         => $result ? 1 : 0,
						'body'           => $this->get_content(),
						'subject'        => $this->get_subject(),
						'customer_email' => $recipient_email,
						'created_at'     => current_time( 'mysql' ),
					)
				);
			}
			if ( $result ) {
				update_post_meta( $order_id, '_yay_reviews_reminder_email_scheduled_sent', 'sent' );
			}
		}

		$this->restore_locale();
	}

	public function get_default_subject() {
		return Helpers::get_wc_email_settings_default()['reminder']['subject'];
	}

	public function get_default_heading() {
		return Helpers::get_wc_email_settings_default()['reminder']['heading'];
	}

	public function get_email_content() {
		return Helpers::get_wc_email_settings_default()['reminder']['content'];
	}

	public function get_content_html() {
		return wc_get_template_html(
			$this->template_html,
			array(
				'order'         => $this->object,
				'email_heading' => $this->get_heading(),
				'email_content' => $this->get_email_content(),
				'sent_to_admin' => false,
				'plain_text'    => false,
				'email'         => $this,
			),
			'',
			$this->template_base
		);
	}

	public function get_content_plain() {
		return wc_get_template_html(
			$this->template_plain,
			array(
				'order'         => $this->object,
				'email_heading' => $this->get_heading(),
				'email_content' => $this->get_email_content(),
				'sent_to_admin' => false,
				'plain_text'    => true,
				'email'         => $this,
			),
			'',
			$this->template_base
		);
	}

	public function init_form_fields() {
		$this->form_fields = array(
			'enabled'    => array(
				'title'   => __( 'Enable/Disable', 'yay-reviews' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable this email notification', 'yay-reviews' ),
				'default' => 'yes',
			),
			'subject'    => array(
				'title'       => __( 'Subject', 'yay-reviews' ),
				'type'        => 'text',
				'desc_tip'    => true,
				/* translators: %s: site title placeholder */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-reviews' ), '<code>{site_title}</code>' ),
				'placeholder' => $this->get_default_subject(),
				'default'     => '',
			),
			'heading'    => array(
				'title'       => __( 'Email Heading', 'yay-reviews' ),
				'type'        => 'text',
				'desc_tip'    => true,
				/* translators: %s: site title placeholder */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-reviews' ), '<code>{site_title}</code>' ),
				'placeholder' => $this->get_default_heading(),
				'default'     => '',
			),
			'content'    => array(
				'title'       => __( 'Email Content', 'yay-reviews' ),
				'type'        => 'textarea',
				'desc_tip'    => true,
				/* translators: %s: list of available placeholders */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-reviews' ), '<code>{customer_name}, {site_title}, {review_products}</code>' ),
				'placeholder' => $this->get_email_content(),
				'default'     => '',
			),
			'email_type' => array(
				'title'       => __( 'Email type', 'yay-reviews' ),
				'type'        => 'select',
				'description' => __( 'Choose which format of email to send.', 'yay-reviews' ),
				'default'     => 'html',
				'class'       => 'email_type wc-enhanced-select',
				'options'     => $this->get_email_type_options(),
			),
		);
	}
}

return new ReminderEmail();
