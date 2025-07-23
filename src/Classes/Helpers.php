<?php
namespace YayRev\Classes;

class Helpers {

	public static function print_media_list( $files, $comment ) {
		echo wc_get_template_html( //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			'frontend/media-list.php',
			array(
				'files'   => $files,
				'comment' => $comment,
			),
			'',
			YAYREV_PLUGIN_PATH . 'views/'
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

	/**
	 * Get overview data
	 *
	 * @return array Overview data
	 */
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
		$reviews = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->comments} 
				WHERE comment_post_ID = %d 
				AND comment_type = 'review' 
				AND comment_approved = '1'",
				$product_id
			)
		);

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

	/**
	 * Get WooCommerce reviews settings
	 *
	 * @return array Reviews settings
	 */
	public static function get_wc_reviews_settings() {
		return array(
			'reviews_enabled'        => \wc_reviews_enabled(),
			'verification_label'     => 'yes' === get_option( 'woocommerce_review_rating_verification_label' ),
			'verification_required'  => 'yes' === get_option( 'woocommerce_review_rating_verification_required' ),
			'enable_review_rating'   => 'yes' === get_option( 'woocommerce_enable_review_rating' ),
			'review_rating_required' => 'yes' === get_option( 'woocommerce_review_rating_required' ),
		);
	}

	public static function is_reminder_sent( $order_id ) {
		return 'sent' === get_post_meta( $order_id, '_yayrev_reminder_email_scheduled_sent', true );
	}

	public static function update_order_reminder_status( $order_id, $status ) {
		update_post_meta( $order_id, '_yayrev_reminder_email_scheduled_sent', $status );
	}

}
