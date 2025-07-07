<?php
namespace YayReviews;

use YayReviews\Classes\Helpers;
use YayReviews\Classes\View;
class Frontend {

	use SingletonTrait;

	public function __construct() {
		add_filter( 'woocommerce_product_review_comment_form_args', array( $this, 'add_reviews_form' ), 100, 1 );
		add_action( 'comment_post', array( $this, 'save_custom_review_fields' ) );
		add_action( 'woocommerce_review_meta', array( $this, 'add_custom_review_meta' ), 10 );
		add_action( 'woocommerce_review_after_comment_text', array( $this, 'review_after_comment_text' ), 10, 1 );
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_enqueue_scripts' ) );
		add_filter( 'comments_clauses', array( $this, 'filter_reviews_by_rating' ), 10, 2 );
		add_filter( 'comments_template', array( $this, 'before_reviews_section' ), PHP_INT_MAX, 2 );

		// WooCommerce Reviews for My Account
		add_filter( 'woocommerce_account_menu_items', array( $this, 'add_reviews_menu_item' ) );
		add_action( 'init', array( $this, 'add_reviews_endpoint' ) );
		add_action( 'woocommerce_account_reviews_endpoint', array( $this, 'render_reviews_endpoint' ) );
		add_filter( 'the_title', array( $this, 'change_reviews_endpoint_title' ), 10, 2 );

	}

	public function add_reviews_form( $comment_form ) {

		$comment_form['comment_field'] .= View::load( 'frontend.review-form.review-title', array(), false );
		$comment_form['comment_field'] .= View::load( 'frontend.review-form.product-attributes', array(), false );

		if ( Helpers::get_settings( 'reviews', 'upload_media', false ) ) {
			$upload_media_data              = array(
				'is_required'   => Helpers::get_settings( 'reviews', 'upload_required', false ),
				'label'         => Helpers::get_settings( 'reviews', 'upload_file_label', '' ),
				'description'   => Helpers::get_settings( 'reviews', 'upload_file_description', '' ),
				'media_type'    => Helpers::get_settings( 'reviews', 'media_type', 'video_image' ),
				'max_files_qty' => Helpers::get_settings( 'reviews', 'max_upload_file_qty', '' ),
				'max_file_size' => Helpers::get_settings( 'reviews', 'max_upload_file_size', Helpers::upload_max_size() ),
			);
			$comment_form['comment_field'] .= View::load( 'frontend.review-form.media', $upload_media_data, false );
		}

		if ( Helpers::get_settings( 'reviews', 'enable_gdpr', false ) ) {
			$gdpr_data                      = array(
				'before'         => Helpers::get_settings( 'reviews', 'before_message', '' ),
				'inline_message' => Helpers::get_settings( 'reviews', 'gdpr_message', '' ),
			);
			$comment_form['comment_field'] .= View::load( 'frontend.review-form.gdpr', $gdpr_data, false );
		}

		return $comment_form;
	}

	public function save_custom_review_fields( $comment_id ) {
		if ( ! isset( $_POST['yay_reviews_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['yay_reviews_nonce'] ) ), 'yay-reviews-nonce' ) ) {
			return;
		}
		$all_settings = Helpers::get_all_settings();
		if ( $all_settings['reviews']['upload_media'] ) {
			if ( isset( $_FILES['yay_reviews_media'] ) ) {
				$files               = $_FILES['yay_reviews_media']; //phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
				$total_files         = count( $files['name'] );
				$max_upload_file_qty = Helpers::get_settings( 'reviews', 'max_upload_file_qty', '' );
				if ( ! empty( $max_upload_file_qty ) && $total_files > $max_upload_file_qty ) {
					return;
				}
				$max_upload_size = $all_settings['reviews']['max_upload_file_size'] * 1000;//converts to byte

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
		// save review title
		if ( isset( $_POST['yay-reviews-title'] ) ) {
			add_comment_meta( $comment_id, 'yay_reviews_title', sanitize_text_field( wp_unslash( $_POST['yay-reviews-title'] ) ) );
		}
		// save attribute values
		if ( isset( $_POST['yay_reviews_attributes'] ) ) {
			$attributes = $_POST['yay_reviews_attributes']; //phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			// check attribute has value not empty
			$attributes_values = array();
			foreach ( $attributes as $attribute_name => $attribute_value ) {
				if ( ! empty( $attribute_value ) ) {
					$attributes_values[ $attribute_name ] = $attribute_value;
				}
			}
			add_comment_meta( $comment_id, 'yay_reviews_attributes', $attributes_values );
		}
		// Check and send reward email
		$reward_addon = $all_settings['addons']['reward'];
		$rewards      = $all_settings['rewards'];
		$comment      = get_comment( $comment_id );
		if ( ! $comment ) {
			return;
		}
		if ( $reward_addon && count( $rewards ) > 0 ) {
			// sort rewards by rating_requirement
			usort(
				$rewards,
				function ( $a, $b ) {
					// priority of 5_stars is 1, 4_stars is 2, at_least_4_stars is 3, at_least_3_stars is 4, none or any other is 5
					$rating_priority = array(
						'5_stars'          => 1,
						'4_stars'          => 2,
						'at_least_4_stars' => 3,
						'at_least_3_stars' => 4,
						'any'              => 5,
					);

					$media_priority = array(
						'at_least_2_media'  => 1,
						'at_least_2_images' => 2,
						'at_least_2_videos' => 3,
						'at_least_1_media'  => 4,
						'at_least_1_image'  => 5,
						'at_least_1_video'  => 6,
						'none'              => 7,
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
					if ( ! $reward['enabled'] || empty( $reward['coupon_id'] ) ) {
						continue;
					}
					$coupon_id    = $reward['coupon_id'];
					$coupon       = new \WC_Coupon( $coupon_id );
					$expired      = Helpers::is_coupon_expired( $coupon );
					$out_of_usage = $coupon->get_usage_limit() !== 0 && $coupon->get_usage_count() >= $coupon->get_usage_limit() ? true : false;
					if ( ! $expired && ! $out_of_usage && Helpers::is_valid_review_criteria( $comment, $reward ) ) {
						if ( ! class_exists( 'WC_Email' ) ) {
							WC()->mailer();
						}
						do_action( 'yay_reviews_reward_email_notification', $reward, $comment, $coupon, $product, isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : get_user_meta( $comment->user_id, 'billing_email', true ) ); //phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
						break;
					}
				}
			}
		}
	}

	public function review_after_comment_text( $comment ) {
		$media = get_comment_meta( $comment->comment_ID, 'yay_reviews_files', true );
		if ( is_array( $media ) && count( $media ) > 0 ) {
			Helpers::print_media_list( $media, $comment );
		}
	}

	public function add_custom_review_meta( $comment ) {
		global $comment;
		$attributes = get_comment_meta( $comment->comment_ID, 'yay_reviews_attributes', true );
		if ( is_array( $attributes ) && count( $attributes ) > 0 ) {
			// print attributes
			echo '<p class="meta yay-reviews-attribute-list">';
			$index = 0;
			foreach ( $attributes as $attribute_name => $attribute_value ) {
				if ( ! empty( $attribute_value ) ) {
					if ( 0 !== $index ) {
						echo '<span class="yay-reviews-attribute-value-divider">|</span>';
					}
					echo '<span class="yay-reviews-attribute-value">' . esc_html( wc_attribute_label( $attribute_name ) ) . ': ' . esc_html( $attribute_value ) . '</span>';
					++$index;
				}
			}
			echo '</p>';
		}
	}

	public function frontend_enqueue_scripts() {
		if ( ! is_product() ) {
			return;
		}

		$all_settings         = Helpers::get_all_settings();
		$media_type           = $all_settings['reviews']['media_type'];
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
		wp_enqueue_script( 'yay-reviews-tailwind', 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4', array( 'jquery' ), YAY_REVIEWS_VERSION, true );
		wp_enqueue_script( 'yay-reviews-script', YAY_REVIEWS_PLUGIN_URL . 'assets/frontend/js/yay-reviews.js', array( 'jquery' ), YAY_REVIEWS_VERSION, true );
		wp_enqueue_script( 'yay-reviews-media-modal', YAY_REVIEWS_PLUGIN_URL . 'assets/common/js/media-modal.js', array( 'jquery' ), YAY_REVIEWS_VERSION, true );
		wp_enqueue_script( 'yay-reviews-tooltip', YAY_REVIEWS_PLUGIN_URL . 'assets/common/js/tooltip.js', array( 'jquery' ), YAY_REVIEWS_VERSION, true );
		wp_localize_script(
			'yay-reviews-script',
			'yay_reviews',
			array(
				'ajax_url'                       => admin_url( 'admin-ajax.php' ),
				'nonce'                          => wp_create_nonce( 'yay-reviews-nonce' ),
				'max_upload_qty'                 => Helpers::get_settings( 'reviews', 'max_upload_file_qty', '' ),
				'max_upload_size'                => intval( Helpers::get_settings( 'reviews', 'max_upload_file_size', Helpers::upload_max_size() ) ),
				'gdpr_notice'                    => __( 'Please check GDPR checkbox.', 'yay-reviews' ),
				'file_required_notice'           => $file_required_notice,
				// translators: %1$s: file name, %2$s: max upload size
				'file_size_notice'               => __( 'The size of the file %1$s is too large; the maximum allowed size is %2$sKB.', 'yay-reviews' ),
				// translators: %1$s: max upload quantity
				'file_quantity_notice'           => sprintf( __( 'You can only upload a maximum of %1$s files.', 'yay-reviews' ), Helpers::get_settings( 'reviews', 'max_upload_file_qty', '' ) ),
				'review_title_max_length_notice' => __( 'The review title must be less than 60 characters.', 'yay-reviews' ),
				'verified_owner_text'            => __( 'Verified Owner', 'yay-reviews' ),
			)
		);
		wp_enqueue_style( 'yay-reviews-style', YAY_REVIEWS_PLUGIN_URL . 'assets/frontend/css/yay-reviews.css', array(), YAY_REVIEWS_VERSION );
		wp_enqueue_style( 'yay-reviews-tooltip', YAY_REVIEWS_PLUGIN_URL . 'assets/common/css/tooltip.css', array(), YAY_REVIEWS_VERSION );
		wp_enqueue_style( 'yay-reviews-common-styles', YAY_REVIEWS_PLUGIN_URL . 'assets/common/css/common-styles.css', array(), YAY_REVIEWS_VERSION );
	}

	public function filter_reviews_by_rating( $clauses, $comment_query ) {
		if ( ! is_product() ) {
			return $clauses;
		}

		if ( isset( $_GET['rating_filter'] ) && intval( $_GET['rating_filter'] ) > 0 ) {
			global $wpdb;
			$rating = intval( $_GET['rating_filter'] );
			if ( ! empty( $comment_query->query_vars['post_id'] ) ) {
				$clauses['join']  .= " LEFT JOIN {$wpdb->commentmeta} AS ratingmeta ON {$wpdb->comments}.comment_ID = ratingmeta.comment_id ";
				$clauses['where'] .= $wpdb->prepare( " AND ratingmeta.meta_key = 'rating' AND ratingmeta.meta_value = %d", $rating );
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
			return YAY_REVIEWS_PLUGIN_PATH . 'views/frontend/before-reviews.php';
		}

		return $template;
	}

	public function add_reviews_menu_item( $items ) {
		$items['reviews'] = __( 'Reviews', 'yay-reviews' );
		//change position of reviews menu item
		$items = array_slice( $items, 0, 3, true ) +
			array( 'reviews' => $items['reviews'] ) +
			array_slice( $items, 3, null, true );
		return $items;
	}

	public function add_reviews_endpoint() {
		add_rewrite_endpoint( 'reviews', EP_PAGES );
	}

	public function change_reviews_endpoint_title( $title ) {
		if ( is_account_page() && get_query_var( 'reviews', false ) !== false ) {
			$title = __( 'My Reviews', 'yay-reviews' );
		}
		return $title;
	}

	public function render_reviews_endpoint() {
		echo 'Content here';
	}
}
