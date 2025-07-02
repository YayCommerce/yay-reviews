<?php
namespace YayReviews\Classes;

use YayReviews\Classes\Products;
use Automattic\WooCommerce\Enums\ProductType;

class Helpers {
	public static function get_all_settings() {
		$settings = get_option( 'yay_reviews_settings', array() );
		if ( empty( $settings ) ) {
			$settings = self::add_default_settings( $settings );
		}
		return $settings;
	}

	public static function get_settings( $key1, $key2 = null, $default = '' ) {
		$settings = self::get_all_settings();
		$val      = isset( $settings[ $key1 ] ) ? $settings[ $key1 ] : $default;
		if ( ! is_null( $key2 ) && is_array( $val ) && isset( $val[ $key2 ] ) ) {
			$val = $val[ $key2 ];
		}
		return $val;
	}

	public static function update_settings( $settings ) {
		update_option( 'yay_reviews_settings', $settings, false );
		return $settings;
	}

	public static function print_media_list( $files, $comment, $echo = true ) {
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

	public static function add_default_settings( $settings ) {
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		$settings = self::wp_parse_args_recursive(
			$settings,
			array(
				'addons'          => array(
					'reminder'        => false,
					'reward'          => false,
					'optional_fields' => false,
					'overview'        => false,
				),
				'reviews'         => array(
					'upload_media'            => true,
					'upload_required'         => false,
					'media_type'              => 'video_image',
					'max_upload_file_size'    => 2000, //kb
					'max_upload_file_qty'     => 5,
					'upload_file_label'       => __( 'Upload media', 'yay-reviews' ),
					'upload_file_description' => __( 'You can upload jpg/png & video (maximum 2000Kbs)', 'yay-reviews' ),
					'enable_gdpr'             => false,
					'gdpr_message'            => __( 'I agree to the Privacy Policy.', 'yay-reviews' ),
					'before_message'          => __( 'We respect your privacy and need your consent to continue.', 'yay-reviews' ),
				),
				'reminder'        => array(
					'send_after_value' => 5,
					'send_after_unit'  => 'minutes',
					'max_products'     => 3,
					'products_type'    => 'normal',
					'except_emails'    => '',
					'send_to'          => 'registered_customers',
				),
				'rewards'         => array(),
				'optional_fields' => array(),
				'email'           => array(
					'reminder' => array(
						'subject' => __( 'Reminder email', 'yay-reviews' ),
						'heading' => __( 'Thank you for your purchase!', 'yay-reviews' ),
						'content' => '<p style="text-align: left;font-size: 16px;color: #0F172A;">' . __( 'Thank you for your recent purchase! Please take a moment to share your thoughts by reviewing these products. Your feedback helps us improve and earns you reward! {products_table}', 'yay-reviews' ) . '</p>',
						'footer'  => __( '{site_title} — Built with YayReviews', 'yay-reviews' ),
					),
					'reward'   => array(
						'subject' => __( 'Review reward email', 'yay-reviews' ),
						'heading' => __( 'Thank you for your review!', 'yay-reviews' ),
						'content' => '<p style="text-align: left;font-size: 16px;color: #0F172A;">' . __( 'Thank you for reviewing {product_name}! As a token of our appreciation, we\'ve sent you coupon: {coupon_code} to use on your next purchase.', 'yay-reviews' ) . '</p>',
						'footer'  => __( '{site_title} — Built with YayReviews', 'yay-reviews' ),
					),
				),
			)
		);

		return $settings;
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

	public static function upload_max_size() {
		return wc_let_to_num( ini_get( 'upload_max_filesize' ) ) / 1024;
	}

	public static function upload_max_qty() {
		return 20;
	}

	public static function get_product_categories() {
		$categories = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
				'orderby'    => 'name',
				'order'      => 'ASC',
			)
		);
		return array_map(
			function ( $category ) {
				return array(
					'value' => $category->term_id,
					'label' => $category->name,
				);
			},
			$categories
		);
	}

	public static function get_product_brands() {
		$brands = get_terms(
			array(
				'taxonomy'   => 'product_brand',
				'hide_empty' => false,
				'orderby'    => 'name',
				'order'      => 'ASC',
			)
		);
		return array_map(
			function ( $brand ) {
				return array(
					'value' => $brand->term_id,
					'label' => $brand->name,
				);
			},
			$brands
		);
	}

	public static function get_products_table( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			$sample_products = array();
			$product1        = new \WC_Product_Simple();
			$product1->set_name( 'Sample Product 1' );
			$product1->set_regular_price( '99.99' );
			$product1->set_sale_price( '79.99' );
			$product1->set_sku( 'SP001' );
			$product1->set_short_description( 'This is a sample product description for testing the email template. It includes some basic information about the product.' );
			$sample_products[] = $product1;
			$product2          = new \WC_Product_Simple();
			$product2->set_name( 'Sample Product 2' );
			$product2->set_regular_price( '149.99' );
			$product2->set_sku( 'SP002' );
			$product2->set_short_description( 'Another sample product with a different price point and description for testing purposes.' );
			$sample_products[] = $product2;

			return wc_get_template_html(
				'emails/products-table.php',
				array(
					'product_list' => $sample_products,
				),
				'',
				YAY_REVIEWS_PLUGIN_PATH . 'views/'
			);
		}
		$product_list = array();
		$items        = $order->get_items();
		foreach ( $items as $item ) {
			$product_list[] = $item->get_product();
		}
		return wc_get_template_html(
			'emails/products-table.php',
			array(
				'product_list' => $product_list,
			),
			'',
			YAY_REVIEWS_PLUGIN_PATH . 'views/'
		);
	}

	public static function get_max_remind_products_for_email( $product_in_order ) {
		$all_settings = self::get_all_settings();
		$max_products = $all_settings['reminder']['max_products'] ?? 3;
		$product_type = $all_settings['reminder']['products_type'] ?? 'normal';

		if ( 'all' === $product_type ) {
			return $product_in_order;
		}

		if ( '' === $max_products ) { // $max_products is empty it means no limit.
			$max_products = 100; // Just 100 because it's impossible to have more than 100 products in an order.
		}

		if ( 'normal' === $product_type ) {
			return array_slice( $product_in_order, 0, $max_products );
		}

		$remind_product_ids = array();

		$product_ids = Products::get_products_by_type( $product_type );
		foreach ( $product_ids as $product_id ) {
			if ( count( $remind_product_ids ) >= $max_products ) {
				break;
			}
			if ( in_array( $product_id, $product_in_order ) ) {
				$remind_product_ids[] = $product_id;
			}
		}
		return $remind_product_ids;
	}

	public static function is_coupon_expired( $coupon ) {
		$expiry_date = $coupon->get_date_expires();

		if ( ! $expiry_date ) {
			return false; // No expiry date set, so not expired
		}

		return time() > $expiry_date->getTimestamp();
	}

	public static function is_valid_coupon_for_product( $coupon, $product ) {
		$valid        = false;
		$product_cats = wc_get_product_cat_ids( $product->is_type( ProductType::VARIATION ) ? $product->get_parent_id() : $product->get_id() );
		$product_ids  = array( $product->get_id(), $product->get_parent_id() );

		// Specific products get the discount.
		if ( count( $coupon->get_product_ids() ) && count( array_intersect( $product_ids, $coupon->get_product_ids() ) ) ) {
			$valid = true;
		}

		// Category discounts.
		if ( count( $coupon->get_product_categories() ) && count( array_intersect( $product_cats, $coupon->get_product_categories() ) ) ) {
			$valid = true;
		}

		// No product ids - all items discounted.
		if ( ! count( $coupon->get_product_ids() ) && ! count( $coupon->get_product_categories() ) ) {
			$valid = true;
		}

		// Specific product IDs excluded from the discount.
		if ( count( $coupon->get_excluded_product_ids() ) && count( array_intersect( $product_ids, $coupon->get_excluded_product_ids() ) ) ) {
			$valid = false;
		}

		// Specific categories excluded from the discount.
		if ( count( $coupon->get_excluded_product_categories() ) && count( array_intersect( $product_cats, $coupon->get_excluded_product_categories() ) ) ) {
			$valid = false;
		}

		// Check brand restrictions
		$brand_coupon_settings = \WC_Brands_Brand_Settings_Manager::get_brand_settings_on_coupon( $coupon );
		$brand_restrictions    = ! empty( $brand_coupon_settings['included_brands'] ) || ! empty( $brand_coupon_settings['excluded_brands'] );

		if ( ! $brand_restrictions ) {
			return $valid;
		}

		$included_brands_match = false;

		$product_brands = wp_get_post_terms( $product->get_id(), 'product_brand', array( 'fields' => 'ids' ) );

		if ( ! empty( array_intersect( $product_brands, $brand_coupon_settings['included_brands'] ) ) ) {
			$included_brands_match = true;
		}

		if ( ! empty( array_intersect( $product_brands, $brand_coupon_settings['excluded_brands'] ) ) ) {
			$valid = false;
		}

		if ( ! $included_brands_match && ! empty( $brand_coupon_settings['included_brands'] ) ) {
			$valid = false;
		}

		return $valid;
	}

	public static function is_valid_review_criteria( $comment, $reward ) {
		$valid           = true;
		$rating          = (float) get_comment_meta( $comment->comment_ID, 'rating', true );
		$media           = get_comment_meta( $comment->comment_ID, 'yay_reviews_files', true );
		$comment_user_id = $comment->user_id;

		$send_to = $reward['send_to'];
		$rating_requirement = $reward['rating_requirement'];
		$frequency            = $reward['frequency'];
		$media_requirement = $reward['media_requirement'];

		if ( 'purchased_customers' === $send_to ) {
			if ( empty( $comment_user_id ) ) {
				$valid = false;
			} else {
				$total_orders = self::get_user_orders_total( $comment_user_id );
				if ( 0 === $total_orders ) {
					$valid = false;
				}
			}
		}

		// TODO: change logic
		if ( 'guest_users' === $send_to ) {
			if ( ! empty( $comment_user_id ) ) {
				$valid = false;
			}
		}

		if ( 'at_least_3_stars' === $rating_requirement ) {
			if ( $rating < 3 ) {
				$valid = false;
			}
		}
		if ( 'at_least_4_stars' === $rating_requirement ) {
			if ( $rating < 4 ) {
				$valid = false;
			}
		}

		if ( '5_stars' === $rating_requirement ) {
			if ( $rating < 5 ) {
				$valid = false;
			}
		}
		if ( '4_stars' === $rating_requirement ) {
			if ( $rating != 4 ) {
				$valid = false;
			}
		}

		if ( 'none' !== $media_requirement ) {
			$video_media = array_filter( $media, function ( $media ) {
				return 'video' === $media['type'];
			} );

			$image_media = array_filter( $media, function ( $media ) {
				return 'image' === $media['type'];
			} );

			if ( 'at_least_1_media' === $media_requirement ) {
				if ( empty( $image_media ) ) {
					$valid = false;
				}
			}

			if ( 'at_least_2_media' === $media_requirement ) {
				if ( count( $media ) < 2 ) {
					$valid = false;
				}
			}

			if ( 'at_least_1_image' === $media_requirement ) {
				if ( empty( $image_media ) ) {
					$valid = false;
				}
			}

			if ( 'at_least_1_video' === $media_requirement ) {
				if ( empty( $video_media ) ) {
					$valid = false;
				}
			}

			if ( 'at_least_2_videos' === $media_requirement ) {
				if ( count( $video_media ) < 2 ) {
					$valid = false;
				}
			}

			if ( 'at_least_2_images' === $media_requirement ) {
				if ( count( $image_media ) < 2 ) {
					$valid = false;
				}
			}
		}

		if ( ! empty( $comment_user_id ) && 'every_review' != $frequency ) {
			$user_reviews_count = count(
				get_comments(
					array(
						'user_id'      => $comment_user_id,
						'comment_type' => 'review',
						'status'       => 'approve',
					)
				)
			);

			// TODO: change logic
			if ( 'after_2_reviews' === $frequency ) {
				if ( $user_reviews_count < 2 ) {
					$valid = false;
				}
			}

			if ( 'after_3_reviews' === $frequency ) {
				if ( $user_reviews_count < 3 ) {
					$valid = false;
				}
			}
		}

		return $valid;

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
		$all_settings = self::get_all_settings();
		$addons       = $all_settings['addons'];
		if ( ! $addons['overview'] ) {
			return array();
		}
		global $post;
		// check if post is a product
		if ( ! $post || 'product' !== $post->post_type ) {
			return array();
		}

		$product_id = $post->ID;

		$average_rating = get_post_meta( $product_id, '_wc_average_rating', true );
		$total_reviews  = get_post_meta( $product_id, '_wc_review_count', true );

		if ( 0 === $total_reviews ) {
			return array();
		}

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
					);
				}
			}
		}
		wp_reset_postdata();

		return $coupons;
	}
}
