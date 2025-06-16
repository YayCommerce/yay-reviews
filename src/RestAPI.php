<?php
namespace YayReviews;

use YayReviews\SingletonTrait;
use YayReviews\Classes\Helpers;
use YayReviews\Classes\View;

defined( 'ABSPATH' ) || exit;

/**
 *  Rest API
 */
class RestAPI {

	use SingletonTrait;

	private $default_swatch_customize_settings;
	private $default_button_customize_settings;
	private $default_sold_out_customize_settings;
	private $default_collection_customize_settings;

	private $settings_service;

	protected function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
	}

	/**
	 * Add Yay Reviews Endpoints
	 */
	public function register_rest_api() {
		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'/settings',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'post_settings' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);

		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'/coupons',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_coupons' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'search' => array(
							'required'          => false,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'limit'  => array(
							'required'          => false,
							'type'              => 'integer',
							'sanitize_callback' => 'absint',
							'default'           => 10,
						),
					),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'post_coupon' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);

		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'/products',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_products' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => array(
					'search' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
				'limit'               => array(
					'required'          => false,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'default'           => 10,
				),
			)
		);

		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'/send-test-mail',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'send_test_mail' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			)
		);
	}

	public function post_settings( $request ) {
		$data     = $request->get_params();
		$response = Helpers::update_settings( $data );
		// Update woocommerce email settings
		$reminder_email = get_option( 'woocommerce_yay_reviews_reminder_settings', array() );
		$reward_email   = get_option( 'woocommerce_yay_reviews_reward_settings', array() );
		if ( ! empty( $reminder_email ) ) {
			$reminder_email['subject'] = $data['email']['reminder']['subject'];
			$reminder_email['heading'] = $data['email']['reminder']['heading'];
			$reminder_email['content'] = $data['email']['reminder']['content'];
			$reminder_email['footer']  = $data['email']['reminder']['footer'];
			update_option( 'woocommerce_yay_reviews_reminder_settings', $reminder_email );
		}
		if ( ! empty( $reward_email ) ) {
			$reward_email['subject'] = $data['email']['reward']['subject'];
			$reward_email['heading'] = $data['email']['reward']['heading'];
			$reward_email['content'] = $data['email']['reward']['content'];
			$reward_email['footer']  = $data['email']['reward']['footer'];
			update_option( 'woocommerce_yay_reviews_reward_settings', $reward_email );
		}
		return rest_ensure_response( $response );
	}

	public function get_coupons( \WP_REST_Request $request ) {
		$search = $request->get_param( 'search' );

		$args = array(
			'post_type'      => 'shop_coupon',
			'posts_per_page' => -1,
			's'              => $search,
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
						'expired'      => Helpers::is_coupon_expired( $coupon ),
						'out_of_usage' => $coupon->get_usage_limit() !== 0 && $coupon->get_usage_count() >= $coupon->get_usage_limit() ? true : false,
						'edit_url'     => get_edit_post_link( $coupon->get_id(), 'edit' ),
					);
				}
			}
		}
		wp_reset_postdata();

		return rest_ensure_response( $coupons );
	}

	public function post_coupon( \WP_REST_Request $request ) {
		$data = $request->get_params();
		// check coupon code exists
		$coupon_id = wc_get_coupon_id_by_code( $data['code'] );
		if ( $coupon_id ) {
			return rest_ensure_response(
				array(
					'coupon'    => null,
					'is_exists' => true,
					'message'   => 'Coupon code already exists',
				),
				400
			);
		}

		$coupon = new \WC_Coupon();
		$coupon->set_code( $data['code'] );
		$coupon->set_description( $data['description'] );
		$coupon->set_discount_type( $data['discount_type'] );
		$coupon->set_amount( $data['amount'] );
		$coupon->set_individual_use( $data['individual_use'] );
		$coupon->set_exclude_sale_items( $data['exclude_sale_items'] );
		if ( isset( $data['usage_limit_per_coupon'] ) ) {
			$coupon->set_usage_limit( $data['usage_limit_per_coupon'] );
		}
		if ( isset( $data['usage_limit_per_user'] ) ) {
			$coupon->set_usage_limit_per_user( $data['usage_limit_per_user'] );
		}
		if ( isset( $data['limit_usage_to_x_items'] ) ) {
			$coupon->set_limit_usage_to_x_items( $data['limit_usage_to_x_items'] );
		}
		if ( isset( $data['expiry_date'] ) ) {
			$coupon->set_date_expires( $data['expiry_date'] );
		}
		if ( isset( $data['free_shipping'] ) ) {
			$coupon->set_free_shipping( $data['free_shipping'] );
		}
		if ( isset( $data['minimum_spend'] ) ) {
			$coupon->set_minimum_amount( $data['minimum_spend'] );
		}
		if ( isset( $data['maximum_spend'] ) ) {
			$coupon->set_maximum_amount( $data['maximum_spend'] );
		}
		if ( isset( $data['allowed_emails'] ) ) {
			$email_restrictions = array_map( 'sanitize_email', explode( ',', $data['allowed_emails'] ) );
			$coupon->set_email_restrictions( $email_restrictions );
		}

		if ( isset( $data['products'] ) && ! empty( $data['products'] ) ) {
			$product_ids = array_map( 'absint', $data['products'] );
			$coupon->set_product_ids( $product_ids );
		}
		if ( isset( $data['exclude_products'] ) && ! empty( $data['exclude_products'] ) ) {
			$product_ids = array_map( 'absint', $data['exclude_products'] );
			$coupon->set_excluded_product_ids( $product_ids );
		}
		if ( isset( $data['product_categories'] ) && ! empty( $data['product_categories'] ) ) {
			$product_category_ids = array_map( 'absint', $data['product_categories'] );
			$coupon->set_product_categories( $product_category_ids );
		}
		if ( isset( $data['exclude_product_categories'] ) && ! empty( $data['exclude_product_categories'] ) ) {
			$product_category_ids = array_map( 'absint', $data['exclude_product_categories'] );
			$coupon->set_excluded_product_categories( $product_category_ids );
		}

		$coupon->save();
		if ( $coupon->get_id() ) {
			if ( isset( $data['product_brands'] ) ) {
				$product_brand_ids = array_map( 'absint', $data['product_brands'] );
				update_post_meta( $coupon->get_id(), 'product_brands', $product_brand_ids );

			}
			if ( isset( $data['exclude_product_brands'] ) ) {
				$product_brand_ids = array_map( 'absint', $data['exclude_product_brands'] );
				update_post_meta( $coupon->get_id(), 'exclude_product_brands', $product_brand_ids );
			}
			return rest_ensure_response(
				array(
					'coupon'    => array(
						'id'           => (string) $coupon->get_id(),
						'code'         => $coupon->get_code(),
						'expired'      => Helpers::is_coupon_expired( $coupon ),
						'out_of_usage' => $coupon->get_usage_limit() !== 0 && $coupon->get_usage_count() >= $coupon->get_usage_limit() ? true : false,
						'edit_url'     => get_edit_post_link( $coupon->get_id(), 'edit' ),
					),
					'is_exists' => false,
					'message'   => 'Coupon created successfully',
				)
			);
		} else {
			return rest_ensure_response(
				array(
					'coupon'    => null,
					'is_exists' => false,
					'message'   => 'Failed to create coupon',
				),
				500
			);
		}
	}

	public function get_products( \WP_REST_Request $request ) {
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
				$products[] = array(
					'value' => (string) get_the_ID(),
					'label' => get_the_title(),
				);
			}
		}
		wp_reset_postdata();

		return rest_ensure_response( $products );
	}

	public function send_test_mail( \WP_REST_Request $request ) {
		$data    = $request->get_params();
		$email   = $data['email'];
		$subject = $data['subject'];
		$heading = $data['heading'];
		$content = $data['content'];
		$footer  = $data['footer'];

		$email_content = str_replace( array( '{customer_name}', '{site_title}', '{coupon_code}', '{product_table}' ), array( 'John Doe', get_bloginfo( 'name' ), 'YAYREVIEW10', Helpers::get_products_table( 'sample' ) ), $content );

		$email_subject = str_replace( '{site_title}', get_bloginfo( 'name' ), $subject );
		$email_heading = str_replace( '{site_title}', get_bloginfo( 'name' ), $heading );
		$email_footer  = str_replace( '{site_title}', get_bloginfo( 'name' ), $footer );

		$args          = array(
			'heading' => $email_heading,
			'content' => $email_content,
			'footer'  => $email_footer,
		);
		$email_content = View::load( 'emails.preview-email', $args, false );

		$headers = array(
			'Content-Type' => 'text/html; charset=UTF-8',
		);
		$headers = apply_filters( 'yay_reviews_email_headers', $headers );
		$headers = array_map( 'trim', $headers );
		$headers = array_filter( $headers );
		$headers = array_unique( $headers );

		$headers[] = 'From: ' . get_bloginfo( 'name' ) . ' <' . get_option( 'admin_email' ) . '>';

		$headers[] = 'Reply-To: ' . get_option( 'admin_email' );

		$headers[] = 'Content-Type: text/html; charset=UTF-8';

		$sent = wp_mail( $email, $email_subject, $email_content, $headers );

		if ( $sent ) {
			return rest_ensure_response( array( 'message' => 'Email sent successfully' ) );
		} else {
			return rest_ensure_response( array( 'message' => 'Email sending failed' ), 500 );
		}
	}

	public function permission_callback() {
		// return true;
		return current_user_can( 'manage_options' );
	}
}
