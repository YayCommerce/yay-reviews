<?php
namespace YayRev\Emails;

use YayRev\Classes\Helpers;
use YayRev\Constants\EmailConstants;
use YayRev\Emails\PlaceholderProcessors\ReminderPlaceholderProcessor;
use YayRev\Models\QueueModel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ReminderEmail extends \WC_Email {

	public function __construct() {
		$this->id             = 'yayrev_reminder';
		$this->customer_email = true;
		$this->title          = __( 'Review Reminder', 'yay-customer-reviews-woocommerce' );
		$this->description    = __( 'This email is sent to customers to remind them to review their purchased products.', 'yay-customer-reviews-woocommerce' );
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

		if ( Helpers::is_reminder_sent( $order_id ) ) {
			return;
		}

		$placeholder_processor = new ReminderPlaceholderProcessor( array( 'order' => $order ) );
		$recipient_email       = $order->get_billing_email();

		$this->object       = $order;
		$this->recipient    = $recipient_email;
		$this->placeholders = $placeholder_processor->get_placeholders();

		try {
			if ( ! $this->is_enabled() ) {
				throw new \Exception( __( 'Email is not enabled', 'yay-customer-reviews-woocommerce' ) );
			}

			if ( empty( $recipient_email ) ) {
				throw new \Exception( __( 'Recipient email is empty', 'yay-customer-reviews-woocommerce' ) );
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
				QueueModel::update(
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
				throw new \Exception( __( 'Email sending failed', 'yay-customer-reviews-woocommerce' ) );
			}

			/**
			 * Update order meta
			 */
			Helpers::update_order_reminder_status( $order_id, 'sent' );

		} catch ( \Exception $e ) {
			if ( DOING_AJAX && isset( $_POST['nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'yayrev_nonce' ) ) {
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
		$content = self::get_email_settings()['content'];
		return $content ? $content : self::get_default_email_settings()['content'];
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
				'title'   => __( 'Enable/Disable', 'yay-customer-reviews-woocommerce' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable this email notification', 'yay-customer-reviews-woocommerce' ),
				'default' => 'yes',
			),
			'subject'    => array(
				'title'       => __( 'Subject', 'yay-customer-reviews-woocommerce' ),
				'type'        => 'text',
				'desc_tip'    => true,
				/* translators: %s: site title placeholder */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-customer-reviews-woocommerce' ), '<code>{site_title}</code>' ),
				'placeholder' => $this->get_default_subject(),
				'default'     => '',
			),
			'heading'    => array(
				'title'       => __( 'Email Heading', 'yay-customer-reviews-woocommerce' ),
				'type'        => 'text',
				'desc_tip'    => true,
				/* translators: %s: site title placeholder */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-customer-reviews-woocommerce' ), '<code>{site_title}</code>' ),
				'placeholder' => $this->get_default_heading(),
				'default'     => '',
			),
			'content'    => array(
				'title'       => __( 'Email Content', 'yay-customer-reviews-woocommerce' ),
				'type'        => 'textarea',
				'desc_tip'    => true,
				/* translators: %s: list of available placeholders */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-customer-reviews-woocommerce' ), '<code>{customer_name}, {site_title}, {review_products}</code>' ),
				'placeholder' => self::get_default_email_settings()['content'],
				'default'     => '',
			),
			'email_type' => array(
				'title'       => __( 'Email type', 'yay-customer-reviews-woocommerce' ),
				'type'        => 'select',
				'description' => __( 'Choose which format of email to send.', 'yay-customer-reviews-woocommerce' ),
				'default'     => 'html',
				'class'       => 'email_type wc-enhanced-select',
				'options'     => $this->get_email_type_options(),
			),
		);
	}

	public static function get_default_email_settings() {
		return array(
			'subject' => __( 'Reminder email', 'yay-customer-reviews-woocommerce' ),
			'heading' => __( 'Thank you for your purchase!', 'yay-customer-reviews-woocommerce' ),
			'content' => '<p style="text-align: left;font-size: 16px;color: #0F172A;">' . __( 'Thank you for your recent purchase! Please take a moment to share your thoughts by reviewing these products. Your feedback helps us improve and earns you reward! {review_products}', 'yay-customer-reviews-woocommerce' ) . '</p>',
		);
	}

	public static function get_email_settings() {
		$settings = get_option(
			'woocommerce_yayrev_reminder_settings',
			array(
				'enabled'    => 'yes',
				'subject'    => '',
				'heading'    => '',
				'content'    => '',
				'email_type' => 'html',
			)
		);
		return $settings;
	}

	/**
	 * Update woocommerce email settings
	 *
	 * @param array $data Reminder email settings
	 * @return void
	 */
	public static function update_email_settings( $data ) {
		if ( empty( $data ) ) {
			return;
		}
		$settings = self::get_email_settings();
		$settings = wp_parse_args( $data, $settings );
		if ( ! empty( $settings ) ) {
			update_option( 'woocommerce_yayrev_reminder_settings', $settings );
		}
	}
}
