<?php

namespace YayReviews;

use YayReviews\Classes\Helpers;
use YayReviews\Register\ScriptName;

class Admin {

	public function __construct() {
		new AdminMenu();

		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ), 30 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	public function add_meta_boxes() {
		$screen    = get_current_screen();
		$screen_id = $screen ? $screen->id : '';

		if ( 'comment' === $screen_id && isset( $_GET['c'] ) && metadata_exists( 'comment', wc_clean( wp_unslash( $_GET['c'] ) ), 'rating' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			add_meta_box( 'woocommerce-rating-yay-reviews', __( 'Media', 'yayreviews' ), array( $this, 'reviews_metabox_callback' ), 'comment', 'normal', 'high' );
		}
	}
	public function reviews_metabox_callback( $comment ) {
		$media = get_comment_meta( $comment->comment_ID, 'yay_reviews_files', true );
		if ( is_array( $media ) ) {
			Helpers::print_media( $media, $comment );
		}
	}

	public function admin_enqueue_scripts( $hook ) {
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
					'site_title'              => get_bloginfo( 'name' ),
					'upload_max_size'         => Helpers::upload_max_size(),
					'upload_max_qty'          => Helpers::upload_max_qty(),
					'admin_email'             => get_option( 'admin_email' ),
					'data_settings'           => Helpers::get_all_settings(),
					'sample_values'           => array(
						'{customer_name}'  => 'John Doe',
						'{site_title}'     => get_bloginfo( 'name' ),
						'{coupon_code}'    => 'YAYREVIEW10',
						'{product_name}'   => 'Sample Product',
						'{products_table}' => Helpers::get_products_table( 'sample' ),
					),
					'wc_email_settings'       => Helpers::get_wc_email_settings(),
					'coupon_types'            => wc_get_coupon_types(),
					'product_categories'      => Helpers::get_product_categories(),
					'product_brands'          => Helpers::get_product_brands(),
					'default_email_templates' => $default_settings['email'],
				)
			);

			wp_enqueue_style( ScriptName::STYLE_SETTINGS );

		}

		if ( 'comment' === $screen_id ) {
			wp_enqueue_script( 'yay-reviews-media-modal', YAY_REVIEWS_PLUGIN_URL . '/assets/common/js/media-modal.js', array( 'jquery' ), null, true );
			wp_enqueue_style( 'yay-reviews-media-modal', YAY_REVIEWS_PLUGIN_URL . '/assets/common/css/media-modal.css', array(), '1.0' );
			wp_enqueue_script( 'yay-reviews-tailwind', 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4', array( 'jquery' ), null, true );
		}
	}
}
