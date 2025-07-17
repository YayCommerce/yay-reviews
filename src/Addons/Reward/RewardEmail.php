<?php
namespace YayReviews\Addons\Reward;

use YayReviews\Classes\EmailQueue;
use YayReviews\Constants\EmailConstants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RewardEmail extends \WC_Email {

	public function __construct() {
		$this->id             = 'yayrev_reward';
		$this->customer_email = true;
		$this->title          = __( 'Review Reward', 'yay-reviews' );
		$this->description    = __( 'This email is sent to customers to reward them for their reviews.', 'yay-reviews' );
		$this->template_html  = 'emails/reward-email.php';
		$this->template_plain = 'emails/plain/reward-email.php';
		$this->template_base  = YAYREV_PLUGIN_PATH . 'views/';
		$this->placeholders   = RewardPlaceholderProcessor::DEFAULT_PLACEHOLDERS;

		// Call parent constructor
		parent::__construct();

		// Triggers for this email.
		add_action( EmailConstants::REWARD_EMAIL_ACTION, array( $this, 'trigger' ), 10, 5 );
	}

	public function trigger( $reward, $comment, $coupon, $product, $recipient_email ) {
		$this->setup_locale();

		$recipient_email = $recipient_email;
		$placeholder_processor = new RewardPlaceholderProcessor(
			array(
				'comment' => $comment,
				'coupon'  => $coupon,
				'product' => $product,
			)
		);

		$this->object          = $coupon;
		$this->recipient       = $recipient_email;
		$this->placeholders    = $placeholder_processor->get_placeholders();

		try {

			if ( ! $this->is_enabled() ) {
				throw new \Exception( __( 'Email is not enabled', 'yay-reviews' ) );
			}

			if ( empty( $recipient_email ) ) {
				throw new \Exception( __( 'Recipient email is empty', 'yay-reviews' ) );
			}

			if ( get_comment_meta( $comment->comment_ID, 'yayrev_reward_sent_' . $reward['id'], true ) ) {
				throw new \Exception( __( 'Email has already been sent', 'yay-reviews' ) );
			}


			$result = $this->send( $recipient_email, $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );

			/**
			 * Add to email queue
			 * If email is sent, update email queue status to 1
			 */
			EmailQueue::insert_queue(
				array(
					'type'           => 'reward',
					'subject'        => $this->get_subject(),
					'body'           => $this->get_content(),
					'status'         => $result ? 1 : 2,
					'customer_email' => $recipient_email,
					'created_at'     => current_time( 'mysql' ),
					'email_data'     => maybe_serialize(
						array(
							'reward_id'          => $reward['id'],
							'coupon_code'        => $coupon->get_code(),
							'product_name'       => $product->get_name(),
							'rating_requirement' => $reward['rating_requirement'],
							'media_requirement'  => $reward['media_requirement'],
							'frequency'          => $reward['frequency'],
						)
					),
				)
			);

			if ( ! $result ) {
				throw new \Exception( __( 'Email sent failed', 'yay-reviews' ) );
			}

			update_comment_meta( $comment->comment_ID, 'yayrev_reward_sent_' . $reward['id'], true );
			if ( ! empty( $comment->user_id ) ) {
				// save customer meta for email sent
				$reward_data = array(
					'id'                 => $reward['id'],
					'name'               => $reward['name'],
					'coupon_id'          => $coupon->get_id(),
					'coupon_code'        => $coupon->get_code(),
					'coupon_amount'      => $coupon->get_amount(),
					'coupon_type'        => $coupon->get_discount_type(),
					'rating_requirement' => $reward['rating_requirement'],
					'media_requirement'  => $reward['media_requirement'],
					'frequency'          => $reward['frequency'],
				);
				update_user_meta( $comment->user_id, 'last_received_reward_' . $reward['id'] . '_time', time() );
				update_user_meta( $comment->user_id, 'received_reward_' . $reward['id'], $reward_data );
			}

		} catch ( \Exception $e ) {
			if ( DOING_AJAX && isset( $_POST['nonce'] ) && wp_verify_nonce( $_POST['nonce'], 'yayrev_nonce' ) ) {
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
		return self::get_email_settings(true)['content'];
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
				'description' => sprintf( __( 'Available placeholders: %s', 'yay-reviews' ), '<code>{customer_name}, {site_title}, {product_name}, {coupon_code}</code>' ),
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
			'subject' => __( 'Review reward email', 'yay-reviews' ),
			'heading' => __( 'Thank you for your review!', 'yay-reviews' ),
			'content' => '<p style="text-align: left;font-size: 16px;color: #0F172A;">' . __( 'Thank you for reviewing {product_name}! As a token of our appreciation, we\'ve sent you coupon: {coupon_code} to use on your next purchase.', 'yay-reviews' ) . '</p>',
		);
	}

	public static function get_email_settings( $with_default = false ) {
		$settings = get_option( 'woocommerce_yayrev_reward_settings', null );
		if ( $with_default ) {
			return wp_parse_args( $settings, self::get_default_email_settings() );
		}
		return $settings;
	}
}
