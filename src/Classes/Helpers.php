<?php
namespace YayReviews\Classes;

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
		$default_settings = self::get_all_settings();
		$merged_settings  = self::wp_parse_args_recursive( $settings, $default_settings );
		update_option( 'yay_reviews_settings', $merged_settings, false );
		return $merged_settings;
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
					'upload_media'            => false,
					'upload_required'         => false,
					'media_type'              => 'video_image',
					'max_upload_file_size'    => 2000, //kb
					'max_upload_file_qty'     => 5,
					'upload_file_label'       => __( 'Upload media', 'yay-reviews' ),
					'upload_file_description' => '',
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
}
