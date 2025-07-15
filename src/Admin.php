<?php

namespace YayReviews;

use YayReviews\Classes\Helpers;
use YayReviews\Emails\PlaceholderProcessors\ReminderPlaceholderProcessor;
use YayReviews\Emails\PlaceholderProcessors\RewardPlaceholderProcessor;
use YayReviews\Models\SettingsModel;
use YayReviews\Register\ScriptName;
use YayReviews\Classes\Reward;

class Admin {

	use SingletonTrait;

	public function __construct() {
		new AdminMenu();

		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ), 30 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_filter( 'comment_text', array( $this, 'comment_text' ), 10, 2 );
		add_action( 'comment_approved_review', array( $this, 'wc_review_approved' ), 10, 2 );
	}

	public function add_meta_boxes() {
		$screen    = get_current_screen();
		$screen_id = $screen ? $screen->id : '';

		if ( 'comment' === $screen_id && isset( $_GET['c'] ) && metadata_exists( 'comment', sanitize_text_field( wp_unslash( $_GET['c'] ) ), 'rating' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			add_meta_box( 'woocommerce-rating-yay-reviews-title', __( 'Title', 'yay-reviews' ), array( $this, 'reviews_title_metabox_callback' ), 'comment', 'normal', 'high' );
			add_meta_box( 'woocommerce-rating-yay-reviews', __( 'Media', 'yay-reviews' ), array( $this, 'reviews_metabox_callback' ), 'comment', 'normal', 'high' );
		}
	}

	public function reviews_metabox_callback( $comment ) {
		$media = get_comment_meta( $comment->comment_ID, 'yay_reviews_files', true );
		if ( is_array( $media ) ) {
			Helpers::print_media_list( $media, $comment );
		}
	}

	public function admin_enqueue_scripts() {
		$screen    = get_current_screen();
		$screen_id = $screen ? $screen->id : '';

		if ( 'yaycommerce_page_yay-reviews' === $screen_id ) {

			wp_enqueue_script( ScriptName::PAGE_SETTINGS );
			wp_enqueue_editor();

			wp_localize_script(
				ScriptName::PAGE_SETTINGS,
				'yayReviews',
				array(
					'nonce'                     => wp_create_nonce( 'yay_reviews_nonce' ),
					'rest_nonce'                => wp_create_nonce( 'wp_rest' ),
					'rest_url'                  => esc_url_raw( rest_url() ),
					'ajax_url'                  => admin_url( 'admin-ajax.php' ),
					'rest_base'                 => YAY_REVIEWS_REST_URL,
					'image_url'                 => YAY_REVIEWS_PLUGIN_URL . 'assets/admin/images',
					'currency_symbol'           => get_woocommerce_currency_symbol(),
					'wc_reviews_settings'       => Helpers::get_wc_reviews_settings(),
					'wc_settings_url'           => admin_url( 'admin.php?page=wc-settings&tab=products' ),
					'site_title'                => get_bloginfo( 'name' ),
					'upload_max_filesize'       => Helpers::upload_max_filesize(),
					'admin_email'               => get_option( 'admin_email' ),
					'data_settings'             => SettingsModel::get_all_settings(),
					'sample_email_placeholders' => array(
						'reminder' => ( new ReminderPlaceholderProcessor() )->get_placeholders(),
						'reward'   => ( new RewardPlaceholderProcessor() )->get_placeholders(),
					),
					'wc_email_settings'         => Helpers::get_wc_email_settings(),
					'coupons'                   => Helpers::get_coupons(),
				)
			);

			wp_enqueue_style( ScriptName::STYLE_SETTINGS );

		}

		if ( 'comment' === $screen_id ) {
			wp_enqueue_script( 'yay-reviews-media-modal', YAY_REVIEWS_PLUGIN_URL . 'assets/common/js/media-modal.js', array( 'jquery' ), YAY_REVIEWS_VERSION, true );
			wp_enqueue_style( 'yay-reviews-tooltip', YAY_REVIEWS_PLUGIN_URL . 'assets/common/css/tooltip.css', array(), YAY_REVIEWS_VERSION );
			wp_enqueue_script( 'yay-reviews-tooltip', YAY_REVIEWS_PLUGIN_URL . 'assets/common/js/tooltip.js', array( 'jquery' ), YAY_REVIEWS_VERSION, true );
			wp_enqueue_style( 'yay-reviews-common-styles', YAY_REVIEWS_PLUGIN_URL . 'assets/common/css/common-styles.css', array(), YAY_REVIEWS_VERSION );
		}
	}

	public function comment_text( $comment_text, $comment ) {
		$title = get_comment_meta( $comment->comment_ID, 'yay_reviews_title', true );
		if ( $title ) {
			$comment_text = '<p class="meta yay-reviews-title"><strong>' . esc_html( $title ) . '</strong></p>' . $comment_text;
		}
		return $comment_text;
	}

	public function reviews_title_metabox_callback( $comment ) {
		$title = get_comment_meta( $comment->comment_ID, 'yay_reviews_title', true );
		if ( $title ) {
			echo '<p class="meta yay-reviews-title">' . esc_html( $title ) . '</p>';
		}
	}

	public function wc_review_approved( $comment_id, $comment ) {
		if ( ! $comment ) {
			return;
		}
		$waiting_review_reward_sent = get_comment_meta( $comment->comment_ID, 'yay_reviews_waiting_review_reward_sent', true );
		if ( $waiting_review_reward_sent ) {
			return; // if the reward is already sent, return
		}

		$rewards        = SettingsModel::get_settings( 'rewards', array() );
		$reward_enabled = SettingsModel::get_settings( 'addons.reward_enabled', false );
		if ( $reward_enabled && count( $rewards ) > 0 ) {
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

			$product_id = $comment->comment_post_ID;
			$product    = wc_get_product( $product_id );
			if ( $product ) {
				foreach ( $rewards as $reward ) {
					$reward_obj = new Reward( $reward );

					$coupon = $reward_obj->generate_coupon( $comment );

					if ( ! empty( $coupon ) ) {

						if ( ! class_exists( 'WC_Email' ) ) {
							WC()->mailer();
						}
						do_action( 'yay_reviews_reward_email_notification', $reward, $comment, $coupon, $product, get_user_meta( $comment->user_id, 'billing_email', true ) );
						update_comment_meta( $comment->comment_ID, 'yay_reviews_waiting_review_reward_sent', true );
						break;
					}
				}
			}
		}
	}
}
