<?php
namespace YayRev\Addons\Reward;

use YayRev\Constants\EmailConstants;
use YayRev\Models\QueueModel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RewardEmail extends \WC_Email {

	public function __construct() {
		$this->id             = 'yayrev_reward';
		$this->customer_email = true;
		$this->title          = __( 'Review Reward', 'yay-customer-reviews-woocommerce' );
		$this->description    = __( 'This email is sent to customers to reward them for their reviews.', 'yay-customer-reviews-woocommerce' );
		$this->template_html  = 'emails/reward-email.php';
		$this->template_plain = 'emails/plain-reward-email.php';
		$this->template_base  = YAYREV_PLUGIN_PATH . 'src/Addons/Reward/views/';
		$this->placeholders   = RewardPlaceholderProcessor::DEFAULT_PLACEHOLDERS;

		// Call parent constructor
		parent::__construct();

		// Triggers for this email.
		add_action( EmailConstants::REWARD_EMAIL_ACTION, array( $this, 'trigger' ), 10, 4 );
	}

	public function trigger( $reward, $comment, $coupon, $product ) {
		$this->setup_locale();

		$recipient_email       = $reward->get_recipient_email( $comment );
		$placeholder_processor = new RewardPlaceholderProcessor(
			array(
				'comment' => $comment,
				'coupon'  => $coupon,
				'product' => $product,
			)
		);

		$this->object       = $coupon;
		$this->recipient    = $recipient_email;
		$this->placeholders = $placeholder_processor->get_placeholders();

		try {

			if ( ! $this->is_enabled() ) {
				throw new \Exception( __( 'Email is not enabled', 'yay-customer-reviews-woocommerce' ) );
			}

			if ( empty( $recipient_email ) ) {
				throw new \Exception( __( 'Recipient email is empty', 'yay-customer-reviews-woocommerce' ) );
			}

			if ( get_comment_meta( $comment->comment_ID, 'yayrev_reward_sent_' . $reward->get_id(), true ) ) {
				throw new \Exception( __( 'Email has already been sent', 'yay-customer-reviews-woocommerce' ) );
			}

			$result = $this->send( $recipient_email, $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );

			/**
			 * Add to email queue
			 * If email is sent, update email queue status to 1
			 */
			QueueModel::create(
				array(
					'type'           => 'reward',
					'subject'        => $this->get_subject(),
					'body'           => $this->get_content(),
					'status'         => $result ? 1 : 2,
					'customer_email' => $recipient_email,
					'created_at'     => current_time( 'mysql' ),
					'email_data'     => maybe_serialize(
						array(
							'reward_id'          => $reward->get_id(),
							'coupon_code'        => $coupon->get_code(),
							'product_name'       => $product->get_name(),
							'rating_requirement' => $reward->get_rating_requirement(),
							'media_requirement'  => $reward->get_media_requirement(),
							'frequency'          => $reward->get_frequency(),
						)
					),
				)
			);

			if ( ! $result ) {
				throw new \Exception( __( 'Email sent failed', 'yay-customer-reviews-woocommerce' ) );
			}

			update_comment_meta( $comment->comment_ID, 'yayrev_reward_sent_' . $reward->get_id(), true );
			if ( ! empty( $comment->user_id ) ) {
				// save customer meta for email sent
				$reward_data = array(
					'id'                 => $reward->get_id(),
					'name'               => $reward->get_name(),
					'coupon_id'          => $coupon->get_id(),
					'coupon_code'        => $coupon->get_code(),
					'coupon_amount'      => $coupon->get_amount(),
					'coupon_type'        => $coupon->get_discount_type(),
					'rating_requirement' => $reward->get_rating_requirement(),
					'media_requirement'  => $reward->get_media_requirement(),
					'frequency'          => $reward->get_frequency(),
				);
				update_user_meta( $comment->user_id, 'last_received_reward_' . $reward->get_id() . '_time', time() );
				update_user_meta( $comment->user_id, 'received_reward_' . $reward->get_id(), $reward_data );
			}
		} catch ( \Exception $e ) {
			if ( defined( 'DOING_AJAX' ) && DOING_AJAX && isset( $_POST['nonce'] ) && wp_verify_nonce( $_POST['nonce'], 'yayrev_nonce' ) ) {
				wp_send_json_error( array( 'mess' => $e->getMessage() ) );
			}
		} finally {

			$this->restore_locale();
		}
	}

	/*
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
				'coupon'        => $this->object,
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
				'coupon'        => $this->object,
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
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-customer-reviews-woocommerce' ), '<code>{customer_name}, {site_title}, {product_name}, {coupon_code}</code>' ),
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
			'subject' => __( 'Review reward email', 'yay-customer-reviews-woocommerce' ),
			'heading' => __( 'Thank you for your review!', 'yay-customer-reviews-woocommerce' ),
			'content' => '<p style="text-align: left;font-size: 16px;color: #0F172A;">' . __( 'Thank you for reviewing {product_name}! As a token of our appreciation, we\'ve sent you coupon: {coupon_code} to use on your next purchase.', 'yay-customer-reviews-woocommerce' ) . '</p>',
		);
	}

	public static function get_email_settings() {
		$settings = get_option(
			'woocommerce_yayrev_reward_settings',
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
	 * @param array $data Reward email settings
	 * @return void
	 */
	public static function update_email_settings( $data ) {
		if ( empty( $data ) ) {
			return;
		}
		$settings = self::get_email_settings();
		$settings = wp_parse_args( $data, $settings );
		if ( ! empty( $settings ) ) {
			update_option( 'woocommerce_yayrev_reward_settings', $settings );
		}
	}
}
