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

	public static function get_table_of_products( $args = array(), $limit = 3, $data = array() ) {
		$limit = (int) $limit;

		$default_args = array(
			'post_type'      => 'product',
			'posts_per_page' => $limit,
		);

		if ( count( $args ) > 0 ) {
			$args = array_merge( $default_args, $args );
		} else {
			$args = $default_args;
		}

		$data = wp_parse_args(
			$data,
			array(
				'email_review_btn_color'    => '#fff',
				'email_review_btn_bg_color' => '#206bb9',
				'email_review_btn_text'     => esc_html__( 'Review now', 'yay_reviews' ),
			)
		);

		$latest_products = new \WP_Query( $args );

		$table  = '<table border="0" cellpadding="5" cellspacing="0">';
		$table .= '<thead>';
		$table .= '<tr>';
		$table .= '<th>' . esc_html__( 'Thumbnail', 'yay_reviews' ) . '</th>';
		$table .= '<th>' . esc_html__( 'Product Name', 'yay_reviews' ) . '</th>';
		$table .= '<th>' . esc_html__( 'Price', 'yay_reviews' ) . '</th>';
		$table .= '<th>' . esc_html__( 'Link', 'yay_reviews' ) . '</th>';
		$table .= '</tr>';
		$table .= '</thead>';
		$table .= '<tbody>';

		if ( $latest_products->have_posts() ) {
			while ( $latest_products->have_posts() ) {
				$latest_products->the_post();

				$id      = get_the_ID();
				$product = wc_get_product( $id );
				if ( has_post_thumbnail() ) {
					$thumbnail = get_the_post_thumbnail( $id, 'thumbnail' );
				} else {
					$thumbnail = '<img style="width: 150px; height: 150px;" src="' . esc_url( wc_placeholder_img_src() ) . '" alt="" />';
				}
				$link = get_permalink() . '#' . self::get_settings( 'reviews', 'anchor_link', 'reviews' );

				$table .= '<tr>';
				$table .= '<td><a href="' . $link . '" target="_blank" >' . $thumbnail . '</a></td>';
				$table .= '<td><a href="' . $link . '" target="_blank" >' . get_the_title() . '</a></td>';
				$table .= '<td>' . $product->get_price_html() . '</td>';
				$table .= '<td><a target="_blank" href="' . $link . '" style="display: inline-block; padding: 5px;color: ' . $data['email_review_btn_color'] . '; background-color: ' . $data['email_review_btn_bg_color'] . '" >' . $data['email_review_btn_text'] . '</a></td>';
				$table .= '</tr>';
			}
		} else {
			$table .= '<tr><td colspan="4">' . esc_html__( 'No products found.', 'yay_reviews' ) . '</td></tr>';
		}

		$table .= '</tbody>';
		$table .= '</table>';

		wp_reset_postdata();
		return $table;
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
	public static function download_and_save_photo( $photo_url ) {
		// Get the upload directory details
		$uploads       = wp_upload_dir();
		$upload_dir    = $uploads['path'];
		$upload_url    = $uploads['url'];
		$upload_subdir = $uploads['subdir'];

		// Generate a unique filename
		$filename        = basename( $photo_url );
		$unique_filename = wp_unique_filename( $upload_dir, $filename );
		$file_path       = $upload_dir . '/' . $unique_filename;

		// Download the photo
		$response = wp_remote_get(
			$photo_url,
			array(
				'timeout'   => 300,
				'sslverify' => false,
			)
		);

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
			return false; // Return false if there was an error downloading the photo
		}

		$photo_data = wp_remote_retrieve_body( $response );

		// Save the photo to the uploads directory
		if ( file_put_contents( $file_path, $photo_data ) === false ) {
			return false; // Return false if there was an error saving the photo
		}

		// Return the relative path of the photo
		return $upload_subdir . '/' . $unique_filename;
	}
	public static function upload_max_qty() {
		return 20;
	}
	public static function coupon_default_fields() {
		return array(
			'title'                   => '',
			'coupon_code'             => '',
			'only_registered_account' => '',
			'upload_required'         => '',
			'only_verified_owner'     => '',
			'minimum_rating'          => 0,
			'required_categories'     => array(),
			'exclude_categories'      => array(),
			'required_products'       => array(),
			'exclude_products'        => array(),
		);
	}
}
