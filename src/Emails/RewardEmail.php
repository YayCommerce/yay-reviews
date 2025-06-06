<?php
namespace YayReviews\Emails;

use YayReviews\Classes\Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RewardEmail extends \WC_Email {

	public function __construct() {
		$this->id             = 'yay_reviews_reward';
		$this->customer_email = true;
		$this->title          = __( 'Review Reward', 'yay-reviews' );
		$this->description    = __( 'This email is sent to customers to reward them for their reviews.', 'yay-reviews' );
		$this->template_html  = 'emails/reward-email.php';
		$this->template_plain = 'emails/plain/reward-email.php';
		$this->template_base  = YAY_REVIEWS_PLUGIN_PATH . 'views/';
		$this->placeholders   = array(
			'{order_date}'    => '',
			'{order_number}'  => '',
			'{customer_name}' => '',
			'{site_title}'    => '',
		);

		// Call parent constructor
		parent::__construct();

		// Triggers for this email.
		add_action( 'yay_reviews_reward_email_notification', array( $this, 'trigger' ), 10, 5 );
	}

	public function trigger( $reward, $comment, $coupon, $product, $recipient_email ) {
		$this->setup_locale();

		$recipient_email = $recipient_email;

		$this->object                          = $coupon;
		$this->recipient                       = $recipient_email;
		$this->placeholders['{site_title}']    = get_bloginfo( 'name' );
		$this->placeholders['{customer_name}'] = $comment->comment_author;
		$this->placeholders['{coupon_code}']   = $coupon->get_code();
		$this->placeholders['{product_name}']  = $product->get_name();

		if ( $this->is_enabled() && ! empty( $recipient_email ) ) {
			$this->send( $recipient_email, $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
		}

		$this->restore_locale();
	}

	public function get_default_subject() {
		$reward_settings = Helpers::get_settings( 'email', 'reward', array() );
		if ( isset( $reward_settings['subject'] ) ) {
			return $reward_settings['subject'];
		}
		return __( 'Reward email', 'yay-reviews' );
	}

	public function get_default_heading() {
		$reward_settings = Helpers::get_settings( 'email', 'reward', array() );
		if ( isset( $reward_settings['heading'] ) ) {
			return $reward_settings['heading'];
		}
		return __( 'Reward email for you', 'yay-reviews' );
	}

	public function get_email_content() {
		$reward_settings = Helpers::get_settings( 'email', 'reward', array() );
		if ( isset( $reward_settings['content'] ) ) {
			return $reward_settings['content'];
		}
		return __( 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged', 'yay-reviews' );
	}

	public function get_default_footer() {
		$reward_settings = Helpers::get_settings( 'email', 'reward', array() );
		if ( isset( $reward_settings['footer'] ) ) {
			return $reward_settings['footer'];
		}
		return __( 'Thank you for your review!', 'yay-reviews' );
	}

	public function get_content_html() {
		return wc_get_template_html(
			$this->template_html,
			array(
				'coupon'        => $this->object,
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
				'coupon'        => $this->object,
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
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-reviews' ), '<code>{customer_name}, {site_title}</code>' ),
				'placeholder' => $this->get_default_heading(),
				'default'     => '',
			),
			'content'    => array(
				'title'       => __( 'Email Content', 'yay-reviews' ),
				'type'        => 'textarea',
				'desc_tip'    => true,
				/* translators: %s: list of available placeholders */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-reviews' ), '<code>{customer_name}, {site_title}, {product_name}, {coupon_code}</code>' ),
				'placeholder' => $this->get_email_content(),
				'default'     => '',
			),
			'footer'     => array(
				'title'       => __( 'Email Footer', 'yay-reviews' ),
				'type'        => 'textarea',
				'desc_tip'    => true,
				/* translators: %s: site title placeholder */
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-reviews' ), '<code>{customer_name}, {site_title}</code>' ),
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

return new RewardEmail();
