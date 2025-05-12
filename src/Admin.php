<?php

namespace YayReviews;

use YayReviews\Classes\Helpers;
use YayReviews\Register\ScriptName;

class Admin {

	public function __construct() {
		new AdminMenu();

		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ), 30 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );

		// Register REST API routes
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
		add_filter( 'wc_get_template', array( $this, 'wc_template' ), 10, 5 );

		if ( Helpers::get_settings( 'general', 'enabled', true ) ) {
			$settings = Helpers::get_all_settings();
			//Review reminder
			$reviewReminder = $settings['reviewReminder'];
			if ( $reviewReminder['enabled'] ) {
				if ( count( $reviewReminder['order_status'] ) > 0 ) {
					foreach ( $reviewReminder['order_status'] as $status ) {
						add_action( 'woocommerce_order_status_' . substr( $status, 3 ), array( $this, 'woocommerce_new_order' ), 10, 2 );
					}
				}
			}
			add_action( 'yay_reviews_send_delayed_reminder_email', array( $this, 'send_review_reminder_email' ), 10, 1 );
			add_action( 'wp_insert_comment', array( $this, 'wp_insert_comment' ), 10, 2 );

			//Coupon
			$coupon_settings = $settings['coupon'];
			if ( $coupon_settings['enabled'] ) {
				// Hook into comment post and edit comment hooks
				add_action( 'comment_post', array( $this, 'send_coupon_on_review_approval' ), 10, 2 );
				add_action( 'edit_comment', array( $this, 'send_coupon_on_review_approval' ), 10, 2 );

			}
		}
	}

	public function register_rest_api() {
		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'get-settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_settings' ),
				'permission_callback' => array( $this, 'rest_permission_callback' ),
			)
		);
		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'save-settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_save_settings' ),
				'permission_callback' => array( $this, 'rest_permission_callback' ),
			)
		);

		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'get-products',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_products' ),
				'permission_callback' => array( $this, 'rest_permission_callback' ),
			)
		);
		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'get-categories',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_categories' ),
				'permission_callback' => array( $this, 'rest_permission_callback' ),
			)
		);
		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'get-coupons',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_coupons' ),
				'permission_callback' => array( $this, 'rest_permission_callback' ),
			)
		);

		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'email-preview',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_email_preview' ),
				'permission_callback' => array( $this, 'rest_permission_callback' ),
			)
		);
		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'export-reviews',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_export_reviews' ),
				'permission_callback' => array( $this, 'rest_permission_callback' ),
			)
		);
		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'import-reviews',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_import_reviews' ),
				'permission_callback' => array( $this, 'rest_permission_callback' ),
			)
		);
	}
	public function rest_get_settings() {
		$settings = Helpers::get_all_settings();
		return rest_ensure_response( $settings );
	}
	public function rest_save_settings( \WP_REST_Request $request ) {
		$general = $request->get_param( 'general' );
		if ( ! is_null( $general ) && is_array( $general ) ) {
			Helpers::set_settings( 'general', $general );
		}

		$reviews = $request->get_param( 'reviews' );
		if ( ! is_null( $reviews ) && is_array( $reviews ) ) {
			Helpers::set_settings( 'reviews', $reviews );
		}

		$coupon = $request->get_param( 'coupon' );
		if ( ! is_null( $coupon ) && is_array( $coupon ) ) {
			if ( ! isset( $coupon['coupons'] ) ) {
				$coupon['coupons'] = array();
			}
			$coupon['coupons'] = array_map(
				function ( $c ) {
					return wp_parse_args( $c, Helpers::coupon_default_fields() );
				},
				$coupon['coupons']
			);
			Helpers::set_settings( 'coupon', $coupon );
		}

		$reviewReminder = $request->get_param( 'reviewReminder' );
		if ( ! is_null( $reviewReminder ) && is_array( $reviewReminder ) ) {
			Helpers::set_settings( 'reviewReminder', $reviewReminder );
		}

		$optional_fields = $request->get_param( 'optional_fields' );
		if ( ! is_null( $optional_fields ) && is_array( $optional_fields ) ) {
			Helpers::set_settings( 'optional_fields', $optional_fields );
		}

		return rest_ensure_response( array( 'success' => true ) );
	}

	public function rest_get_products( \WP_REST_Request $request ) {
		$search = $request->get_param( 'search' );
		$limit  = $request->get_param( 'limit' );
		if ( ! $limit ) {
			$limit = 10;
		}
		$args = array(
			'post_type'      => 'product',
			'posts_per_page' => $limit,
			's'              => $search,
			'post_status'    => 'publish',
		);

		$query = new \WP_Query( $args );

		$products = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				// $product = wc_get_product(get_the_ID());
				// $products[] = [
				//     'id' => $product->get_id(),
				//     'name' => $product->get_name(),
				// ];
				$products[] = array(
					'id'   => get_the_ID(),
					'name' => get_the_title(),
				);
			}
		}
		wp_reset_postdata();
		return new \WP_REST_Response( $products, 200 );
	}
	public function rest_get_categories( \WP_REST_Request $request ) {
		$search = $request->get_param( 'search' );
		$args   = array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
		);
		if ( $search ) {
			$args['search'] = $search;
		}
		$categories = get_terms( $args );

		if ( is_wp_error( $categories ) ) {
			return rest_ensure_response( array( 'error' => $categories->get_error_message() ) );
		}

		$categories_data = array();
		foreach ( $categories as $category ) {
			$categories_data[] = array(
				'id'   => $category->term_id,
				'name' => $category->name,
			);
		}
		return rest_ensure_response( $categories_data );
	}
	public function rest_get_coupons( \WP_REST_Request $request ) {
		$search = $request->get_param( 'search' );
		$limit  = $request->get_param( 'limit' );
		if ( ! $limit ) {
			$limit = 10;
		}
		$args = array(
			'post_type'      => 'shop_coupon',
			'posts_per_page' => $limit,
			's'              => $search,
			'post_status'    => 'publish',
		);

		$query = new \WP_Query( $args );

		$products = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$products[] = array(
					'id'   => get_the_ID(),
					'name' => get_the_title(),
				);
			}
		}
		wp_reset_postdata();
		return new \WP_REST_Response( $products, 200 );
	}
	public function rest_email_preview( \WP_REST_Request $request ) {
		$data          = $request->get_param( 'data' );
		$type          = $request->get_param( 'type' );
		$email_content = '';
		if ( $type == 'reminder' ) {
			$data = wp_parse_args(
				$data,
				array(
					'email_heading'             => esc_html__( 'Review our product now', 'yay_reviews' ),
					'email_content'             => "Hi {customer_name},
                <br />
    Thank you for your recent purchase from {site_title}! We hope you're enjoying your new products.
    <br />
    At {site_title}, we're committed to providing the best products and customer experience possible. Your feedback helps us achieve this goal. We would greatly appreciate it if you could take a moment to share your thoughts on the product(s) you purchased.<br />
    {product_table}
    <br />
    Your review will not only help us improve but also assist other customers in making informed decisions.
    <br />
    Thank you for being a valued customer, and we look forward to serving you again soon!
    <br />
    Warm regards,",
					'email_review_btn_text'     => esc_html__( 'Review Now', 'yay_reviews' ),
					'email_review_btn_color'    => '#fff',
					'email_review_btn_bg_color' => '#206bb9',
				// 'email_template' => 'none'
				)
			);
			$table = Helpers::get_table_of_products(
				array(
					'orderby' => 'date',
					'order'   => 'DESC',
				),
				3,
				$data
			);

			$data['email_content'] = str_replace( '{customer_name}', 'Peter', $data['email_content'] );
			$data['email_content'] = str_replace( '{site_title}', get_bloginfo( 'name' ), $data['email_content'] );
			$data['email_content'] = str_replace( '{order_id}', 144, $data['email_content'] );
			$data['email_content'] = str_replace( '{product_table}', $table, $data['email_content'] );

			$template_path = 'yay_reviews_reminder_reviews.php';
			// $template_path = 'emails/admin-new-order.php';
			ob_start();
			wc_get_template(
				$template_path,
				array(
					'email_heading' => $data['email_heading'],
					'email'         => null,
					'email_content' => $data['email_content'],
				)
			);
			$email_content = ob_get_clean();
		} elseif ( $type == 'coupon' ) {
			$coupon_code_label     = $data['coupon_code']['label'] ?? '';
			$data                  = wp_parse_args(
				$data,
				array(
					'email_heading' => esc_html__( 'Your coupon is here', 'yay_reviews' ),
					'email_content' => 'Hi {customer_name},
                <br />
                Thank you for your recent purchase from {site_title}
                <br />
                This is your coupon: {coupon_code}
                <br />
                Thank you for being a valued customer, and we look forward to serving you again soon!
                <br />
                Warm regards,',
				)
			);
			$data['email_content'] = str_replace( '{customer_name}', 'Peter', $data['email_content'] );
			$data['email_content'] = str_replace( '{site_title}', get_bloginfo( 'name' ), $data['email_content'] );
			$data['email_content'] = str_replace( '{coupon_code}', $coupon_code_label, $data['email_content'] );

			$template_path = 'yay_reviews_reminder_reviews.php';

			ob_start();
			wc_get_template(
				$template_path,
				array(
					'email_heading' => $data['email_heading'],
					'email'         => null,
					'email_content' => $data['email_content'],
				)
			);
			$email_content = ob_get_clean();
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'html'    => $email_content,
			)
		);
	}
	public function rest_export_reviews( \WP_REST_Request $request ) {
		global $wpdb;

		$fields = $request->get_param( 'fields' );

		$date_range = isset( $fields['date_range'] ) ? $fields['date_range'] : array();
		$products   = isset( $fields['products'] ) ? $fields['products'] : array();
		$categories = isset( $fields['categories'] ) ? $fields['categories'] : array();
		$ratings    = isset( $fields['ratings'] ) ? array_map( 'intval', $fields['ratings'] ) : array();
		$status     = isset( $fields['status'] ) ? $fields['status'] : array();

		// Build the query to fetch reviews based on filters
		$query            = "SELECT c.*, cm.meta_value AS rating 
              FROM {$wpdb->prefix}comments c
              LEFT JOIN {$wpdb->prefix}commentmeta cm ON c.comment_ID = cm.comment_id 
              WHERE c.comment_type = 'review' 
              AND cm.meta_key = 'rating'";
		$query_conditions = array();

		if ( ! empty( $date_range ) && count( $date_range ) == 2 && ! empty( $date_range[0] ) && ! empty( $date_range[1] ) ) {
			$query_conditions[] = "comment_date >= '{$date_range[0]}' AND comment_date <= '{$date_range[1]}'";
		}
		if ( ! empty( $products ) ) {
			$product_ids        = implode( ',', array_map( 'intval', array_column( $products, 'value' ) ) );
			$query_conditions[] = "comment_post_ID IN ({$product_ids})";
		}
		if ( ! empty( $categories ) ) {
			$category_ids = implode( ',', array_map( 'intval', array_column( $categories, 'value' ) ) );
			$query       .= " AND comment_post_ID IN (SELECT object_id FROM {$wpdb->prefix}term_relationships WHERE term_taxonomy_id IN ({$category_ids}))";
		}
		if ( ! empty( $ratings ) ) {
			$ratings_in         = implode( ',', array_map( 'intval', $ratings ) );
			$query_conditions[] = "cm.meta_value IN ({$ratings_in})";
		}
		if ( ! empty( $status ) ) {
			// Mapping user-friendly statuses to WordPress database values
			$status_map = array(
				'pending'  => '0',   // comment_approved = 0: pending
				'approved' => '1',  // comment_approved = 1: approved
				'spam'     => 'spam',   // comment_approved = spam: spam
				'trash'    => 'trash',  // comment_approved = trash: trash
			);

			// Convert statuses using the mapping
			$status = array_map(
				function ( $s ) use ( $status_map ) {
					return isset( $status_map[ $s ] ) ? $status_map[ $s ] : esc_sql( $s );
				},
				$status
			);

			$status_in          = implode( "','", $status );
			$query_conditions[] = "c.comment_approved IN ('{$status_in}')";
		}

		if ( ! empty( $query_conditions ) ) {
			$query .= ' AND ' . implode( ' AND ', $query_conditions );
		}
		$reviews = $wpdb->get_results( $query, ARRAY_A );

		if ( ! $reviews ) {
			wp_send_json_error( 'No reviews found for the given criteria.', 404 );
		}
		// Mapping statuses for CSV output
		$status_display_map = array(
			'0'     => 'pending',
			'1'     => 'approved',
			'spam'  => 'spam',
			'trash' => 'trash',
		);

		// Get the base URL for uploads
		$uploads        = wp_upload_dir();
		$upload_baseurl = $uploads['baseurl'];

		// Generate CSV content with additional fields
		$csv_data = "Review ID,Product ID,Reviewer Name,Reviewer Email,Review,Rating,Status,Date,Date GMT,Author URL,Author User ID,Author IP,User Agent,Comment Parent,Review Photos\n";
		foreach ( $reviews as $review ) {
			// Convert status to a readable format
			$display_status = isset( $status_display_map[ $review['comment_approved'] ] ) ? $status_display_map[ $review['comment_approved'] ] : $review['comment_approved'];

			// Get the review photos meta
			$photos_meta = get_comment_meta( $review['comment_ID'], 'yay_reviews_photos', true );
			$photos      = '';
			if ( ! empty( $photos_meta ) && is_array( $photos_meta ) ) {
				$photos = implode(
					"\n",
					array_map(
						function ( $path ) use ( $upload_baseurl ) {
							return $upload_baseurl . $path;
						},
						$photos_meta
					)
				);
			}

			$csv_data .= "{$review['comment_ID']},{$review['comment_post_ID']},\"{$review['comment_author']}\",\"{$review['comment_author_email']}\",\"{$review['comment_content']}\",{$review['rating']},{$display_status},{$review['comment_date']},{$review['comment_date_gmt']},\"{$review['comment_author_url']}\",{$review['user_id']},\"{$review['comment_author_IP']}\",\"{$review['comment_agent']}\",{$review['comment_parent']},\"{$photos}\"\n";
		}

		wp_send_json_success( $csv_data );
	}
	public function rest_import_reviews( \WP_REST_Request $request ) {
		// Check for a file in the request
		if ( empty( $_FILES['file'] ) ) {
			return new \WP_REST_Response( 'No file uploaded', 400 );
		}

		$file = $_FILES['file'];

		// Verify the file type
		$file_type = wp_check_filetype( $file['name'] );
		if ( $file_type['ext'] !== 'csv' ) {
			return new \WP_REST_Response( 'Invalid file type. Please upload a CSV file.', 415 );
		}

		// Read the CSV file
		$csv_data = file_get_contents( $file['tmp_name'] );
		$rows     = array_map( 'str_getcsv', explode( PHP_EOL, $csv_data ) );

		// Check if the file has content
		if ( empty( $rows ) ) {
			return new \WP_REST_Response( 'CSV file is empty or improperly formatted.', 400 );
		}

		global $wpdb;
		$imported_count = 0;

		// Process each row
		foreach ( $rows as $index => $row ) {
			// Skip the header row
			if ( $index === 0 ) {
				continue;
			}

			if ( count( $row ) < 15 ) {
				continue; // Skip rows with missing columns
			}

			$status = strtolower( trim( $row[6] ) );

			if ( $status === 'approved' ) {
				$comment_approved = '1';
			} elseif ( $status == 'pending' ) {
				$comment_approved = '0';
			} else {
				$comment_approved = $status;
			}

			$review_data = array(
				'comment_post_ID'      => intval( $row[1] ), // Product ID
				'comment_author'       => sanitize_text_field( $row[2] ), // Reviewer Name
				'comment_author_email' => sanitize_email( $row[3] ), // Reviewer Email
				'comment_content'      => sanitize_textarea_field( $row[4] ), // Review Content
				'comment_approved'     => $comment_approved,
				'comment_date'         => sanitize_text_field( $row[7] ), // Date
				'comment_date_gmt'     => sanitize_text_field( $row[8] ), // Date GMT
				'comment_author_url'   => esc_url_raw( $row[9] ), // Author URL
				'user_id'              => intval( $row[10] ), // Author User ID
				'comment_author_IP'    => sanitize_text_field( $row[11] ), // Author IP
				'comment_agent'        => sanitize_text_field( $row[12] ), // User Agent
				'comment_parent'       => intval( $row[13] ), // Comment Parent
				'comment_type'         => 'review', // Set to 'review'
			);

			// Insert the review
			$comment_id = wp_insert_comment( $review_data );

			if ( $comment_id ) {
				//update rating
				update_comment_meta( $comment_id, 'rating', intval( $row[5] ) );

				$review_photos  = explode( "\n", $row[14] );
				$new_photo_urls = array();

				foreach ( $review_photos as $photo_url ) {
					$photo_url = trim( $photo_url );
					if ( ! empty( $photo_url ) ) {
						$new_url = Helpers::download_and_save_photo( $photo_url );
						if ( $new_url ) {
							$new_photo_urls[] = $new_url;
						}
					}
				}
				//update photos
				update_comment_meta( $comment_id, 'yay_reviews_photos', $new_photo_urls );

				++$imported_count;
			}
		}

		wp_send_json_success( array( 'mess' => "Successfully imported {$imported_count} reviews." ) );
	}
	public function rest_permission_callback() {
		// return true;
		return current_user_can( 'manage_options' );
	}
	public function add_meta_boxes() {
		$screen    = get_current_screen();
		$screen_id = $screen ? $screen->id : '';

		if ( 'comment' === $screen_id && isset( $_GET['c'] ) && metadata_exists( 'comment', wc_clean( wp_unslash( $_GET['c'] ) ), 'rating' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			add_meta_box( 'woocommerce-rating-yay-reviews', __( 'Photos/Videos', 'yayreviews' ), array( $this, 'reviews_metabox_callback' ), 'comment', 'normal', 'high' );
			add_meta_box( 'woocommerce-rating-yay-reviews-op-fields', __( 'YayReviews Optional Fields', 'yayreviews' ), array( $this, 'reviews_opfields_metabox_callback' ), 'comment', 'normal', 'high' );
		}
	}
	public function reviews_metabox_callback( $comment ) {
		$photos = get_comment_meta( $comment->comment_ID, 'yay_reviews_photos', true );
		if ( is_array( $photos ) ) {
			Helpers::print_photos( $photos );
		}
	}

	public function reviews_opfields_metabox_callback( $comment ) {
		if ( Helpers::get_settings( 'optional_fields', 'enabled', false ) ) {
			$op_fields = Helpers::get_settings( 'optional_fields', 'fields', array() );
			foreach ( $op_fields as $field ) {
				$val = get_comment_meta( $comment->comment_ID, 'yay_reviews_' . $field['name'], true );
				?>
				<div>
					<strong><?php echo esc_html( $field['label'] ); ?>: </strong><br />
					<div>
						<?php echo esc_html( $val ); ?>
					</div>    
				</div>
				<?php
			}
		}
	}
	public function admin_enqueue_scripts( $hook ) {
		if ( $hook == 'yaycommerce_page_yay-reviews' ) {
			$order_statuses = Helpers::get_order_statuses();

			wp_localize_script(
				ScriptName::PAGE_SETTINGS,
				'yayReviews',
				array(
					'nonce'           => wp_create_nonce( 'yay_reviews_nonce' ),
					'rest_nonce'      => wp_create_nonce( 'wp_rest' ),
					'rest_url'        => get_rest_url( null, YAY_REVIEWS_REST_URL ),
					'image_url'       => YAY_REVIEWS_PLUGIN_URL . 'assets/admin/images',
					'order_statuses'  => $order_statuses,
					'upload_max_size' => Helpers::upload_max_size(),
					'upload_max_qty'  => Helpers::upload_max_qty(),
					'i18n'            => array(
						'dashboard'                   => __( 'Dashboard', 'yay_reviews' ),
						'reminder'                    => __( 'Reminder', 'yay_reviews' ),
						'review_reward'               => __( 'Review Reward', 'yay_reviews' ),
						'import_export_reviews'       => __( 'Import/Export Reviews', 'yay_reviews' ),
						'preview_form'                => __( 'Preview form', 'yay_reviews' ),
						'save'                        => __( 'Save', 'yay_reviews' ),
						'import_reviews'              => __( 'Import Reviews', 'yay_reviews' ),
						'import_reviews_success'      => __( 'Successfully imported reviews.', 'yay_reviews' ),
						'import_reviews_error'        => __( 'Failed to import reviews.', 'yay_reviews' ),
						'import_reviews_invalid_file' => __( 'Invalid file type. Please upload a CSV file.', 'yay_reviews' ),
						'import_reviews_empty_file'   => __( 'CSV file is empty or improperly formatted.', 'yay_reviews' ),
						'review'                      => __( 'Review', 'yay_reviews' ),
						'coupon'                      => __( 'Coupon', 'yay_reviews' ),
						'review_reminder'             => __( 'Review Reminder', 'yay_reviews' ),
						'optional_fields'             => __( 'Optional Fields', 'yay_reviews' ),
						'export_import_reviews'       => __( 'Export/Import Reviews', 'yay_reviews' ),
						'general'                     => __( 'General', 'yay_reviews' ),
						'enable'                      => __( 'Enable', 'yay_reviews' ),
						'settings_saved'              => __( 'Settings saved successfully.', 'yay_reviews' ),
						'failed_load_state'           => __( 'Failed to load initial state.', 'yay_reviews' ),
						'failed_save_settings'        => __( 'Failed to save settings.', 'yay_reviews' ),
						'preview_email'               => __( 'Preview email', 'yay_reviews' ),
						'save_settings'               => __( 'Save Settings', 'yay_reviews' ),
						'close'                       => __( 'Close', 'yay_reviews' ),
						'submit'                      => __( 'Submit', 'yay_reviews' ),
						'export'                      => __( 'Export', 'yay_reviews' ),
						'import'                      => __( 'Import', 'yay_reviews' ),
						'item_cloned'                 => __( 'Item cloned successfully.', 'yay_reviews' ),
						'item_removed'                => __( 'Item removed successfully.', 'yay_reviews' ),
						'last_item_delete_error'      => __( 'The last item could not be deleted.', 'yay_reviews' ),
						'import_success'              => __( 'Imported successfully.', 'yay_reviews' ),
						'file_upload_failed'          => __( 'File upload failed.', 'yay_reviews' ),
						'click_drag_import'           => __( 'Click or drag file to this area to import', 'yay_reviews' ),
						'fields'                      => __( 'Fields                                          : ', 'yay_reviews' ),
						'reviews_anchor_link'         => __( 'Reviews Anchor Link', 'yay_reviews' ),
						'include_photos_videos'       => __( 'Include photos & videos', 'yay_reviews' ),
						'upload_required'             => __( 'Upload required', 'yay_reviews' ),
						'max_upload_file_size'        => __( 'Maximum upload file size', 'yay_reviews' ),
						'max_upload_file_qty'         => __( 'Maximum upload file quantity', 'yay_reviews' ),
						'enable_gdpr_checkbox'        => __( 'Enable GDPR Checkbox', 'yay_reviews' ),
						'gdpr_message'                => __( 'GDPR Message', 'yay_reviews' ),
						'tooltip_photos_videos'       => __( 'Allow customers to attach photos and videos to their reviews.', 'yay_reviews' ),
						'tooltip_upload_required'     => __( 'Reviews must include a photo or a video to be uploaded.', 'yay_reviews' ),
						'tooltip_max_file_size'       => __( 'The maximum size of a single picture or a video can be uploaded.', 'yay_reviews' ),
						'tooltip_max_file_qty'        => __( 'The maximum quantity of photos and videos can be uploaded with a review.', 'yay_reviews' ),
						'name_asterisk'               => __( 'Name (*)', 'yay_reviews' ),
						'name_desc'                   => __( '[a-zA-z0-9_] are allowed. Eg                    : your-age', 'yay_reviews' ),
						'label_text'                  => __( 'Label', 'yay_reviews' ),
						'label_desc'                  => __( 'Eg                                              : Your Age', 'yay_reviews' ),
						'type_text'                   => __( 'Type', 'yay_reviews' ),
						'text_field'                  => __( 'Text Field', 'yay_reviews' ),
						'textarea'                    => __( 'Textarea', 'yay_reviews' ),
						'dropdown'                    => __( 'Dropdown', 'yay_reviews' ),
						'value_text'                  => __( 'Value', 'yay_reviews' ),
						'value_desc'                  => __( 'If type is dropdown, the value will be like this: Value 1|Value 2|Value 3', 'yay_reviews' ),
						'failed_preview_email'        => __( 'Failed to preview email.', 'yay_reviews' ),
						'title'                       => __( 'Title', 'yay_reviews' ),
						'title_desc'                  => __( 'Type whatever you want', 'yay_reviews' ),
						'choose_coupon'               => __( 'Choose a coupon', 'yay_reviews' ),
						'registered_account_required' => __( 'Registered-account email is required', 'yay_reviews' ),
						'registered_account_desc'     => __( 'Only send coupons if author\'s email is registered an account', 'yay_reviews' ),
						'upload_required_label'       => __( 'Upload Required', 'yay_reviews' ),
						'upload_required_desc'        => __( 'Only send coupons for reviews including photos or videos', 'yay_reviews' ),
						'verified_owner_required'     => __( 'Verified owner is required', 'yay_reviews' ),
						'verified_owner_desc'         => __( 'Only send coupon for reviews from purchased customers.', 'yay_reviews' ),
						'stars'                       => __( 'stars', 'yay_reviews' ),
						'minimum_rating'              => __( 'Minimum required rating', 'yay_reviews' ),
						'minimum_rating_desc'         => __( 'Only send coupons for reviews if rating is equal or greater than this value', 'yay_reviews' ),
						'required_categories'         => __( 'Required categories', 'yay_reviews' ),
						'required_categories_desc'    => __( 'Only reviews on products in these categories can receive coupon', 'yay_reviews' ),
						'exclude_categories'          => __( 'Exclude categories to give coupon', 'yay_reviews' ),
						'exclude_categories_desc'     => __( 'Reviews on products in these categories will not receive coupon', 'yay_reviews' ),
						'required_products'           => __( 'Required Products', 'yay_reviews' ),
						'required_products_desc'      => __( 'Only reviews on selected products can receive coupons. Leave blank to apply for all products', 'yay_reviews' ),
						'exclude_products'            => __( 'Exclude products to give coupon', 'yay_reviews' ),
						'exclude_products_desc'       => __( 'Reviews on these products will not receive coupon', 'yay_reviews' ),
						'email_subject'               => __( 'Email Subject', 'yay_reviews' ),
						'email_heading'               => __( 'Email Heading', 'yay_reviews' ),
						'email_content'               => __( 'Email Content', 'yay_reviews' ),
						'customer_coupon_vars'        => __( '{customer_name} - Customer\'s name<br /><br />{site_title} - Your site title<br /><br />{coupon_code} - The COUPON', 'yay_reviews' ),
						'coupon_text'                 => __( 'Coupon', 'yay_reviews' ),
						'coupons'                     => __( 'Coupons', 'yay_reviews' ),
						'review_reminder_tooltip'     => __( 'If checked, an email will be automatically sent when a customer completes an order to request for a review.', 'yay_reviews' ),
						'order_status'                => __( 'Order Status', 'yay_reviews' ),
						'exclude_emails'              => __( 'Exclude emails', 'yay_reviews' ),
						'search_products'             => __( 'Search Products', 'yay_reviews' ),
						'search_categories'           => __( 'Search Categories', 'yay_reviews' ),
						'custom_from_address'         => __( 'Custom "From" address', 'yay_reviews' ),
						'schedule_time'               => __( 'Schedule time', 'yay_reviews' ),
						'schedule_unit'               => __( 'Schedule unit', 'yay_reviews' ),
						'seconds'                     => __( 'Seconds', 'yay_reviews' ),
						'minutes'                     => __( 'Minutes', 'yay_reviews' ),
						'hours'                       => __( 'Hours', 'yay_reviews' ),
						'days'                        => __( 'Days', 'yay_reviews' ),
						'mail_subject'                => __( 'Mail Subject', 'yay_reviews' ),
						'mail_heading'                => __( 'Mail Heading', 'yay_reviews' ),
						'mail_content'                => __( 'Mail Content', 'yay_reviews' ),
						'customer_reminder_vars'      => __( '{customer_name} - Customer\'s name<br /><br />{order_id} - Order id<br /><br />{site_title} - Your site title<br /><br />{product_table} - The product table', 'yay_reviews' ),
						'review_now_button_text'      => __( 'Button "Review now" text', 'yay_reviews' ),
						'review_now_text_color'       => __( 'Button "Review now" text color', 'yay_reviews' ),
						'review_now_bg_color'         => __( 'Button "Review now" background color', 'yay_reviews' ),
						'button_review_orders'        => __( 'Button Review on My account/orders', 'yay_reviews' ),
						'date'                        => __( 'Date', 'yay_reviews' ),
						'products'                    => __( 'Products', 'yay_reviews' ),
						'choose_products'             => __( 'Choose products', 'yay_reviews' ),
						'categories'                  => __( 'Categories', 'yay_reviews' ),
						'choose_categories'           => __( 'Choose categories', 'yay_reviews' ),
						'ratings'                     => __( 'Ratings', 'yay_reviews' ),
						'one_star'                    => __( '1 star', 'yay_reviews' ),
						'two_stars'                   => __( '2 stars', 'yay_reviews' ),
						'three_stars'                 => __( '3 stars', 'yay_reviews' ),
						'four_stars'                  => __( '4 stars', 'yay_reviews' ),
						'five_stars'                  => __( '5 stars', 'yay_reviews' ),
						'status'                      => __( 'Status', 'yay_reviews' ),
						'pending'                     => __( 'Pending', 'yay_reviews' ),
						'approved'                    => __( 'Approved', 'yay_reviews' ),
						'spam'                        => __( 'Spam', 'yay_reviews' ),
						'trash'                       => __( 'Trash', 'yay_reviews' ),
						'error_prefix'                => __( 'Error                                           : ', 'yay_reviews' ),
						'failed_export'               => __( 'Failed to export reviews.', 'yay_reviews' ),
						'coupon_tooltip'              => __( 'A coupon will be sent to the customer when the review is approved.', 'yay_reviews' ),
					),
				)
			);

			wp_enqueue_script( ScriptName::PAGE_SETTINGS );
			wp_enqueue_style( ScriptName::STYLE_SETTINGS );

			wp_set_script_translations( 'yay-reviews', 'yay_reviews', YAY_REVIEWS_PLUGIN_PATH . 'languages' );
			wp_enqueue_script( 'yay-reviews' );

			wp_localize_script(
				'yay-reviews',
				'yay_reviews_data',
				array(
					'nonce'           => wp_create_nonce( 'yay_reviews_nonce' ),
					'rest_nonce'      => wp_create_nonce( 'wp_rest' ),
					'rest_url'        => get_rest_url( null, YAY_REVIEWS_REST_URL ),
					'order_statuses'  => $order_statuses,
					'upload_max_size' => Helpers::upload_max_size(),
					'upload_max_qty'  => Helpers::upload_max_qty(),
					'i18n'            => array(
						'save'                        => __( 'Save', 'yay_reviews' ),
						'import_reviews'              => __( 'Import Reviews', 'yay_reviews' ),
						'import_reviews_success'      => __( 'Successfully imported reviews.', 'yay_reviews' ),
						'import_reviews_error'        => __( 'Failed to import reviews.', 'yay_reviews' ),
						'import_reviews_invalid_file' => __( 'Invalid file type. Please upload a CSV file.', 'yay_reviews' ),
						'import_reviews_empty_file'   => __( 'CSV file is empty or improperly formatted.', 'yay_reviews' ),
						'review'                      => __( 'Review', 'yay_reviews' ),
						'coupon'                      => __( 'Coupon', 'yay_reviews' ),
						'review_reminder'             => __( 'Review Reminder', 'yay_reviews' ),
						'optional_fields'             => __( 'Optional Fields', 'yay_reviews' ),
						'export_import_reviews'       => __( 'Export/Import Reviews', 'yay_reviews' ),
						'general'                     => __( 'General', 'yay_reviews' ),
						'enable'                      => __( 'Enable', 'yay_reviews' ),
						'settings_saved'              => __( 'Settings saved successfully.', 'yay_reviews' ),
						'failed_load_state'           => __( 'Failed to load initial state.', 'yay_reviews' ),
						'failed_save_settings'        => __( 'Failed to save settings.', 'yay_reviews' ),
						'preview_email'               => __( 'Preview email', 'yay_reviews' ),
						'save_settings'               => __( 'Save Settings', 'yay_reviews' ),
						'close'                       => __( 'Close', 'yay_reviews' ),
						'submit'                      => __( 'Submit', 'yay_reviews' ),
						'export'                      => __( 'Export', 'yay_reviews' ),
						'import'                      => __( 'Import', 'yay_reviews' ),
						'item_cloned'                 => __( 'Item cloned successfully.', 'yay_reviews' ),
						'item_removed'                => __( 'Item removed successfully.', 'yay_reviews' ),
						'last_item_delete_error'      => __( 'The last item could not be deleted.', 'yay_reviews' ),
						'import_success'              => __( 'Imported successfully.', 'yay_reviews' ),
						'file_upload_failed'          => __( 'File upload failed.', 'yay_reviews' ),
						'click_drag_import'           => __( 'Click or drag file to this area to import', 'yay_reviews' ),
						'fields'                      => __( 'Fields                                          : ', 'yay_reviews' ),
						'reviews_anchor_link'         => __( 'Reviews Anchor Link', 'yay_reviews' ),
						'include_photos_videos'       => __( 'Include photos & videos', 'yay_reviews' ),
						'upload_required'             => __( 'Upload required', 'yay_reviews' ),
						'max_upload_file_size'        => __( 'Maximum upload file size', 'yay_reviews' ),
						'max_upload_file_qty'         => __( 'Maximum upload file quantity', 'yay_reviews' ),
						'enable_gdpr_checkbox'        => __( 'Enable GDPR Checkbox', 'yay_reviews' ),
						'gdpr_message'                => __( 'GDPR Message', 'yay_reviews' ),
						'tooltip_photos_videos'       => __( 'Allow customers to attach photos and videos to their reviews.', 'yay_reviews' ),
						'tooltip_upload_required'     => __( 'Reviews must include a photo or a video to be uploaded.', 'yay_reviews' ),
						'tooltip_max_file_size'       => __( 'The maximum size of a single picture or a video can be uploaded.', 'yay_reviews' ),
						'tooltip_max_file_qty'        => __( 'The maximum quantity of photos and videos can be uploaded with a review.', 'yay_reviews' ),
						'name_asterisk'               => __( 'Name (*)', 'yay_reviews' ),
						'name_desc'                   => __( '[a-zA-z0-9_] are allowed. Eg                    : your-age', 'yay_reviews' ),
						'label_text'                  => __( 'Label', 'yay_reviews' ),
						'label_desc'                  => __( 'Eg                                              : Your Age', 'yay_reviews' ),
						'type_text'                   => __( 'Type', 'yay_reviews' ),
						'text_field'                  => __( 'Text Field', 'yay_reviews' ),
						'textarea'                    => __( 'Textarea', 'yay_reviews' ),
						'dropdown'                    => __( 'Dropdown', 'yay_reviews' ),
						'value_text'                  => __( 'Value', 'yay_reviews' ),
						'value_desc'                  => __( 'If type is dropdown, the value will be like this: Value 1|Value 2|Value 3', 'yay_reviews' ),
						'failed_preview_email'        => __( 'Failed to preview email.', 'yay_reviews' ),
						'title'                       => __( 'Title', 'yay_reviews' ),
						'title_desc'                  => __( 'Type whatever you want', 'yay_reviews' ),
						'choose_coupon'               => __( 'Choose a coupon', 'yay_reviews' ),
						'registered_account_required' => __( 'Registered-account email is required', 'yay_reviews' ),
						'registered_account_desc'     => __( 'Only send coupons if author\'s email is registered an account', 'yay_reviews' ),
						'upload_required_label'       => __( 'Upload Required', 'yay_reviews' ),
						'upload_required_desc'        => __( 'Only send coupons for reviews including photos or videos', 'yay_reviews' ),
						'verified_owner_required'     => __( 'Verified owner is required', 'yay_reviews' ),
						'verified_owner_desc'         => __( 'Only send coupon for reviews from purchased customers.', 'yay_reviews' ),
						'stars'                       => __( 'stars', 'yay_reviews' ),
						'minimum_rating'              => __( 'Minimum required rating', 'yay_reviews' ),
						'minimum_rating_desc'         => __( 'Only send coupons for reviews if rating is equal or greater than this value', 'yay_reviews' ),
						'required_categories'         => __( 'Required categories', 'yay_reviews' ),
						'required_categories_desc'    => __( 'Only reviews on products in these categories can receive coupon', 'yay_reviews' ),
						'exclude_categories'          => __( 'Exclude categories to give coupon', 'yay_reviews' ),
						'exclude_categories_desc'     => __( 'Reviews on products in these categories will not receive coupon', 'yay_reviews' ),
						'required_products'           => __( 'Required Products', 'yay_reviews' ),
						'required_products_desc'      => __( 'Only reviews on selected products can receive coupons. Leave blank to apply for all products', 'yay_reviews' ),
						'exclude_products'            => __( 'Exclude products to give coupon', 'yay_reviews' ),
						'exclude_products_desc'       => __( 'Reviews on these products will not receive coupon', 'yay_reviews' ),
						'email_subject'               => __( 'Email Subject', 'yay_reviews' ),
						'email_heading'               => __( 'Email Heading', 'yay_reviews' ),
						'email_content'               => __( 'Email Content', 'yay_reviews' ),
						'customer_coupon_vars'        => __( '{customer_name} - Customer\'s name<br /><br />{site_title} - Your site title<br /><br />{coupon_code} - The COUPON', 'yay_reviews' ),
						'coupon_text'                 => __( 'Coupon', 'yay_reviews' ),
						'coupons'                     => __( 'Coupons', 'yay_reviews' ),
						'review_reminder_tooltip'     => __( 'If checked, an email will be automatically sent when a customer completes an order to request for a review.', 'yay_reviews' ),
						'order_status'                => __( 'Order Status', 'yay_reviews' ),
						'exclude_emails'              => __( 'Exclude emails', 'yay_reviews' ),
						'search_products'             => __( 'Search Products', 'yay_reviews' ),
						'search_categories'           => __( 'Search Categories', 'yay_reviews' ),
						'custom_from_address'         => __( 'Custom "From" address', 'yay_reviews' ),
						'schedule_time'               => __( 'Schedule time', 'yay_reviews' ),
						'schedule_unit'               => __( 'Schedule unit', 'yay_reviews' ),
						'seconds'                     => __( 'Seconds', 'yay_reviews' ),
						'minutes'                     => __( 'Minutes', 'yay_reviews' ),
						'hours'                       => __( 'Hours', 'yay_reviews' ),
						'days'                        => __( 'Days', 'yay_reviews' ),
						'mail_subject'                => __( 'Mail Subject', 'yay_reviews' ),
						'mail_heading'                => __( 'Mail Heading', 'yay_reviews' ),
						'mail_content'                => __( 'Mail Content', 'yay_reviews' ),
						'customer_reminder_vars'      => __( '{customer_name} - Customer\'s name<br /><br />{order_id} - Order id<br /><br />{site_title} - Your site title<br /><br />{product_table} - The product table', 'yay_reviews' ),
						'review_now_button_text'      => __( 'Button "Review now" text', 'yay_reviews' ),
						'review_now_text_color'       => __( 'Button "Review now" text color', 'yay_reviews' ),
						'review_now_bg_color'         => __( 'Button "Review now" background color', 'yay_reviews' ),
						'button_review_orders'        => __( 'Button Review on My account/orders', 'yay_reviews' ),
						'date'                        => __( 'Date', 'yay_reviews' ),
						'products'                    => __( 'Products', 'yay_reviews' ),
						'choose_products'             => __( 'Choose products', 'yay_reviews' ),
						'categories'                  => __( 'Categories', 'yay_reviews' ),
						'choose_categories'           => __( 'Choose categories', 'yay_reviews' ),
						'ratings'                     => __( 'Ratings', 'yay_reviews' ),
						'one_star'                    => __( '1 star', 'yay_reviews' ),
						'two_stars'                   => __( '2 stars', 'yay_reviews' ),
						'three_stars'                 => __( '3 stars', 'yay_reviews' ),
						'four_stars'                  => __( '4 stars', 'yay_reviews' ),
						'five_stars'                  => __( '5 stars', 'yay_reviews' ),
						'status'                      => __( 'Status', 'yay_reviews' ),
						'pending'                     => __( 'Pending', 'yay_reviews' ),
						'approved'                    => __( 'Approved', 'yay_reviews' ),
						'spam'                        => __( 'Spam', 'yay_reviews' ),
						'trash'                       => __( 'Trash', 'yay_reviews' ),
						'error_prefix'                => __( 'Error                                           : ', 'yay_reviews' ),
						'failed_export'               => __( 'Failed to export reviews.', 'yay_reviews' ),
						'coupon_tooltip'              => __( 'A coupon will be sent to the customer when the review is approved.', 'yay_reviews' ),
					),
				)
			);
		}

		wp_enqueue_style( 'yay-reviews-style', YAY_REVIEWS_PLUGIN_URL . 'assets/admin/css/yay-reviews.css', array(), '1.0' );
		wp_enqueue_script( 'yay-reviews-script', YAY_REVIEWS_PLUGIN_URL . 'assets/admin/js/yay-reviews.js', array( 'jquery' ), '1.0', true );
	}
	public function wc_template( $template, $template_name, $args, $template_path, $default_path ) {
		if ( $template_name == 'yay_reviews_reminder_reviews.php' ) {
			$template = YAY_REVIEWS_VIEW_PATH . 'emails/' . $template_name;
		}
		return $template;
	}
	public function woocommerce_new_order( $order_id, $force ) {
		if ( get_post_meta( $order_id, '_yay_reviews_scheduled', true ) ) {
			return;
		}
		update_post_meta( $order_id, '_yay_reviews_scheduled', 'yes' );

		$time = time();

		$settings       = Helpers::get_all_settings();
		$reminder       = $settings['reviewReminder'];
		$schedule_value = (int) $reminder['schedule_value'];
		if ( $schedule_value > 0 ) {
			if ( $reminder['schedule_unit'] == 'seconds' ) {
				$time += $schedule_value;
			} elseif ( $reminder['schedule_unit'] == 'minutes' ) {
				$time += $schedule_value * 60;
			} elseif ( $reminder['schedule_unit'] == 'hours' ) {
				$time += $schedule_value * 60 * 60;
			} elseif ( $reminder['schedule_unit'] == 'days' ) {
				$time += $schedule_value * 60 * 60 * 24;
			}
		}

		wp_schedule_single_event( $time, 'yay_reviews_send_delayed_reminder_email', array( $order_id ) );
	}
	public function send_review_reminder_email( $order_id ) {
		if ( ! $order_id ) {
			return;
		}

		$settings = Helpers::get_all_settings();

		$will_send      = false;
		$reviewReminder = $settings['reviewReminder'];

		$order       = wc_get_order( $order_id );
		$order_email = $order->get_billing_email();

		//check Exclude emails
		if ( count( $reviewReminder['exclude_emails'] ) > 0 ) {
			$will_send = ! in_array( $order_email, $reviewReminder['exclude_emails'] );
		}

		if ( ! $will_send ) {
			return;
		}

		$items = $order->get_items();

		$product_ids = array();
		foreach ( $items as $item ) {
			$product_ids[] = $item->get_product_id();
		}
		$product_ids = array_unique( $product_ids );

		$user_id = $order->get_user_id();
		if ( ! $user_id ) {
			$user = get_user_by( 'email', $order_email );
			if ( $user ) {
				$user_id = $user->ID;
			}
		}
		if ( $user_id ) {
			//check if this user's not reviewed yet
			$reviewed_products = get_user_meta( $user_id, '_yay_reviews_reviewed_product', true );
			if ( ! is_array( $reviewed_products ) ) {
				$reviewed_products = array();
			}
			$reviewed_products     = array_map( 'intval', $reviewed_products );
			$not_reviewed_products = array_diff( $product_ids, $reviewed_products );
			if ( count( $not_reviewed_products ) > 0 ) {
				$product_ids = $not_reviewed_products;
				$will_send   = true;
			} else {
				$will_send = false;
			}
		}

		if ( ! $will_send ) {
			return;
		}
		//check Exclude products
		if ( count( $reviewReminder['exclude_products'] ) > 0 ) {
			foreach ( $product_ids as $k => $id ) {
				if ( in_array( $id, $reviewReminder['exclude_products'] ) ) {
					unset( $product_ids[ $k ] );
				}
			}
		}
		//check Exclude Categories
		if ( count( $product_ids ) > 0 && count( $reviewReminder['exclude_categories'] ) > 0 ) {
			foreach ( $product_ids as $k => $id ) {
				$product = wc_get_product( $id );
				if ( $product ) {
					$category_ids = $product->get_category_ids();
					foreach ( $category_ids as $cat_id ) {
						if ( in_array( $cat_id, $reviewReminder['exclude_categories'] ) ) {
							unset( $product_ids[ $k ] );
							break;
						}
					}
				}
			}
		}
		if ( count( $product_ids ) > 0 ) {
			// $email_template = $reviewReminder['email_template'];
			$email_subject = trim( $reviewReminder['email_subject'] );
			if ( empty( $email_subject ) ) {
				$email_subject = esc_html__( 'How was your recent purchase? We\'d love to hear your feedback!', 'yay_reviews' );
			}
			$email_content = trim( $reviewReminder['email_content'] );
			if ( empty( $email_content ) ) {
				$email_content = '';
			}

			$first_name    = $order->get_billing_first_name();
			$last_name     = $order->get_billing_last_name();
			$customer_name = $first_name . ' ' . $last_name;

			$email_content = str_replace( '{customer_name}', $customer_name, $email_content );
			$email_content = str_replace( '{site_title}', get_bloginfo( 'name' ), $email_content );
			$email_content = str_replace( '{order_id}', $order_id, $email_content );

			//table of products
			$email_data = array(
				'email_review_btn_color'    => $reviewReminder['email_review_btn_color'],
				'email_review_btn_bg_color' => $reviewReminder['email_review_btn_bg_color'],
				'email_review_btn_text'     => $reviewReminder['email_review_btn_text'],
				'email_heading'             => $reviewReminder['email_heading'],
			);
			foreach ( $email_data as $k => $v ) {
				if ( empty( trim( $v ) ) ) {
					unset( $email_data[ $k ] );
				}
			}
			$table         = Helpers::get_table_of_products( array( 'post__in' => $product_ids ), -1, $email_data );
			$email_content = str_replace( '{product_table}', $table, $email_content );

			$template_path = 'yay_reviews_reminder_reviews.php';
			ob_start();
			wc_get_template(
				$template_path,
				array(
					'email_heading' => $email_data['email_heading'],
					'email'         => null,
					'email_content' => $email_content,
				)
			);
			$email_content = ob_get_clean();
			$headers       = array( 'Content-Type: text/html; charset=UTF-8' );
			//$reviewReminder['custom_from_address']
			add_filter( 'woocommerce_email_from_address', array( __CLASS__, 'woocommerce_email_from_address' ) );
			// file_put_contents( YAY_REVIEWS_PLUGIN_PATH . $order_id . '.html', $email_content);
			wp_mail( $order_email, $email_subject, $email_content, $headers );
			remove_filter( 'woocommerce_email_from_address', array( __CLASS__, 'woocommerce_email_from_address' ) );
		}
	}
	public function woocommerce_email_from_address( $val, $email_obj, $from_email ) {
		$settings       = Helpers::get_all_settings();
		$reviewReminder = $settings['reviewReminder'];
		if ( is_email( $reviewReminder['custom_from_address'] ) ) {
			$val = $reviewReminder['custom_from_address'];
		}
		return $val;
	}
	public function wp_insert_comment( $id, $comment ) {
		if ( $comment->comment_type == 'review' ) {
			$reviewed_products = get_user_meta( $comment->user_id, '_yay_reviews_reviewed_product', true );
			if ( ! is_array( $reviewed_products ) ) {
				$reviewed_products = array();
			}
			$reviewed_products[] = $comment->comment_post_ID;
			update_user_meta( $comment->user_id, '_yay_reviews_reviewed_product', $reviewed_products );
		}
	}
	public function send_coupon_on_review_approval( $comment_id, $comment_approved ) {
		if ( $comment_approved == 1 ) {
			$settings        = Helpers::get_all_settings();
			$coupon_settings = $settings['coupon'];
			// Array of coupon rules
			$coupon_rules = $coupon_settings['coupons'];
			if ( ! is_array( $coupon_rules ) ) {
				$coupon_rules = array();
			}

			// Get the comment and review metadata
			$comment        = get_comment( $comment_id );
			$user_id        = $comment->user_id;
			$customer_email = $comment->comment_author_email; // Author's email
			$customer_name  = $comment->comment_author; // Author's name
			$rating         = get_comment_meta( $comment_id, 'rating', true );

			$photos = get_comment_meta( $comment_id, 'yay_reviews_photos', true );

			$product_id = $comment->comment_post_ID;

			// Get the product categories
			$product_categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );

			// Check if the customer has at least one order
			if ( $user_id > 0 ) {
				// If a registered user, get order count from user ID
				$order_count = wc_get_customer_order_count( $user_id );
			} else {
				// For guest reviews, get customer ID by email and calculate order count
				$customer    = get_user_by( 'email', $customer_email );
				$order_count = $customer ? wc_get_customer_order_count( $customer->ID ) : 0;
			}

			// Loop through coupon rules to find a matching one
			foreach ( $coupon_rules as $rule ) {
				$required_categories = array_column( $rule['required_categories'], 'value' );
				$exclude_categories  = array_column( $rule['exclude_categories'], 'value' );

				$required_products = array_column( $rule['required_products'], 'value' );
				$exclude_products  = array_column( $rule['exclude_products'], 'value' );
				// Check if the review meets the rule's conditions
				if (
					( ! $rule['only_registered_account'] || ( $rule['only_registered_account'] && email_exists( $customer_email ) ) ) && // Check if the email belongs to a registered user
					( ! $rule['upload_required'] || ( $rule['upload_required'] && ! empty( $photos ) ) ) &&
					( ! $rule['only_verified_owner'] || ( $rule['only_verified_owner'] && $order_count > 0 ) ) &&
					( $rating >= $rule['minimum_rating'] ) &&
					//This is an AND comparison; all values of $product_categories must be within $required_categories in order to meet the condition.
					( empty( array_diff( $required_categories, $product_categories ) ) ) &&
					//All values of $product_categories must not be in $exclude_categories in order to meet the condition. In other words, if even one value of $product_categories is in $exclude_categories, the condition will not be met.
					( empty( array_intersect( $exclude_categories, $product_categories ) ) ) &&
					( in_array( $product_id, $required_products ) ) &&
					( ! in_array( $product_id, $exclude_products ) )
				) {
					// If the user is registered, get their info
					if ( $user_id ) {
						$user_info      = get_userdata( $user_id );
						$customer_email = $user_info->user_email;
						$customer_name  = $user_info->display_name;
					}

					// Prepare email content
					$email_content = str_replace(
						array( '{customer_name}', '{site_title}', '{coupon_code}' ),
						array( $customer_name, get_bloginfo( 'name' ), $rule['coupon_code']['label'] ),
						$rule['email_content']
					);

					ob_start();
					wc_get_template(
						'yay_reviews_reminder_reviews.php',
						array(
							'email_heading' => $rule['email_heading'],
							'email'         => null,
							'email_content' => $email_content,
						)
					);
					$email_content = ob_get_clean();
					// Send the email
					wp_mail(
						$customer_email,
						$rule['email_subject'],
						$email_content,
						array( 'Content-Type: text/html; charset=UTF-8' )
					);

					// Break the loop after sending the email for the first matching rule
					break;
				}
			}
		}
	}
}