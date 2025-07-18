<?php

namespace YayRev\Admin;

use YayRev\Classes\Helpers;
use YayRev\SingletonTrait;

class SingleReviewPage {

	use SingletonTrait;

	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ), 30 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	private function is_single_review_page() {
		$screen    = \get_current_screen();
		$screen_id = $screen ? $screen->id : '';
		return 'comment' === $screen_id && isset( $_GET['c'] ) && metadata_exists( 'comment', sanitize_text_field( wp_unslash( $_GET['c'] ) ), 'rating' ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}

	public function add_meta_boxes() {
		if ( ! $this->is_single_review_page() ) {
			return;
		}

		add_meta_box( 'woocommerce-rating-yayrev-title', __( 'Title', 'yay-customer-reviews-woocommerce' ), array( $this, 'reviews_title_metabox_callback' ), 'comment', 'normal', 'high' );
		add_meta_box( 'woocommerce-rating-yayrev', __( 'Media', 'yay-customer-reviews-woocommerce' ), array( $this, 'reviews_metabox_callback' ), 'comment', 'normal', 'high' );
	}

	public function reviews_metabox_callback( $comment ) {
		$media = get_comment_meta( $comment->comment_ID, 'yayrev_files', true );
		if ( is_array( $media ) ) {
			Helpers::print_media_list( $media, $comment );
		}
	}

	public function reviews_title_metabox_callback( $comment ) {
		$title = get_comment_meta( $comment->comment_ID, 'yayrev_title', true );
		if ( $title ) {
			echo '<p class="meta yayrev-title">' . esc_html( $title ) . '</p>';
		}
	}

	public function admin_enqueue_scripts() {
		if ( ! $this->is_single_review_page() ) {
			return;
		}

		wp_enqueue_script( 'yayrev-media-modal', YAYREV_PLUGIN_URL . 'assets/common/js/media-modal.js', array( 'jquery' ), YAYREV_VERSION, true );
		wp_enqueue_style( 'yayrev-tooltip', YAYREV_PLUGIN_URL . 'assets/common/css/tooltip.css', array(), YAYREV_VERSION );
		wp_enqueue_script( 'yayrev-tooltip', YAYREV_PLUGIN_URL . 'assets/common/js/tooltip.js', array( 'jquery' ), YAYREV_VERSION, true );
		wp_enqueue_style( 'yayrev-common-styles', YAYREV_PLUGIN_URL . 'assets/common/css/common-styles.css', array(), YAYREV_VERSION );
	}
}
