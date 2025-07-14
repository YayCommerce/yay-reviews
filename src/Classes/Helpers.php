<?php
namespace YayReviews\Classes;

use Automattic\WooCommerce\Enums\ProductType;

class Helpers {

	public static function print_media_list( $files, $comment ) {
		echo wc_get_template_html( //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			'frontend/media-list.php',
			array(
				'files'   => $files,
				'comment' => $comment,
			),
			'',
			YAY_REVIEWS_PLUGIN_PATH . 'views/'
		);
	}

	public static function wp_parse_args_recursive( &$args, $defaults ) {
		$args   = (array) $args;
		$result = $defaults;

		foreach ( $args as $key => $value ) {
			if ( is_array( $value ) && isset( $result[ $key ] ) && is_array( $result[ $key ] ) ) {
				// If both $args and $defaults have an array at this key, merge them recursively
				$result[ $key ] = self::wp_parse_args_recursive( $value, $result[ $key ] );
			} else {
				// Otherwise, overwrite or add the value
				$result[ $key ] = $value;
			}
		}

		return $result;
	}

	public static function upload_max_filesize() {
		return wc_let_to_num( ini_get( 'upload_max_filesize' ) ) / 1024;
	}

	public static function is_coupon_expired( $coupon ) {
		$expiry_date = $coupon->get_date_expires();

		if ( ! $expiry_date ) {
			return false; // No expiry date set, so not expired
		}

		return time() > $expiry_date->getTimestamp();
	}

	public static function get_user_orders_total( $user_id ) {
		// Use other args to filter more
		$args = array(
			'customer_id' => $user_id,
			'limit'       => -1, // to get _all_ orders from this user
		);
		// call WC API
		$orders = wc_get_orders( $args );

		if ( empty( $orders ) || ! is_array( $orders ) ) {
			return 0;
		}

		return count( $orders );
	}

	public static function get_wc_email_settings() {
		// Load colors.
		$bg          = get_option( 'woocommerce_email_background_color' );
		$body        = get_option( 'woocommerce_email_body_background_color' );
		$base        = get_option( 'woocommerce_email_base_color' );
		$text        = get_option( 'woocommerce_email_text_color' );
		$footer_text = get_option( 'woocommerce_email_footer_text_color' );

		return array(
			'bg'          => $bg,
			'body'        => $body,
			'base'        => $base,
			'text'        => $text,
			'footer_text' => $footer_text,
		);
	}

	public static function get_overview_data() {
		global $post;
		// check if post is a product
		if ( ! $post || 'product' !== $post->post_type ) {
			return array();
		}

		$product_id = $post->ID;

		$average_rating = get_post_meta( $product_id, '_wc_average_rating', true );
		$total_reviews  = get_post_meta( $product_id, '_wc_review_count', true );

		global $wpdb;
		$sql     = "SELECT * FROM {$wpdb->comments} WHERE comment_post_ID = %d AND comment_type = 'review' AND comment_approved = '1'";
		$reviews = $wpdb->get_results( $wpdb->prepare( $sql, $product_id ) );

		// count 1->5 stars
		$stars_count = array();
		for ( $i = 1; $i <= 5; $i++ ) {
			$stars_count[ $i ] = count(
				array_filter(
					$reviews,
					function ( $comment ) use ( $i ) {
						$rating = (float) get_comment_meta( $comment->comment_ID, 'rating', true );
						return abs( $rating - $i ) < 0.01; // Use tolerance for floating point comparison
					}
				)
			);
		}

		return array(
			'total_reviews'  => $total_reviews,
			'average_rating' => $average_rating,
			'stars_count'    => $stars_count,
		);
	}

	public static function get_coupons() {
		$args = array(
			'post_type'      => 'shop_coupon',
			'posts_per_page' => -1,
			's'              => '',
			'post_status'    => 'publish',
		);

		$query = new \WP_Query( $args );

		$coupons = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$coupon = new \WC_Coupon( get_the_ID() );
				if ( ! empty( $coupon->get_code() ) ) {
					$coupons[] = array(
						'id'           => (string) $coupon->get_id(),
						'code'         => $coupon->get_code(),
						'expired'      => self::is_coupon_expired( $coupon ),
						'out_of_usage' => $coupon->get_usage_limit() !== 0 && $coupon->get_usage_count() >= $coupon->get_usage_limit() ? true : false,
						'edit_url'     => get_edit_post_link( $coupon->get_id(), 'edit' ),
						'amount'       => $coupon->get_amount(),
						'type'         => $coupon->get_discount_type(),
					);
				}
			}
		}
		wp_reset_postdata();

		return $coupons;
	}

	public static function modify_email_queue( $is_insert = false, $data = array() ) {
		global $wpdb;
		if ( $is_insert ) {
			$wpdb->insert(
				$wpdb->prefix . 'yay_reviews_email_queue',
				$data
			);
			if ( ! empty( $wpdb->insert_id ) ) {
				return $wpdb->insert_id;
			}
		} else {
			$id = $data['id'];
			unset( $data['id'] );
			$wpdb->update(
				$wpdb->prefix . 'yay_reviews_email_queue',
				$data,
				array( 'id' => $id )
			);
			return $wpdb->last_error;
		}
		return false;
	}

	public static function get_wc_reviews_settings() {
		return array(
			'reviews_enabled'        => wc_reviews_enabled(),
			'verification_label'     => 'yes' === get_option( 'woocommerce_review_rating_verification_label' ),
			'verification_required'  => 'yes' === get_option( 'woocommerce_review_rating_verification_required' ),
			'enable_review_rating'   => 'yes' === get_option( 'woocommerce_enable_review_rating' ),
			'review_rating_required' => 'yes' === get_option( 'woocommerce_review_rating_required' ),
		);
	}

	public static function meta_query_rating_and_media( $rating_requirement, $media_requirement ) {
		$meta_query = array();
		if ( 'any' !== $rating_requirement ) {
			$meta_query[] = array(
				'key'     => 'rating',
				'value'   => 5,
				'compare' => '5_stars' === $rating_requirement ? '=' : '<',
			);
		}
		if ( 'none' !== $media_requirement ) {
			$meta_query[] = array(
				'key'     => 'yay_reviews_files',
				'value'   => '',
				'compare' => '!=',
			);
		}
		if ( empty( $meta_query ) ) {
			return null;
		}
		return $meta_query;
	}

	/**
	 * Generate a unique coupon code similar to WooCommerce's pattern
	 *
	 * @param int    $length Length of the random part (default: 8)
	 * @param int    $max_attempts Maximum attempts to find a unique code (default: 100)
	 * @return string|false Generated coupon code or false if unable to generate unique code
	 */
	public static function generate_unique_coupon_code( $length = 8, $max_attempts = 100 ) {
		global $wpdb;

		// Ensure length is reasonable
		$length = max( 4, min( 20, intval( $length ) ) );

		$attempts = 0;

		while ( $attempts < $max_attempts ) {
			// Generate random string using WooCommerce's pattern (uppercase letters and numbers)
			$coupon_code = '';
			$characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
			$char_length = strlen( $characters );

			for ( $i = 0; $i < $length; $i++ ) {
				$coupon_code .= $characters[ wp_rand( 0, $char_length - 1 ) ];
			}

			// Check if this coupon code already exists
			$existing_coupon = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT post_title FROM {$wpdb->posts} 
					WHERE post_type = 'shop_coupon' 
					AND post_title = %s 
					AND post_status = 'publish'",
					$coupon_code
				)
			);

			if ( ! $existing_coupon ) {
				return $coupon_code;
			}

			++$attempts;
		}

		// If we couldn't generate a unique code after max attempts, return false
		return false;
	}
}
