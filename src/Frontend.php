<?php
namespace YayRev;

use YayRev\Classes\Helpers;
use YayRev\Classes\View;
use YayRev\Models\SettingsModel;

class Frontend {

	use SingletonTrait;

	public function __construct() {
		add_filter( 'woocommerce_product_review_comment_form_args', array( $this, 'add_reviews_form' ), 100, 1 );
		add_action( 'comment_post', array( $this, 'save_custom_review_fields' ), 10 );
		add_action( 'woocommerce_review_meta', array( $this, 'add_custom_review_meta' ), 10 );
		add_action( 'woocommerce_review_after_comment_text', array( $this, 'review_after_comment_text' ), 10, 1 );
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_enqueue_scripts' ) );
		add_filter( 'comments_clauses', array( $this, 'filter_reviews_by_rating' ), 10, 2 );
		add_filter( 'comments_template', array( $this, 'before_reviews_section' ), PHP_INT_MAX, 2 );
	}

	public function add_reviews_form( $comment_form ) {

		$comment_form['comment_field'] .= View::load( 'frontend.review-form.review-title', array(), false );
		$comment_form['comment_field'] .= View::load( 'frontend.review-form.product-attributes', array(), false );

		$reviews_settings    = SettingsModel::get_settings( 'reviews' );
		$enable_media_upload = $reviews_settings['enable_media_upload'];
		$enable_gdpr_consent = $reviews_settings['enable_gdpr_consent'];
		if ( $enable_media_upload ) {
			$upload_media_data              = array(
				'require_media_upload' => $reviews_settings['require_media_upload'],
				'label'                => $reviews_settings['media_upload_label'],
				'description'          => $reviews_settings['media_upload_description'],
				'allowed_media_types'  => $reviews_settings['allowed_media_types'],
			);
			$comment_form['comment_field'] .= View::load( 'frontend.review-form.media', $upload_media_data, false );
		}

		if ( $enable_gdpr_consent ) {
			$gdpr_data                      = array(
				'pre_message'  => $reviews_settings['pre_gdpr_message'],
				'gdpr_message' => $reviews_settings['gdpr_consent_message'],
			);
			$comment_form['comment_field'] .= View::load( 'frontend.review-form.gdpr', $gdpr_data, false );
		}

		return $comment_form;
	}

	public function save_custom_review_fields( $comment_id ) {
		if ( ! isset( $_POST['yayrev_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['yayrev_nonce'] ) ), 'yayrev-nonce' ) ) {
			return;
		}
		$enable_media_upload = SettingsModel::get_settings( 'reviews.enable_media_upload' );
		if ( $enable_media_upload ) {
			if ( isset( $_FILES['yayrev_media'] ) && ! empty( $_FILES['yayrev_media'] ) ) {
				$files               = $_FILES['yayrev_media']; //phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
				$total_files         = count( $files['name'] );
				$max_upload_file_qty = SettingsModel::get_settings( 'reviews.max_upload_file_qty' );
				if ( ! empty( $max_upload_file_qty ) && $total_files > $max_upload_file_qty ) {
					return;
				}
				$max_upload_filesize = SettingsModel::get_settings( 'reviews.max_upload_filesize' ) * 1000;//converts to byte

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
					if ( $file['size'] > $max_upload_filesize ) {
						//file's to large
						continue;
					}
					if ( UPLOAD_ERR_OK === $file['error'] ) {
						// Upload the file to WordPress
						$movefile = wp_handle_upload( $file, array( 'test_form' => false ) );

						// Check for upload errors
						if ( isset( $upload['error'] ) ) {
							if ( defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
								error_log( "Failed to upload image: {$file['name']}. Error: " . $upload['error'] . "\n" ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
							}
							continue;
						}
						$uploads  = wp_upload_dir();
						$filename = basename( $movefile['url'] );
						$paths[]  = $uploads['subdir'] . "/$filename";
					}
				}
				add_comment_meta( $comment_id, 'yayrev_files', $paths );
			}
		}
		// save review title
		if ( isset( $_POST['yayrev_title'] ) ) {
			add_comment_meta( $comment_id, 'yayrev_title', sanitize_text_field( wp_unslash( $_POST['yayrev_title'] ) ) );
		}
		// save attribute values
		if ( isset( $_POST['yayrev_attributes'] ) ) {
			/* @codingStandardsIgnoreStart */
			$attributes = $_POST['yayrev_attributes'];
			/* @codingStandardsIgnoreEnd */
			// check attribute has value not empty
			$attributes_values = array();
			foreach ( $attributes as $attribute_name => $attribute_value ) {
				if ( ! empty( $attribute_value ) ) {
					$attributes_values[ $attribute_name ] = $attribute_value;
				}
			}
			add_comment_meta( $comment_id, 'yayrev_attributes', $attributes_values );
		}
	}

	public function review_after_comment_text( $comment ) {
		$media = get_comment_meta( $comment->comment_ID, 'yayrev_files', true );
		if ( is_array( $media ) && count( $media ) > 0 ) {
			Helpers::print_media_list( $media, $comment );
		}
	}

	public function add_custom_review_meta( $comment ) {
		global $comment;
		$attributes = get_comment_meta( $comment->comment_ID, 'yayrev_attributes', true );

		if ( ! is_array( $attributes ) || count( $attributes ) < 1 ) {
			return;
		}

		// print attributes
		echo '<p class="meta yayrev-attribute-list">';
		$index = 0;
		foreach ( $attributes as $attribute_name => $attribute_value ) {
			if ( ! empty( $attribute_value ) ) {
				if ( 0 !== $index ) {
					echo '<span class="yayrev-attribute-value-divider">|</span>';
				}
				echo '<span class="yayrev-attribute-value">' . esc_html( wc_attribute_label( $attribute_name ) ) . ': ' . esc_html( $attribute_value ) . '</span>';
				++$index;
			}
		}
		echo '</>';
	}

	public function frontend_enqueue_scripts() {
		if ( ! is_product() ) {
			return;
		}

		$reviews_settings     = SettingsModel::get_settings( 'reviews' );
		$allowed_media_types  = $reviews_settings['allowed_media_types'];
		$max_upload_files     = $reviews_settings['max_upload_files'];
		$max_upload_filesize  = intval( $reviews_settings['max_upload_filesize'] );
		$file_required_notice = sprintf(
			// translators: %s: media type (image or video, video, image)
			__( 'Please upload at least 1 %s.', 'yay-customer-reviews-woocommerce' ),
			'video_photo' === $allowed_media_types ?
					__( 'video or photo', 'yay-customer-reviews-woocommerce' ) :
				( 'only_video' === $allowed_media_types ?
					__( 'video', 'yay-customer-reviews-woocommerce' ) :
					__( 'photo', 'yay-customer-reviews-woocommerce' )
				)
		);
		wp_enqueue_script( 'yayrev-script', YAYREV_PLUGIN_URL . 'assets/frontend/js/yayrev.js', array( 'jquery' ), YAYREV_VERSION, true );
		wp_enqueue_script( 'yayrev-media-modal', YAYREV_PLUGIN_URL . 'assets/common/js/media-modal.js', array( 'jquery' ), YAYREV_VERSION, true );
		wp_enqueue_script( 'yayrev-tooltip', YAYREV_PLUGIN_URL . 'assets/common/js/tooltip.js', array( 'jquery' ), YAYREV_VERSION, true );
		wp_localize_script(
			'yayrev-script',
			'yayrev',
			array(
				'ajax_url'            => admin_url( 'admin-ajax.php' ),
				'nonce'               => wp_create_nonce( 'yayrev-nonce' ),
				'max_upload_files'    => $max_upload_files,
				'max_upload_filesize' => intval( $max_upload_filesize ),
				'texts'               => array(
					'verified_owner'                 => __( 'Verified owner', 'yay-customer-reviews-woocommerce' ),
					'gdpr_notice'                    => __( 'Please check GDPR checkbox.', 'yay-customer-reviews-woocommerce' ),
					'file_required_notice'           => $file_required_notice,
					// translators: %1$s: file name, %2$s: max allowed size
					'file_size_notice'               => __( 'The size of the file %1$s is too large; the maximum allowed size is %2$sKB.', 'yay-customer-reviews-woocommerce' ),
					// translators: %1$s: max allowed files
					'file_quantity_notice'           => __( 'You can only upload a maximum of %1$s files.', 'yay-customer-reviews-woocommerce' ),
					'review_title_max_length_notice' => __( 'The review title must be less than 60 characters.', 'yay-customer-reviews-woocommerce' ),
				),
			)
		);
		wp_enqueue_style( 'yayrev-style', YAYREV_PLUGIN_URL . 'assets/frontend/css/yayrev.css', array(), YAYREV_VERSION );
		wp_enqueue_style( 'yayrev-tooltip', YAYREV_PLUGIN_URL . 'assets/common/css/tooltip.css', array(), YAYREV_VERSION );
		wp_enqueue_style( 'yayrev-common-styles', YAYREV_PLUGIN_URL . 'assets/common/css/common-styles.css', array(), YAYREV_VERSION );
	}

	public function filter_reviews_by_rating( $clauses, $comment_query ) {
		if ( ! \is_product() ) {
			return $clauses;
		}

		$rating_filter = isset( $_GET['rating_filter'] ) ? intval( sanitize_text_field( wp_unslash( $_GET['rating_filter'] ) ) ) : null; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( $rating_filter > 0 ) {
			global $wpdb;
			if ( ! empty( $comment_query->query_vars['post_id'] ) ) {
				$clauses['join']  .= " LEFT JOIN {$wpdb->commentmeta} AS ratingmeta ON {$wpdb->comments}.comment_ID = ratingmeta.comment_id ";
				$clauses['where'] .= $wpdb->prepare( " AND ratingmeta.meta_key = 'rating' AND ratingmeta.meta_value = %d", $rating_filter );
			}
		}
		return $clauses;
	}

	public function before_reviews_section( $template ) {

		if ( get_post_type() !== 'product' ) {
			return $template;
		}

		global $render_before_reviews_check_point;

		if ( empty( $render_before_reviews_check_point ) ) {
			$render_before_reviews_check_point = true;
			return YAYREV_PLUGIN_PATH . 'views/frontend/before-reviews.php';
		}

		return $template;
	}
}
