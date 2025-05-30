<?php
namespace YayReviews;

use YayReviews\Classes\Helpers;
use YayReviews\Classes\View;
class Frontend {
	public function __construct() {
		add_filter( 'woocommerce_product_review_comment_form_args', array( $this, 'add_reviews_form' ) );
		add_action( 'comment_post', array( $this, 'save_custom_review_fields' ) );
		add_action( 'woocommerce_review_after_comment_text', array( $this, 'review_after_comment_text' ), 10, 1 );
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_enqueue_scripts' ) );
	}

	public function add_reviews_form( $comment_form ) {
		$data = array(
			'upload_media'    => Helpers::get_settings( 'reviews', 'upload_media', false ),
			'upload_required' => Helpers::get_settings( 'reviews', 'upload_required', false ),
			'label'           => Helpers::get_settings( 'reviews', 'upload_file_label', '' ),
			'description'     => Helpers::get_settings( 'reviews', 'upload_file_description', '' ),
			'media_type'      => Helpers::get_settings( 'reviews', 'media_type', 'video_image' ),
			'max_files_qty'   => Helpers::get_settings( 'reviews', 'max_upload_file_qty', Helpers::upload_max_qty() ),
			'max_file_size'   => Helpers::get_settings( 'reviews', 'max_upload_file_size', Helpers::upload_max_size() ),
			'enable_gdpr'     => Helpers::get_settings( 'reviews', 'enable_gdpr', false ),
			'gdpr_message'    => Helpers::get_settings( 'reviews', 'gdpr_message', '' ),
			'before'          => Helpers::get_settings( 'reviews', 'before_message', '' ),
			'after'           => Helpers::get_settings( 'reviews', 'after_message', '' ),

		);
		$comment_form['comment_field'] .= View::load( 'frontend.reviews-form', $data, false );
		return $comment_form;
	}

	public function save_custom_review_fields( $comment_id ) {
		if ( Helpers::get_settings( 'reviews', 'upload_media', false ) ) {
			if ( isset( $_FILES['yay_reviews_media'] ) && isset( $_POST['yay_reviews_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['yay_reviews_nonce'] ) ), 'yay-reviews-nonce' ) ) {
				$files       = $_FILES['yay_reviews_media']; //phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
				$total_files = count( $files['name'] );
				if ( $total_files > Helpers::get_settings( 'reviews', 'max_upload_file_qty', Helpers::upload_max_qty() ) ) {
					return;
				}
				$max_upload_size = Helpers::get_settings( 'reviews', 'max_upload_file_size', Helpers::upload_max_size() ) * 1000;//converts to byte

				include_once ABSPATH . 'wp-admin/includes/image.php';
				include_once ABSPATH . 'wp-admin/includes/file.php';
				include_once ABSPATH . 'wp-admin/includes/media.php';

				$paths = array();
				for ( $i = 0; $i < $total_files; $i++ ) {
					// Get file information
					$file = array(
						'name'     => $files['name'][ $i ],
						'type'     => $files['type'][ $i ],
						'tmp_name' => $files['tmp_name'][ $i ],
						'error'    => $files['error'][ $i ],
						'size'     => $files['size'][ $i ],
					);
					if ( $file['size'] > $max_upload_size ) {
						//file's to large
						continue;
					}
					if ( UPLOAD_ERR_OK === $file['error'] ) {
						// Upload the file to WordPress
						$movefile = wp_handle_upload( $file, array( 'test_form' => false ) );

						// Check for upload errors
						if ( isset( $upload['error'] ) ) {
							error_log( "Failed to upload image: {$file['name']}. Error: " . $upload['error'] . "\n" );
							continue;
						}
						$uploads  = wp_upload_dir();
						$filename = basename( $movefile['url'] );
						$paths[]  = $uploads['subdir'] . "/$filename";
					}
				}
				add_comment_meta( $comment_id, 'yay_reviews_files', $paths );
			}
		}
	}
	public function review_after_comment_text( $comment ) {
		$media = get_comment_meta( $comment->comment_ID, 'yay_reviews_files', true );
		if ( is_array( $media ) && count( $media ) > 0 ) {
			Helpers::print_media( $media );
		}
	}

	public function frontend_enqueue_scripts() {
		if ( ! is_product() ) {
			return;
		}

		$media_type           = Helpers::get_settings( 'reviews', 'media_type', 'video_image' );
		$file_required_notice = sprintf(
			// translators: %s: media type (image or video, video, image)
			__( 'Please upload at least 1 %s.', 'yay-reviews' ),
			'video_image' === $media_type ?
					__( 'image or video', 'yay-reviews' ) :
				( 'only_video' === $media_type ?
					__( 'video', 'yay-reviews' ) :
					__( 'image', 'yay-reviews' )
				)
		);

		wp_enqueue_script( 'yay-reviews-tailwind', 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4', array( 'jquery' ), null, true );
		wp_enqueue_script( 'yay-reviews-script', YAY_REVIEWS_PLUGIN_URL . '/assets/frontend/js/yay-reviews.js', array( 'jquery' ), null, true );
		wp_enqueue_script( 'yay-reviews-media-modal', YAY_REVIEWS_PLUGIN_URL . '/assets/frontend/js/media-modal.js', array( 'jquery' ), null, true );
		wp_localize_script(
			'yay-reviews-script',
			'yay_reviews',
			array(
				'ajax_url'             => admin_url( 'admin-ajax.php' ),
				'nonce'                => wp_create_nonce( 'yay-reviews-nonce' ),
				'max_upload_qty'       => intval( Helpers::get_settings( 'reviews', 'max_upload_file_qty', Helpers::upload_max_qty() ) ),
				'max_upload_size'      => intval( Helpers::get_settings( 'reviews', 'max_upload_file_size', Helpers::upload_max_size() ) ),
				'gdpr_notice'          => __( 'Please check GDPR checkbox.', 'yay-reviews' ),
				'file_required_notice' => $file_required_notice,
				// translators: %1$s: file name, %2$s: max upload size
				'file_size_notice'     => __( 'The size of the file %1$s is too large; the maximum allowed size is %2$sKB.', 'yay-reviews' ),
				// translators: %1$s: max upload quantity
				'file_quantity_notice' => sprintf( __( 'You can only upload a maximum of %1$s files.', 'yay-reviews' ), Helpers::get_settings( 'reviews', 'max_upload_file_qty', Helpers::upload_max_qty() ) ),
			)
		);
		wp_enqueue_style( 'yay-reviews-style', YAY_REVIEWS_PLUGIN_URL . '/assets/frontend/css/yay-reviews.css', array(), '1.0' );
		wp_enqueue_style( 'yay-reviews-media-modal', YAY_REVIEWS_PLUGIN_URL . '/assets/frontend/css/media-modal.css', array(), '1.0' );
	}
}
