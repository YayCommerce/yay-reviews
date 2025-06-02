<?php

namespace YayReviews;

use YayReviews\Classes\Helpers;
use YayReviews\Register\ScriptName;

class Admin {

	public function __construct() {
		new AdminMenu();

		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ), 30 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	public function add_meta_boxes() {
		$screen    = get_current_screen();
		$screen_id = $screen ? $screen->id : '';

		if ( 'comment' === $screen_id && isset( $_GET['c'] ) && metadata_exists( 'comment', wc_clean( wp_unslash( $_GET['c'] ) ), 'rating' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			add_meta_box( 'woocommerce-rating-yay-reviews', __( 'Media', 'yayreviews' ), array( $this, 'reviews_metabox_callback' ), 'comment', 'normal', 'high' );
		}
	}
	public function reviews_metabox_callback( $comment ) {
		$media = get_comment_meta( $comment->comment_ID, 'yay_reviews_files', true );
		if ( is_array( $media ) ) {
			Helpers::print_media( $media );
		}
	}

	public function admin_enqueue_scripts( $hook ) {
		$screen    = get_current_screen();
		$screen_id = $screen ? $screen->id : '';

		if ( 'yaycommerce_page_yay-reviews' === $screen_id ) {

			wp_set_script_translations( ScriptName::PAGE_SETTINGS, 'yay_reviews', YAY_REVIEWS_PLUGIN_PATH . 'languages' );
			wp_enqueue_script( ScriptName::PAGE_SETTINGS );

			wp_localize_script(
				ScriptName::PAGE_SETTINGS,
				'yayReviews',
				array(
					'nonce'           => wp_create_nonce( 'yay_reviews_nonce' ),
					'rest_nonce'      => wp_create_nonce( 'wp_rest' ),
					'rest_url'        => esc_url_raw( rest_url() ),
					'rest_base'       => YAY_REVIEWS_REST_URL,
					'image_url'       => YAY_REVIEWS_PLUGIN_URL . 'assets/admin/images',
					'site_title'      => get_bloginfo( 'name' ),
					'upload_max_size' => Helpers::upload_max_size(),
					'upload_max_qty'  => Helpers::upload_max_qty(),
					'i18n'            => array(
						'dashboard'                        => __( 'Dashboard', 'yay-reviews' ),
						'review'                           => __( 'Review', 'yay-reviews' ),
						'optional_fields'                  => __( 'Optional Fields', 'yay-reviews' ),
						'reminder'                         => __( 'Reminder', 'yay-reviews' ),
						'reward'                           => __( 'Reward', 'yay-reviews' ),
						'review_reward'                    => __( 'Review Reward', 'yay-reviews' ),
						'preview_form'                     => __( 'Preview form', 'yay-reviews' ),
						'save'                             => __( 'Save', 'yay-reviews' ),
						'welcome_to_yay_reviews'           => __( 'Welcome to YayReviews', 'yay-reviews' ),
						'welcome_to_yay_reviews_description' => __( 'Your central hub for managing review forms, reminders, coupons, and optional fields, providing an intuitive interface to monitor and optimize customer feedback.', 'yay-reviews' ),
						'go_to'                            => __( 'Go to', 'yay-reviews' ),
						'review_settings'                  => __( 'Review Settings', 'yay-reviews' ),
						'addon_settings'                   => __( 'Addon Settings', 'yay-reviews' ),
						'addon_reminder_description'       => __( 'Sends reminders to customers after buying, encouraging reviews and increasing engagement.', 'yay-reviews' ),
						'addon_review_reward_description'  => __( 'Sends discount coupons for quality reviews meeting set criteria, encouraging great feedback and repeat purchases.', 'yay-reviews' ),
						'addon_optional_fields_description' => __( 'Adds custom fields to review forms, letting customers share tailored feedback for your needs.', 'yay-reviews' ),
						'settings'                         => __( 'Settings', 'yay-reviews' ),
						'upload_media'                     => __( 'Upload Media', 'yay-reviews' ),
						'is_required'                      => __( 'Is Required?', 'yay-reviews' ),
						'select_types'                     => __( 'Select Types', 'yay-reviews' ),
						'video_and_image'                  => __( 'Video & Image', 'yay-reviews' ),
						'only_video'                       => __( 'Only Video', 'yay-reviews' ),
						'only_image'                       => __( 'Only Image', 'yay-reviews' ),
						'media_types'                      => __( 'Media Types', 'yay-reviews' ),
						'maximum_files'                    => __( 'Maximum Files', 'yay-reviews' ),
						'maximum_files_desc'               => __( 'Maximum files customer can upload', 'yay-reviews' ),
						'maximum_file_size'                => __( 'Maximum File Size', 'yay-reviews' ),
						'maximum'                          => __( 'Maximum', 'yay-reviews' ),
						'Kbs'                              => __( 'Kbs', 'yay-reviews' ),
						'field_label'                      => __( 'Field label (optional)', 'yay-reviews' ),
						'field_label_default'              => __( 'Upload media', 'yay-reviews' ),
						'field_description'                => __( 'Field description (optional)', 'yay-reviews' ),
						'field_description_default'        => __( '...', 'yay-reviews' ),
						'data_processing_consent'          => __( 'Data Processing Consent', 'yay-reviews' ),
						'gdpr_message'                     => __( 'GDPR Message', 'yay-reviews' ),
						'gdpr_message_default'             => __( 'I agree with your policy,...', 'yay-reviews' ),
						'before_message'                   => __( 'Before message', 'yay-reviews' ),
						'before_message_default'           => __( 'We value your privacy. By submitting this review, you consent to the processing of your personal data', 'yay-reviews' ),
						'after_message'                    => __( 'After message', 'yay-reviews' ),
						'after_message_default'            => __( 'We value your privacy. By submitting this review, you consent to the processing of your personal data', 'yay-reviews' ),
						'reminder_settings'                => __( 'Reminder Settings', 'yay-reviews' ),
						'send_reminder_when'               => __( 'Send reminder when', 'yay-reviews' ),
						'send_to'                          => __( 'Send to', 'yay-reviews' ),
						'send_a_reminder_email'            => __( 'Send a reminder email', 'yay-reviews' ),
						'minutes'                          => __( 'Minutes', 'yay-reviews' ),
						'hours'                            => __( 'Hours', 'yay-reviews' ),
						'days'                             => __( 'Days', 'yay-reviews' ),
						'max_products_label'               => __( 'Maximum products ( in order ) need to remind reviewing', 'yay-reviews' ),
						'featured_products'                => __( 'Featured products', 'yay-reviews' ),
						'on_sale_products'                 => __( 'On-sale products', 'yay-reviews' ),
						'newest_products'                  => __( 'Newest products', 'yay-reviews' ),
						'high_rated_products'              => __( 'High-rated products', 'yay-reviews' ),
						'low_rated_products'               => __( 'Low-rated products', 'yay-reviews' ),
						'best_selling_products'            => __( 'Best selling products', 'yay-reviews' ),
						'after_order_completed'            => __( 'After order completed', 'yay-reviews' ),
						'leave_empty_to_remind_all'        => __( 'Leave empty to remind all', 'yay-reviews' ),
						'select_filter'                    => __( 'Select filter', 'yay-reviews' ),
						'except_emails'                    => __( 'Except emails', 'yay-reviews' ),
						'send_to_guests'                   => __( 'Send to guests?', 'yay-reviews' ),
						'email_template'                   => __( 'Email template', 'yay-reviews' ),
						'email_heading'                    => __( 'Email heading', 'yay-reviews' ),
						'email_subject'                    => __( 'Email subject', 'yay-reviews' ),
						'email_content'                    => __( 'Email content', 'yay-reviews' ),
						'email_footer'                     => __( 'Email footer', 'yay-reviews' ),
						'customer_name_vars'               => __( "{customer_name} - Customer's name", 'yay-reviews' ),
						'site_title_vars'                  => __( '{site_title} - Your site title', 'yay-reviews' ),
						'product_table_vars'               => __( '{product_table} - Table of products need review', 'yay-reviews' ),
						'preview'                          => __( 'Preview', 'yay-reviews' ),
						'send_test_mail'                   => __( 'Send test mail', 'yay-reviews' ),
						'emails'                           => __( 'Emails', 'yay-reviews' ),
						'emails_settings'                  => __( 'Emails Settings', 'yay-reviews' ),
						'no_reward_added'                  => __( 'No reward added', 'yay-reviews' ),
						'no_reward_added_description_first' => __( 'Sends discount coupons for quality reviews meeting set criteria,', 'yay-reviews' ),
						'no_reward_added_description_second' => __( 'encouraging great feedback and repeat purchases.', 'yay-reviews' ),
						'create_new'                       => __( 'Create new', 'yay-reviews' ),
						'you_have'                         => __( 'You have', 'yay-reviews' ),
						'reward_set'                       => __( 'reward set', 'yay-reviews' ),
						'add_new'                          => __( 'Add new', 'yay-reviews' ),
						'duplicate'                        => __( 'Duplicate', 'yay-reviews' ),
						'delete'                           => __( 'Delete', 'yay-reviews' ),
						'to_users'                         => __( 'To users', 'yay-reviews' ),
						'select_coupon'                    => __( 'Select coupon', 'yay-reviews' ),
						'select_coupon_to_be_sent'         => __( 'Select coupon to be sent', 'yay-reviews' ),
						'change'                           => __( 'Change', 'yay-reviews' ),
						'here'                             => __( 'here', 'yay-reviews' ),
						'review_criteria'                  => __( 'Review criteria', 'yay-reviews' ),
						'only_send_coupon_for_reviews_from_purchased_customers' => __( 'Only send coupon for reviews from purchased customers.', 'yay-reviews' ),
						'guests_can_receive_reward'        => __( 'Guests can receive reward?', 'yay-reviews' ),
						'minimum_required_rating'          => __( 'Minimum required rating', 'yay-reviews' ),
						'minimum_media_files_uploaded'     => __( 'Minimum media files uploaded', 'yay-reviews' ),
						'minimum_required_reviews'         => __( 'Minimum required reviews posted since the last reward?', 'yay-reviews' ),
						'leave_empty_to_receive_reward_after_every_review' => __( 'Leave empty to receive reward after every review', 'yay-reviews' ),
						'coupon_restriction'               => __( 'Coupon restriction', 'yay-reviews' ),
						'inherit_coupon_restriction'       => __( 'Inherit coupon restriction', 'yay-reviews' ),
						'products_in'                      => __( 'Products in', 'yay-reviews' ),
						'no_field_added'                   => __( 'No field added', 'yay-reviews' ),
						'no_field_added_description_first' => __( 'Add custom fields to review forms,', 'yay-reviews' ),
						'no_field_added_description_second' => __( 'letting customers share tailored feedback for your needs.', 'yay-reviews' ),
						'field_set'                        => __( 'field set', 'yay-reviews' ),
						'label'                            => __( 'Label', 'yay-reviews' ),
						'description'                      => __( 'Description', 'yay-reviews' ),
						'type'                             => __( 'Type', 'yay-reviews' ),
						'text'                             => __( 'Text', 'yay-reviews' ),
						'multi_line_text'                  => __( 'Multi-line text', 'yay-reviews' ),
						'dropdown'                         => __( 'Dropdown', 'yay-reviews' ),
						'rating'                           => __( 'Rating', 'yay-reviews' ),
						'multiple_choice'                  => __( 'Multiple choice', 'yay-reviews' ),
						'select_type'                      => __( 'Select type', 'yay-reviews' ),
						'values'                           => __( 'Values', 'yay-reviews' ),
						'values_description'               => __( 'Enter each value in a single row', 'yay-reviews' ),
						'total_starts_points'              => __( 'Total starts/points', 'yay-reviews' ),
						'search_value'                     => __( 'Search value...', 'yay-reviews' ),
						'select_values'                    => __( 'Select values...', 'yay-reviews' ),
						'no_value_found'                   => __( 'No value found.', 'yay-reviews' ),
						'all'                              => __( 'All', 'yay-reviews' ),
						'products_in_order'                => __( 'Products in order', 'yay-reviews' ),
						'completed'                        => __( 'Completed', 'yay-reviews' ),
					),
					'data_settings'   => Helpers::get_all_settings(),
					'sample_values'   => array(
						'{customer_name}' => 'John Doe',
						'{site_title}'    => get_bloginfo( 'name' ),
						'{product_table}' => Helpers::get_product_table( 'sample' ),
					),
				)
			);

				wp_enqueue_script( ScriptName::PAGE_SETTINGS );
				wp_enqueue_style( ScriptName::STYLE_SETTINGS );

		}

		if ( 'comment' === $screen_id ) {
			wp_enqueue_script( 'yay-reviews-media-modal', YAY_REVIEWS_PLUGIN_URL . '/assets/common/js/media-modal.js', array( 'jquery' ), null, true );
			wp_enqueue_style( 'yay-reviews-media-modal', YAY_REVIEWS_PLUGIN_URL . '/assets/common/css/media-modal.css', array(), '1.0' );
			wp_enqueue_style( 'yay-reviews-style', YAY_REVIEWS_PLUGIN_URL . 'assets/admin/css/yay-reviews.css', array(), '1.0' );
		}
	}
}
