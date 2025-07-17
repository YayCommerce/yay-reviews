<?php
namespace YayReviews\Emails;

use YayReviews\Classes\EmailQueue;
use YayReviews\Constants\EmailConstants;
use YayReviews\Emails\PlaceholderProcessors\ReminderPlaceholderProcessor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ReminderEmail extends \WC_Email {

	public function __construct() {
		$this->id             = 'yayrev_reminder';
		$this->customer_email = true;
		$this->title          = __( 'Review Reminder', 'yay-reviews' );
		$this->description    = __( 'This email is sent to customers to remind them to review their purchased products.', 'yay-reviews' );
		$this->template_html  = 'emails/reminder-email.php';
		$this->template_plain = 'emails/plain/reminder-email.php';
		$this->template_base  = YAYREV_PLUGIN_PATH . 'views/';
		$this->placeholders   = ReminderPlaceholderProcessor::DEFAULT_PLACEHOLDERS;

		// Call parent constructor
		parent::__construct();

		// Triggers for this email.
		add_action( EmailConstants::REMINDER_EMAIL_ACTION, array( $this, 'trigger' ), 10, 3 );
	}

	public function trigger( $order_id, $order = false, $email_id = 0 ) {
		$this->setup_locale();

		if ( $order_id && ! is_a( $order, 'WC_Order' ) ) {
			$order = wc_get_order( $order_id );
		}

		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}

		if ( 'sent' === get_post_meta( $order_id, '_yayrev_reminder_email_scheduled_sent', true ) ) {
			return;
		}

		$placeholder_processor = new ReminderPlaceholderProcessor( array( 'order' => $order ) );
		$recipient_email = $order->get_billing_email();

		$this->object    = $order;
		$this->recipient = $recipient_email;
		$this->placeholders = $placeholder_processor->get_placeholders();

		try {
			if ( ! $this->is_enabled() ) {
				throw new \Exception( __( 'Email is not enabled', 'yay-reviews' ) );
			}

			if ( empty( $recipient_email ) ) {
				throw new \Exception( __( 'Recipient email is empty', 'yay-reviews' ) );
			}

			/**
			 * Send email
			 */
			$result = $this->send( $recipient_email, $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );

			/**
			 * Update email queue
			 * If email is sent, update email queue status to 1
			 */
			if ( ! empty( $email_id ) ) {
				EmailQueue::update_queue(
					$email_id,
					array(
						'status'         => $result ? 1 : 0,
						'body'           => $this->get_content(),
						'subject'        => $this->get_subject(),
						'customer_email' => $recipient_email,
						'created_at'     => current_time( 'mysql' ),
					) 
				);
			}	

			if ( ! $result ) {
				throw new \Exception( __( 'Email sending failed', 'yay-reviews' ) );
			}
			
			/**
			 * Update order meta
			 */
			update_post_meta( $order_id, '_yayrev_reminder_email_scheduled_sent', 'sent' );
			
		} catch ( \Exception $e ) {
			if ( DOING_AJAX && isset( $_POST['nonce'] ) && wp_verify_nonce( $_POST['nonce'], 'yayrev_nonce' ) ) {
				wp_send_json_error( array( 'mess' => $e->getMessage() ) );
			}
		} finally {
			$this->restore_locale();
		}
	}

	/**
	 * Get default subject
	 * 
	 * @return string
	 */
	public function get_default_subject() {
		return self::get_default_email_settings()['subject'];
	}

	/**
	 * Get default heading
	 * 
	 * @return string
	 */
	public function get_default_heading() {
		return self::get_default_email_settings()['heading'];
	}

	/**
	 * Get email content
	 * 
	 * @return string
	 */
	public function get_email_content() {
		return self::get_email_settings(true)['content'];
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
				'placeholder' => self::get_default_email_settings()['content'],
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

	public static function get_default_email_settings() {
		return array(
			'subject' => __( 'Reminder email', 'yay-reviews' ),
			'heading' => __( 'Thank you for your purchase!', 'yay-reviews' ),
			'content' => '<p style="text-align: left;font-size: 16px;color: #0F172A;">' . __( 'Thank you for your recent purchase! Please take a moment to share your thoughts by reviewing these products. Your feedback helps us improve and earns you reward! {review_products}', 'yay-reviews' ) . '</p>',
		);
	}

	public static function get_email_settings( $with_default = false ) {
		$settings = get_option( 'woocommerce_yayrev_reminder_settings', null );
		if ( $with_default ) {
			return wp_parse_args( $settings, self::get_default_email_settings() );
		}
		return $settings;
	}
}
