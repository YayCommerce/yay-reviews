<?php

namespace YayReviews\Models;

class CouponModel {
	/**
	 * Get coupons
	 *
	 * @return array Coupons data
	 */
	public static function get_coupons() {
		$args = array(
			'post_type'      => 'shop_coupon',
			'posts_per_page' => -1,
			's'              => '',
			'post_status'    => 'publish',
			'meta_query'     => array(
				'relation' => 'OR',
				array(
					'key'     => 'yayrev_one_time_coupon',
					'value'   => 'yes',
					'compare' => '!=',
				),
				array(
					'key'     => 'yayrev_one_time_coupon',
					'value'   => '',
					'compare' => 'NOT EXISTS',
				),
			),
		);

		$query = new \WP_Query( $args );

		$coupons = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$coupon = new \WC_Coupon( get_the_ID() );
				if ( ! empty( $coupon->get_code() ) ) {
					$coupons[] = self::get_coupon_data( $coupon );
				}
			}
		}
		wp_reset_postdata();

		return $coupons;
	}

	/**
	 * Get coupon data
	 *
	 * @param \WC_Coupon $coupon Coupon object
	 * @return array Coupon data
	 */
	public static function get_coupon_data( $coupon ) {

		if ( ! $coupon instanceof \WC_Coupon ) {
			return array();
		}

		return array(
			'id'           => (string) $coupon->get_id(),
			'code'         => $coupon->get_code(),
			'expired'      => self::is_coupon_expired( $coupon ),
			'out_of_usage' => $coupon->get_usage_limit() !== 0 && $coupon->get_usage_count() >= $coupon->get_usage_limit() ? true : false,
			'edit_url'     => get_edit_post_link( $coupon->get_id(), 'edit' ),
			'amount'       => $coupon->get_amount(),
			'type'         => $coupon->get_discount_type(),
		);
	}

	/**
	 * Check if coupon is expired
	 *
	 * @param \WC_Coupon $coupon Coupon object
	 * @return bool True if coupon is expired, false otherwise
	 */
	public static function is_coupon_expired( $coupon ) {

		if ( ! ( $coupon instanceof \WC_Coupon ) ) {
			return true;
		}

		$expiry_date = $coupon->get_date_expires();

		if ( ! $expiry_date ) {
			return false; // No expiry date set, so not expired
		}

		return time() > $expiry_date->getTimestamp();
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
			$existing_coupon = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
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