<?php

namespace YayReviews;

use YayReviews\Classes\Helpers;
use YayReviews\Register\ScriptName;

class Admin {

	use SingletonTrait;

	public function __construct() {
		new AdminMenu();

		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ), 30 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_filter( 'comment_text', array( $this, 'comment_text' ), 10, 2 );
	}

	public function add_meta_boxes() {
		$screen    = get_current_screen();
		$screen_id = $screen ? $screen->id : '';

		if ( 'comment' === $screen_id && isset( $_GET['c'] ) && metadata_exists( 'comment', wc_clean( wp_unslash( $_GET['c'] ) ), 'rating' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			add_meta_box( 'woocommerce-rating-yay-reviews-title', __( 'Title', 'yayreviews' ), array( $this, 'reviews_title_metabox_callback' ), 'comment', 'normal', 'high' );
			add_meta_box( 'woocommerce-rating-yay-reviews', __( 'Media', 'yayreviews' ), array( $this, 'reviews_metabox_callback' ), 'comment', 'normal', 'high' );
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

			$default_settings = Helpers::add_default_settings( array() );

			wp_localize_script(
				ScriptName::PAGE_SETTINGS,
				'yayReviews',
				array(
					'nonce'                   => wp_create_nonce( 'yay_reviews_nonce' ),
					'rest_nonce'              => wp_create_nonce( 'wp_rest' ),
					'rest_url'                => esc_url_raw( rest_url() ),
					'ajax_url'                => admin_url( 'admin-ajax.php' ),
					'rest_base'               => YAY_REVIEWS_REST_URL,
					'image_url'               => YAY_REVIEWS_PLUGIN_URL . 'assets/admin/images',
					'currency_symbol'         => get_woocommerce_currency_symbol(),
					'wc_reviews_settings'     => Helpers::get_wc_reviews_settings(),
					'wc_settings_url'         => admin_url( 'admin.php?page=wc-settings&tab=products' ),
					'site_title'              => get_bloginfo( 'name' ),
					'upload_max_filesize'     => Helpers::upload_max_filesize(),
					'admin_email'             => get_option( 'admin_email' ),
					'data_settings'           => Helpers::get_all_settings(),
					'sample_values'           => array(
						'{customer_name}'   => 'John Doe',
						'{site_title}'      => get_bloginfo( 'name' ),
						'{coupon_code}'     => 'YAYREVIEW10',
						'{product_name}'    => 'Sample Product',
						'{review_products}' => Helpers::get_review_products( 'sample' ),
					),
					'wc_email_settings'       => Helpers::get_wc_email_settings(),
					'default_email_templates' => $default_settings['email'],
					'coupons'                 => Helpers::get_coupons(),
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
}
