<?php
namespace YayReviews\Classes;

class Helpers {
	public static function get_all_settings_from_db() {
		$settings = get_option( 'yay_reviews_settings', array() );
		return self::add_default_settings( $settings );
	}

	public static function get_all_settings() {
		global $yay_reviews_settings;
		return $yay_reviews_settings;
	}

	public static function set_settings( $key, $val ) {
		global $yay_reviews_settings;

		$old_settings         = self::get_all_settings();
		$old_settings[ $key ] = $val;
		update_option( 'yay_reviews_settings', $old_settings, false );

		$yay_reviews_settings = $old_settings;
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
		global $yay_reviews_settings;

		// Merge with default settings to preserve any missing fields
		$default_settings = self::get_all_settings();
		$merged_settings  = self::wp_parse_args_recursive( $settings, $default_settings );

		// Update the option in database
		update_option( 'yay_reviews_settings', $merged_settings, false );

		// Update global variable
		$yay_reviews_settings = $merged_settings;

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
					'upload_file_label'       => __( 'Upload media', 'yay_reviews' ),
					'upload_file_description' => '',
					'enable_gdpr'             => false,
					'gdpr_message'            => __( 'I agree with your policy,...', 'yay_reviews' ),
					'before_message'          => __( 'We value your privacy. By submitting this review, you consent to the processing of your personal data', 'yay_reviews' ),
					'after_message'           => __( 'We value your privacy. By submitting this review, you consent to the processing of your personal data', 'yay_reviews' ),
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
						'subject' => __( 'Reminder email', 'yay_reviews' ),
						'heading' => __( 'Reminder email for you', 'yay_reviews' ),
						'content' => __( "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged", 'yay_reviews' ),
						'footer'  => __( 'Thank you for your review.', 'yay_reviews' ),
					),
					'reward'   => array(
						'subject' => __( 'Review reward email', 'yay_reviews' ),
						'heading' => __( 'Reward email for you', 'yay_reviews' ),
						'content' => __( "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged", 'yay_reviews' ),
						'footer'  => __( 'Thank you for your review.', 'yay_reviews' ),
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
}
