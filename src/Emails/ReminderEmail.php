<?php
namespace YayReviews\Emails;

use YayReviews\Classes\Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ReminderEmail extends \WC_Email {
	public function __construct() {
		$this->id             = 'yay_reviews_reminder';
		$this->customer_email = true;
		$this->title          = __( 'Review Reminder', 'yay_reviews' );
		$this->description    = __( 'This email is sent to customers to remind them to review their purchased products.', 'yay_reviews' );
		$this->template_html  = 'emails/reminder-email.php';
		$this->template_plain = 'emails/plain/reminder-email.php';
		$this->template_base  = YAY_REVIEWS_PLUGIN_PATH . 'views/';

		// Triggers for this email.
		add_action( 'yay_reviews_reminder_email_notification', array( $this, 'trigger' ), 10, 2 );

		// Call parent constructor
		parent::__construct();
	}

	public function trigger( $order_id, $order = false ) {
		$this->setup_locale();

		if ( $order_id && ! is_a( $order, 'WC_Order' ) ) {
			$order = wc_get_order( $order_id );
		}

		if ( is_a( $order, 'WC_Order' ) ) {
			$this->object                         = $order;
			$this->recipient                      = $this->object->get_billing_email();
			$this->placeholders['{order_date}']   = wc_format_datetime( $this->object->get_date_created() );
			$this->placeholders['{order_number}'] = $this->object->get_order_number();
		}

		if ( $this->is_enabled() && $this->get_recipient() ) {
			$this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
		}

			$this->restore_locale();
	}

	public function get_default_subject() {
		$reminder_settings = Helpers::get_settings( 'email', 'reminder', array() );
		if ( isset( $reminder_settings['subject'] ) ) {
			return $reminder_settings['subject'];
		}
		return __( 'Reminder email', 'yay_reviews' );
	}

	public function get_default_heading() {
		$reminder_settings = Helpers::get_settings( 'email', 'reminder', array() );
		if ( isset( $reminder_settings['heading'] ) ) {
			return $reminder_settings['heading'];
		}
		return __( 'Reminder email for you', 'yay_reviews' );
	}

	public function get_email_content() {
		$reminder_settings = Helpers::get_settings( 'email', 'reminder', array() );
		if ( isset( $reminder_settings['content'] ) ) {
			return $reminder_settings['content'];
		}
		return __( 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged', 'yay_reviews' );
	}

	public function get_default_footer() {
		$reminder_settings = Helpers::get_settings( 'email', 'reminder', array() );
		if ( isset( $reminder_settings['footer'] ) ) {
			return $reminder_settings['footer'];
		}
		return __( 'Thank you for your review!', 'yay_reviews' );
	}

	public function get_content_html() {
		return wc_get_template_html(
			$this->template_html,
			array(
				'email_heading' => $this->get_heading(),
				'email_content' => $this->get_email_content(),
				'email_footer'  => $this->get_default_footer(),
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
				'email_heading' => $this->get_heading(),
				'email_content' => $this->get_email_content(),
				'email_footer'  => $this->get_default_footer(),
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
				'title'   => __( 'Enable/Disable', 'yay_reviews' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable this email notification', 'yay_reviews' ),
				'default' => 'yes',
			),
			'subject'    => array(
				'title'       => __( 'Subject', 'yay_reviews' ),
				'type'        => 'text',
				/* translators: %s: site title placeholder */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay_reviews' ), '<code>{site_title}</code>' ),
				'placeholder' => $this->get_default_subject(),
				'default'     => '',
			),
			'heading'    => array(
				'title'       => __( 'Email Heading', 'yay_reviews' ),
				'type'        => 'text',
				/* translators: %s: site title placeholder */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay_reviews' ), '<code>{site_title}</code>' ),
				'placeholder' => $this->get_default_heading(),
				'default'     => '',
			),
			'content'    => array(
				'title'       => __( 'Email Content', 'yay_reviews' ),
				'type'        => 'textarea',
				/* translators: %s: list of available placeholders */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay_reviews' ), '<code>{customer_name}, {site_title}, {product_list}</code>' ),
				'placeholder' => $this->get_email_content(),
				'default'     => '',
			),
			'footer'     => array(
				'title'       => __( 'Email Footer', 'yay_reviews' ),
				'type'        => 'textarea',
				/* translators: %s: site title placeholder */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay_reviews' ), '<code>{site_title}</code>' ),
				'placeholder' => $this->get_default_footer(),
				'default'     => '',
			),
			'email_type' => array(
				'title'       => __( 'Email type', 'yay_reviews' ),
				'type'        => 'select',
				'description' => __( 'Choose which format of email to send.', 'yay_reviews' ),
				'default'     => 'html',
				'class'       => 'email_type wc-enhanced-select',
				'options'     => $this->get_email_type_options(),
			),
		);
	}
}
