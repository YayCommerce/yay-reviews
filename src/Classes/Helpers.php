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

	public static function print_media( $files, $echo = true ) {
		// Define arrays of image and video extensions
		$image_extensions = array( 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp' );
		$video_extensions = array( 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'quicktime' );

		ob_start();
		$uploads = wp_upload_dir();
		echo '<div class="yay-reviews-medias">';
		foreach ( $files as $file ) {
			$extension = pathinfo( $file, PATHINFO_EXTENSION );
			if ( in_array( strtolower( $extension ), $image_extensions ) ) {
				$html = '<img src="' . esc_url( $uploads['baseurl'] . $file ) . '" data-src="' . esc_url( $uploads['baseurl'] . $file ) . '" alt="" />';
			} elseif ( in_array( strtolower( $extension ), $video_extensions ) ) {
				$html = '<img src="' . esc_url( YAY_REVIEWS_PLUGIN_URL . 'assets/frontend/img/video-thumbnail.png' ) . '" data-src="' . esc_url( $uploads['baseurl'] . $file ) . '" alt="" />';
			}

			echo '<div class="yay-reviews-media" data-type="' . esc_attr( in_array( strtolower( $extension ), $video_extensions ) ? 'video' : 'image' ) . '">' . $html . '</div>'; //phpcs:ignore
		}
		echo '</div>';
		echo '<div class="yay-reviews-preview-media-modal">
			<div class="yay-reviews-modal-content">
				<span class="yay-reviews-modal-close">&times;</span>
				<div class="yay-reviews-modal-body"></div>
			</div>
		</div>';
		$html = ob_get_clean();
		if ( $echo ) {
			echo $html; //phpcs:ignore
		} else {
			return $html;
		}
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
					'gdpr_message'            => __( 'I agree with your policy,...', 'yay-reviews' ),
					'before_message'          => __( 'We value your privacy. By submitting this review, you consent to the processing of your personal data', 'yay-reviews' ),
					'after_message'           => __( 'We value your privacy. By submitting this review, you consent to the processing of your personal data', 'yay-reviews' ),
				),
				'reminder'        => array(
					'send_after_value' => 5,
					'send_after_unit'  => 'minutes',
					'max_products'     => 3,
					'products_type'    => 'featured',
					'except_emails'    => '',
					'send_to_guests'   => false,
				),
				'rewards'         => array(),
				'optional_fields' => array(),
				'email'           => array(
					'reminder' => array(
						'subject' => __( 'Reminder email', 'yay-reviews' ),
						'heading' => __( 'Reminder email for you', 'yay-reviews' ),
						'content' => __( "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged", 'yay-reviews' ),
						'footer'  => __( 'Thank you for your review.', 'yay-reviews' ),
					),
					'reward'   => array(
						'subject' => __( 'Review reward email', 'yay-reviews' ),
						'heading' => __( 'Reward email for you', 'yay-reviews' ),
						'content' => __( "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged", 'yay-reviews' ),
						'footer'  => __( 'Thank you for your review.', 'yay-reviews' ),
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

	public static function get_product_table( $order ) {
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
				'emails/product-table.php',
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
			'emails/product-table.php',
			array(
				'product_list' => $product_list,
			),
			'',
			YAY_REVIEWS_PLUGIN_PATH . 'views/'
		);
	}

	public static function get_max_remind_products_for_email( $product_in_order ) {
		$max_products = self::get_settings( 'reminder', 'max_products', 3 );

		if ( 0 === $max_products ) {
			return $product_in_order;
		}

		$remind_product_ids = array();
		$product_type       = self::get_settings( 'reminder', 'products_type' );
		$product_ids        = Products::get_products_by_type( $product_type );
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

		$only_send_to_purchased_customers           = $reward['only_send_to_purchased_customers'];
		$send_to_guests                             = $reward['send_to_guests'];
		$minimum_required_rating                    = (float) $reward['minimum_required_rating'];
		$minimum_media_files_uploaded               = (int) $reward['minimum_media_files_uploaded'];
		$minimum_required_reviews_since_last_reward = (int) $reward['minimum_required_reviews_since_last_reward'];

		if ( $only_send_to_purchased_customers ) {
			if ( empty( $comment_user_id ) ) {
				$valid = false;
			} else {
				$total_orders = self::get_user_orders_total( $comment_user_id );
				if ( 0 === $total_orders ) {
					$valid = false;
				}
			}
		}

		if ( $send_to_guests && empty( $comment_user_id ) ) {
			if ( ! isset( $_POST['email'] ) || empty( $_POST['email'] ) ) { //phpcs:ignore
				$valid = false;
			}
		}

		if ( $rating < $minimum_required_rating ) {
			$valid = false;
		}
		if ( count( $media ) < $minimum_media_files_uploaded ) {
			$valid = false;
		}

		if ( ! empty( $comment_user_id ) && $minimum_required_reviews_since_last_reward > 0 ) {
			$user_reviews_count = count(
				get_comments(
					array(
						'user_id'      => $comment_user_id,
						'comment_type' => 'review',
						'status'       => 'approve',
					)
				)
			);

			if ( $user_reviews_count < $minimum_required_reviews_since_last_reward ) {
				$valid = false;
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
}
