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
		if ( 'yaycommerce_page_yay-reviews' === $hook ) {

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
						'dashboard'                        => __( 'Dashboard', 'yay_reviews' ),
						'review'                           => __( 'Review', 'yay_reviews' ),
						'optional_fields'                  => __( 'Optional Fields', 'yay_reviews' ),
						'reminder'                         => __( 'Reminder', 'yay_reviews' ),
						'reward'                           => __( 'Reward', 'yay_reviews' ),
						'review_reward'                    => __( 'Review Reward', 'yay_reviews' ),
						'preview_form'                     => __( 'Preview form', 'yay_reviews' ),
						'save'                             => __( 'Save', 'yay_reviews' ),
						'welcome_to_yay_reviews'           => __( 'Welcome to YayReviews', 'yay_reviews' ),
						'welcome_to_yay_reviews_description' => __( 'Your central hub for managing review forms, reminders, coupons, and optional fields, providing an intuitive interface to monitor and optimize customer feedback.', 'yay_reviews' ),
						'go_to'                            => __( 'Go to', 'yay_reviews' ),
						'review_settings'                  => __( 'Review Settings', 'yay_reviews' ),
						'addon_settings'                   => __( 'Addon Settings', 'yay_reviews' ),
						'addon_reminder_description'       => __( 'Sends reminders to customers after buying, encouraging reviews and increasing engagement.', 'yay_reviews' ),
						'addon_review_reward_description'  => __( 'Sends discount coupons for quality reviews meeting set criteria, encouraging great feedback and repeat purchases.', 'yay_reviews' ),
						'addon_optional_fields_description' => __( 'Adds custom fields to review forms, letting customers share tailored feedback for your needs.', 'yay_reviews' ),
						'settings'                         => __( 'Settings', 'yay_reviews' ),
						'upload_media'                     => __( 'Upload Media', 'yay_reviews' ),
						'is_required'                      => __( 'Is Required?', 'yay_reviews' ),
						'select_types'                     => __( 'Select Types', 'yay_reviews' ),
						'video_and_image'                  => __( 'Video & Image', 'yay_reviews' ),
						'only_video'                       => __( 'Only Video', 'yay_reviews' ),
						'only_image'                       => __( 'Only Image', 'yay_reviews' ),
						'media_types'                      => __( 'Media Types', 'yay_reviews' ),
						'maximum_files'                    => __( 'Maximum Files', 'yay_reviews' ),
						'maximum_files_desc'               => __( 'Maximum files customer can upload', 'yay_reviews' ),
						'maximum_file_size'                => __( 'Maximum File Size', 'yay_reviews' ),
						'maximum'                          => __( 'Maximum', 'yay_reviews' ),
						'Kbs'                              => __( 'Kbs', 'yay_reviews' ),
						'field_label'                      => __( 'Field label (optional)', 'yay_reviews' ),
						'field_label_default'              => __( 'Upload media', 'yay_reviews' ),
						'field_description'                => __( 'Field description (optional)', 'yay_reviews' ),
						'field_description_default'        => __( '...', 'yay_reviews' ),
						'data_processing_consent'          => __( 'Data Processing Consent', 'yay_reviews' ),
						'gdpr_message'                     => __( 'GDPR Message', 'yay_reviews' ),
						'gdpr_message_default'             => __( 'I agree with your policy,...', 'yay_reviews' ),
						'before_message'                   => __( 'Before message', 'yay_reviews' ),
						'before_message_default'           => __( 'We value your privacy. By submitting this review, you consent to the processing of your personal data', 'yay_reviews' ),
						'after_message'                    => __( 'After message', 'yay_reviews' ),
						'after_message_default'            => __( 'We value your privacy. By submitting this review, you consent to the processing of your personal data', 'yay_reviews' ),
						'reminder_settings'                => __( 'Reminder Settings', 'yay_reviews' ),
						'send_reminder_when'               => __( 'Send reminder when', 'yay_reviews' ),
						'send_to'                          => __( 'Send to', 'yay_reviews' ),
						'send_a_reminder_email'            => __( 'Send a reminder email', 'yay_reviews' ),
						'minutes'                          => __( 'Minutes', 'yay_reviews' ),
						'hours'                            => __( 'Hours', 'yay_reviews' ),
						'days'                             => __( 'Days', 'yay_reviews' ),
						'max_products_label'               => __( 'Maximum products ( in order ) need to remind reviewing', 'yay_reviews' ),
						'featured_products'                => __( 'Featured products', 'yay_reviews' ),
						'on_sale_products'                 => __( 'On-sale products', 'yay_reviews' ),
						'newest_products'                  => __( 'Newest products', 'yay_reviews' ),
						'high_rated_products'              => __( 'High-rated products', 'yay_reviews' ),
						'low_rated_products'               => __( 'Low-rated products', 'yay_reviews' ),
						'best_selling_products'            => __( 'Best selling products', 'yay_reviews' ),
						'after_order_completed'            => __( 'After order completed', 'yay_reviews' ),
						'leave_empty_to_remind_all'        => __( 'Leave empty to remind all', 'yay_reviews' ),
						'select_filter'                    => __( 'Select filter', 'yay_reviews' ),
						'except_emails'                    => __( 'Except emails', 'yay_reviews' ),
						'send_to_guests'                   => __( 'Send to guests?', 'yay_reviews' ),
						'email_template'                   => __( 'Email template', 'yay_reviews' ),
						'email_heading'                    => __( 'Email heading', 'yay_reviews' ),
						'email_subject'                    => __( 'Email subject', 'yay_reviews' ),
						'email_content'                    => __( 'Email content', 'yay_reviews' ),
						'email_footer'                     => __( 'Email footer', 'yay_reviews' ),
						'customer_name_vars'               => __( "{customer_name} - Customer's name", 'yay_reviews' ),
						'site_title_vars'                  => __( '{site_title} - Your site title', 'yay_reviews' ),
						'product_list_vars'                => __( '{product_list} - List products need review', 'yay_reviews' ),
						'preview'                          => __( 'Preview', 'yay_reviews' ),
						'send_test_mail'                   => __( 'Send test mail', 'yay_reviews' ),
						'emails'                           => __( 'Emails', 'yay_reviews' ),
						'emails_settings'                  => __( 'Emails Settings', 'yay_reviews' ),
						'no_reward_added'                  => __( 'No reward added', 'yay_reviews' ),
						'no_reward_added_description_first' => __( 'Sends discount coupons for quality reviews meeting set criteria,', 'yay_reviews' ),
						'no_reward_added_description_second' => __( 'encouraging great feedback and repeat purchases.', 'yay_reviews' ),
						'create_new'                       => __( 'Create new', 'yay_reviews' ),
						'you_have'                         => __( 'You have', 'yay_reviews' ),
						'reward_set'                       => __( 'reward set', 'yay_reviews' ),
						'add_new'                          => __( 'Add new', 'yay_reviews' ),
						'duplicate'                        => __( 'Duplicate', 'yay_reviews' ),
						'delete'                           => __( 'Delete', 'yay_reviews' ),
						'to_users'                         => __( 'To users', 'yay_reviews' ),
						'select_coupon'                    => __( 'Select coupon', 'yay_reviews' ),
						'select_coupon_to_be_sent'         => __( 'Select coupon to be sent', 'yay_reviews' ),
						'change'                           => __( 'Change', 'yay_reviews' ),
						'here'                             => __( 'here', 'yay_reviews' ),
						'review_criteria'                  => __( 'Review criteria', 'yay_reviews' ),
						'only_send_coupon_for_reviews_from_purchased_customers' => __( 'Only send coupon for reviews from purchased customers.', 'yay_reviews' ),
						'guests_can_receive_reward'        => __( 'Guests can receive reward?', 'yay_reviews' ),
						'minimum_required_rating'          => __( 'Minimum required rating', 'yay_reviews' ),
						'minimum_media_files_uploaded'     => __( 'Minimum media files uploaded', 'yay_reviews' ),
						'minimum_required_reviews'         => __( 'Minimum required reviews posted since the last reward?', 'yay_reviews' ),
						'leave_empty_to_receive_reward_after_every_review' => __( 'Leave empty to receive reward after every review', 'yay_reviews' ),
						'coupon_restriction'               => __( 'Coupon restriction', 'yay_reviews' ),
						'inherit_coupon_restriction'       => __( 'Inherit coupon restriction', 'yay_reviews' ),
						'products_in'                      => __( 'Products in', 'yay_reviews' ),
						'no_field_added'                   => __( 'No field added', 'yay_reviews' ),
						'no_field_added_description_first' => __( 'Add custom fields to review forms,', 'yay_reviews' ),
						'no_field_added_description_second' => __( 'letting customers share tailored feedback for your needs.', 'yay_reviews' ),
						'field_set'                        => __( 'field set', 'yay_reviews' ),
						'label'                            => __( 'Label', 'yay_reviews' ),
						'description'                      => __( 'Description', 'yay_reviews' ),
						'type'                             => __( 'Type', 'yay_reviews' ),
						'text'                             => __( 'Text', 'yay_reviews' ),
						'multi_line_text'                  => __( 'Multi-line text', 'yay_reviews' ),
						'dropdown'                         => __( 'Dropdown', 'yay_reviews' ),
						'rating'                           => __( 'Rating', 'yay_reviews' ),
						'multiple_choice'                  => __( 'Multiple choice', 'yay_reviews' ),
						'select_type'                      => __( 'Select type', 'yay_reviews' ),
						'values'                           => __( 'Values', 'yay_reviews' ),
						'values_description'               => __( 'Enter each value in a single row', 'yay_reviews' ),
						'total_starts_points'              => __( 'Total starts/points', 'yay_reviews' ),
						'search_value'                     => __( 'Search value...', 'yay_reviews' ),
						'select_values'                    => __( 'Select values...', 'yay_reviews' ),
						'no_value_found'                   => __( 'No value found.', 'yay_reviews' ),
						'all'                              => __( 'All', 'yay_reviews' ),
						'products_in_order'                => __( 'Products in order', 'yay_reviews' ),
						'completed'                        => __( 'Completed', 'yay_reviews' ),
					),
					'data_settings'   => Helpers::get_all_settings(),
				)
			);

				wp_enqueue_script( ScriptName::PAGE_SETTINGS );
				wp_enqueue_style( ScriptName::STYLE_SETTINGS );

		}

		wp_enqueue_style( 'yay-reviews-style', YAY_REVIEWS_PLUGIN_URL . 'assets/admin/css/yay-reviews.css', array(), '1.0' );
		wp_enqueue_script( 'yay-reviews-script', YAY_REVIEWS_PLUGIN_URL . 'assets/admin/js/yay-reviews.js', array( 'jquery' ), '1.0', true );
	}
}
