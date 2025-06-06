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
		$this->title          = __( 'Review Reminder', 'yay-reviews' );
		$this->description    = __( 'This email is sent to customers to remind them to review their purchased products.', 'yay-reviews' );
		$this->template_html  = 'emails/reminder-email.php';
		$this->template_plain = 'emails/plain/reminder-email.php';
		$this->template_base  = YAY_REVIEWS_PLUGIN_PATH . 'views/';
		$this->placeholders   = array(
			'{order_date}'     => '',
			'{order_number}'   => '',
			'{customer_name}'  => '',
			'{site_title}'     => '',
			'{products_table}' => '',
		);

		// Call parent constructor
		parent::__construct();

		// Triggers for this email.
		add_action( 'yay_reviews_reminder_email_notification', array( $this, 'trigger' ), 10, 2 );
	}

	public function trigger( $order_id, $order = false ) {
		$this->setup_locale();

		if ( $order_id && ! is_a( $order, 'WC_Order' ) ) {
			$order = wc_get_order( $order_id );
		}

		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}

		if ( get_post_meta( $order_id, '_yay_reviews_reminder_email_scheduled_sent', true ) ) {
			return;
		}

		$recipient_email = $order->get_billing_email();

		$settings          = Helpers::get_all_settings();
		$reminder_settings = $settings['reminder'];

		// Check if sending to guests is disabled
		if ( ! $reminder_settings['send_to_guests'] ) {
			$customer_id = $order->get_customer_id();
			if ( ! $customer_id ) {
				return;
			} else {
				$recipient_email = get_user_meta( $customer_id, 'billing_email', true );
			}
		}

		// Check excluded emails
		$excluded_emails = isset( $reminder_settings['except_emails'] ) ? $reminder_settings['except_emails'] : '';
		if ( ! empty( $excluded_emails ) ) {
			$excluded_emails = array_map( 'trim', explode( "\n", $excluded_emails ) );
			if ( in_array( $recipient_email, $excluded_emails ) ) {
				return;
			}
		}

		$this->object                           = $order;
		$this->recipient                        = $recipient_email;
		$this->placeholders['{order_date}']     = wc_format_datetime( $this->object->get_date_created() );
		$this->placeholders['{order_number}']   = $this->object->get_order_number();
		$this->placeholders['{customer_name}']  = $this->object->get_formatted_billing_full_name();
		$this->placeholders['{site_title}']     = get_bloginfo( 'name' );
		$this->placeholders['{products_table}'] = $this->get_products_table();

		if ( $this->is_enabled() && ! empty( $recipient_email ) ) {
			$this->send( $recipient_email, $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
			update_post_meta( $order_id, '_yay_reviews_reminder_email_scheduled_sent', 'yes' );
		}

		$this->restore_locale();
	}

	public function get_default_subject() {
		$reminder_settings = Helpers::get_settings( 'email', 'reminder', array() );
		if ( isset( $reminder_settings['subject'] ) ) {
			return $reminder_settings['subject'];
		}
		return __( 'Reminder email', 'yay-reviews' );
	}

	public function get_default_heading() {
		$reminder_settings = Helpers::get_settings( 'email', 'reminder', array() );
		if ( isset( $reminder_settings['heading'] ) ) {
			return $reminder_settings['heading'];
		}
		return __( 'Reminder email for you', 'yay-reviews' );
	}

	public function get_email_content() {
		$reminder_settings = Helpers::get_settings( 'email', 'reminder', array() );
		if ( isset( $reminder_settings['content'] ) ) {
			return $reminder_settings['content'];
		}
		return __( 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged', 'yay-reviews' );
	}

	public function get_default_footer() {
		$reminder_settings = Helpers::get_settings( 'email', 'reminder', array() );
		if ( isset( $reminder_settings['footer'] ) ) {
			return $reminder_settings['footer'];
		}
		return __( 'Thank you for your review!', 'yay-reviews' );
	}

	public function get_products_table() {
		if ( ! $this->object ) {
			return '';
		}

		$product_in_order = array();
		$items            = $this->object->get_items();
		foreach ( $items as $item ) {
			$product_in_order[] = $item->get_product_id();
		}

		if ( empty( $product_in_order ) ) {
			return '';
		}
		$remind_product_ids = Helpers::get_max_remind_products_for_email( $product_in_order );

		if ( empty( $remind_product_ids ) ) {
			return '';
		}

		return wc_get_template_html(
			'emails/products-table.php',
			array(
				'product_list' => $remind_product_ids,
			),
			'',
			$this->template_base
		);
	}

	public function get_content_html() {
		return wc_get_template_html(
			$this->template_html,
			array(
				'order'         => $this->object,
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
				'order'         => $this->object,
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
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-reviews' ), '<code>{customer_name}, {site_title}, {product_table}</code>' ),
				'placeholder' => $this->get_email_content(),
				'default'     => '',
			),
			'footer'     => array(
				'title'       => __( 'Email Footer', 'yay-reviews' ),
				'type'        => 'textarea',
				'desc_tip'    => true,
				/* translators: %s: site title placeholder */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-reviews' ), '<code>{site_title}</code>' ),
				'placeholder' => $this->get_default_footer(),
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
