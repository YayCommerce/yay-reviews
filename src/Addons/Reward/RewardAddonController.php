<?php

namespace YayReviews\Addons\Reward;

use YayReviews\Constants\EmailConstants;
use YayReviews\Models\SettingsModel;
use YayReviews\SingletonTrait;

class RewardAddonController {

	use SingletonTrait;

	public function __construct() {
		add_action( 'comment_approved_review', array( $this, 'send_reward_after_review_approved' ), 10, 2 );
		add_action( 'comment_post', array( $this, 'send_reward_after_review_posted' ), 11 );
		add_filter( 'yayrev_admin_localize_data', array( $this, 'add_reward_localize_data' ), 10, 1 );

		add_action( 'yayrev_send_other_queue_email', array( $this, 'send_other_queue_email' ), 10, 1 );
		add_filter( 'yayrev_preview_email_class', array( $this, 'set_preview_email_class' ), 10, 2 );
		add_filter( 'woocommerce_email_classes', array( $this, 'register_email_classes' ) );
		add_filter( 'woocommerce_email_actions', array( $this, 'register_email_actions' ) );
		add_filter( 'woocommerce_email_preview_placeholders', array( $this, 'add_placeholders' ), 10, 2 );

		add_action( 'yayrev_after_update_settings', array( $this, 'update_woocommerce_email_settings' ), 10, 1 );
		
	}

	public static function is_addon_enabled() {
		$reward_enabled   = SettingsModel::get_settings( 'addons.reward_enabled', false );
		return $reward_enabled;
	}

	public function send_reward_after_review_approved( $_, $comment ) {

		/*
		 * Check if comment is valid
		 */
		if ( ! $comment ) {
			return;
		}

		/**
		 * Check if comment is a review
		 */
		if ( $comment->comment_type !== 'review' ) {
			return;
		}

		/*
		 * Check if reward is already sent
		 */
		$waiting_review_reward_sent = get_comment_meta( $comment->comment_ID, 'yayrev_waiting_review_reward_sent', true );
		if ( $waiting_review_reward_sent ) {
			return; // if the reward is already sent, return
		}

		$this->get_comment_reward( $comment );

	}

	public function send_reward_after_review_posted( $comment_id ) {
		if ( ! isset( $_POST['yayrev_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['yayrev_nonce'] ) ), 'yay-reviews-nonce' ) ) {
			return;
		}
		// Check and send reward email
		$comment = get_comment( $comment_id );
		if ( ! $comment || '1' !== $comment->comment_approved || 'review' !== $comment->comment_type ) {
			return;
		}

		/**
		 * Check if comment is a review
		 */
		if ( $comment->comment_type !== 'review' ) {
			return;
		}

		$this->get_comment_reward( $comment );

	}

	private function get_comment_reward( $comment ) {

		if ( ! $comment || ! ( $comment instanceof \WP_Comment ) ) {
			return;
		}

		/**
		 * Check if comment is a review
		 */
		if ( $comment->comment_type !== 'review' ) {
			return;
		}

		/*
		* Check if reward is enabled
		*/
		$reward_enabled = SettingsModel::get_settings( 'addons.reward_enabled', false );
		if ( ! $reward_enabled ) {
			return;
		}
		
		/*
		* Check if rewards is empty
		*/
		$rewards        = SettingsModel::get_settings( 'rewards', array() );
		if ( count( $rewards ) < 1 ) {
			return;
		}

		/*
		 * Check if product is valid
		 */
		$product_id = $comment->comment_post_ID;
		$product    = \wc_get_product( $product_id );
		if ( ! $product || ! ( $product instanceof \WC_Product ) ) {
			return;
		}

		// sort rewards by rating_requirement
		usort(
			$rewards,
			function ( $a, $b ) {
				// priority of 5_stars is 1, less_than_5_stars is 2, any is 3
				$rating_priority = array(
					'5_stars'           => 1,
					'less_than_5_stars' => 2,
					'any'               => 3,
				);

				$media_priority = array(
					'at_least_1_media' => 1,
					'none'             => 2,
				);
				// if rating requirement is the same, then compare media requirement
				if ( $rating_priority[ $a['rating_requirement'] ] === $rating_priority[ $b['rating_requirement'] ] ) {
					return $media_priority[ $a['media_requirement'] ] <=> $media_priority[ $b['media_requirement'] ];
				}
				return $rating_priority[ $a['rating_requirement'] ] <=> $rating_priority[ $b['rating_requirement'] ];
			}
		);

		
		foreach ( $rewards as $reward ) {
			$reward_obj = new Reward( $reward );

			$coupon = $reward_obj->generate_coupon( $comment );

			if ( empty( $coupon ) ) {
				continue;
			}

			if ( ! class_exists( 'WC_Email' ) ) {
				\WC()->mailer();
			}
			do_action( EmailConstants::REWARD_EMAIL_ACTION, $reward, $comment, $coupon, $product, get_user_meta( $comment->user_id, 'billing_email', true ) );

			/*
			 * TODO: handle if email is not sent
			 */
			update_comment_meta( $comment->comment_ID, 'yayrev_waiting_review_reward_sent', true );
			break;
		}
	}

	public function add_reward_localize_data( $localize_data ) {
		$localize_data['sample_email_placeholders']['reward'] = ( new RewardPlaceholderProcessor() )->get_placeholders();
		$localize_data['wc_email_settings']['reward'] = [
			'default' => RewardEmail::get_default_email_settings(),
			'current' => get_option( 'woocommerce_yayrev_reward_settings', null ),
		];
		return $localize_data;
	}

	public function send_other_queue_email( $email_queue ) {

		if ( $email_queue->type !== 'reward' ) {
			return;
		}

		if ( ! $this->is_addon_enabled() ) {
			return;
		}

		if ( ! class_exists( 'WC_Email' ) ) {
			\WC()->mailer();
		}

		$email = new RewardEmail();
		$result = $email->send( $email_queue->customer_email, $email_queue->subject, $email_queue->body, $email->get_headers(), $email->get_attachments() );
		if ( $result ) {
			wp_send_json_success(
				array(
					'mess' => __( 'Email sent successfully', 'yay-reviews' ),
				)
			);
		} else {
			wp_send_json_error(
				array(
					'mess' => __( 'Email sending failed', 'yay-reviews' ),
				)
			);
		}
	}

	public function set_preview_email_class( $email_class, $email ) {

		if ( 'reward' !== $email ) {
			return $email_class;
		}

		if ( ! $this->is_addon_enabled() ) {
			return $email_class;
		}

		return 'YayReviews\Addons\Reward\RewardEmail';
	}

	public function register_email_classes( $email_classes ) {

		if ( ! $this->is_addon_enabled() ) {
			return $email_classes;
		}

		$email_classes['YayReviews\Addons\Reward\RewardEmail'] = new RewardEmail();
		return $email_classes;
	}

	public function register_email_actions( $actions ) {
		if ( ! $this->is_addon_enabled() ) {
			return $actions;
		}
		$actions[] = EmailConstants::REWARD_EMAIL_ACTION;
		return $actions;
	}

	public function add_placeholders( $placeholders, $email_type ) {

		if ( 'YayReviews\Addons\Reward\RewardEmail' !== $email_type  ) {
			return $placeholders;
		}

		if ( ! $this->is_addon_enabled() ) {
			return $placeholders;
		}

		$placeholders = ( new RewardPlaceholderProcessor() )->get_placeholders();

		return $placeholders;
	}

	public function update_woocommerce_email_settings( $saved_data ) {
		$email_settings = $saved_data['email'];
		if ( empty( $email_settings ) ) {
			return;
		}
		$reward_email   = get_option( 'woocommerce_yayrev_reward_settings', array() );
		$reward_email   = wp_parse_args( $email_settings['reward'], $reward_email );
		if ( ! empty( $reward_email ) ) {
			update_option( 'woocommerce_yayrev_reward_settings', $reward_email );
		}
	}

}