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
					'methods'             => 'POST',
					'callback'            => array( $this, 'post_coupon' ),
					'permission_callback' => array( $this, 'permission_callback' ),
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

		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'/emails-queue',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_emails_queue' ),
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
			update_option( 'woocommerce_yay_reviews_reminder_settings', $reminder_email );
		}
		if ( ! empty( $reward_email ) ) {
			$reward_email['subject'] = $data['email']['reward']['subject'];
			$reward_email['heading'] = $data['email']['reward']['heading'];
			$reward_email['content'] = $data['email']['reward']['content'];
			update_option( 'woocommerce_yay_reviews_reward_settings', $reward_email );
		}
		return rest_ensure_response( $response );
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
		$coupon->set_amount( $data['amount'] );
		if ( 'currency' === $data['amount_suffix'] ) {
			$coupon->set_discount_type( 'fixed_cart' );
		} else {
			$coupon->set_discount_type( 'percent' );
		}

		if ( isset( $data['expiry_date'] ) ) {
			$coupon->set_date_expires( $data['expiry_date'] );
		}

		$coupon->save();
		if ( $coupon->get_id() ) {
			return rest_ensure_response(
				array(
					'coupon'    => array(
						'id'           => (string) $coupon->get_id(),
						'code'         => $coupon->get_code(),
						'expired'      => Helpers::is_coupon_expired( $coupon ),
						'out_of_usage' => $coupon->get_usage_limit() !== 0 && $coupon->get_usage_count() >= $coupon->get_usage_limit() ? true : false,
						'edit_url'     => get_edit_post_link( $coupon->get_id(), 'edit' ),
						'amount'       => $coupon->get_amount(),
						'type'         => $coupon->get_discount_type(),
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

	public function send_test_mail( \WP_REST_Request $request ) {
		$data    = $request->get_params();
		$email   = $data['email'];
		$subject = $data['subject'];
		$heading = $data['heading'];
		$content = $data['content'];

		$email_content = str_replace( array( '{customer_name}', '{site_title}', '{coupon_code}', '{review_products}', '{product_name}' ), array( 'John Doe', get_bloginfo( 'name' ), 'YAYREVIEW10', Helpers::get_review_products( 'sample' ), 'Sample Product' ), $content );

		$email_subject = str_replace( '{site_title}', get_bloginfo( 'name' ), $subject );
		$email_heading = str_replace( '{site_title}', get_bloginfo( 'name' ), $heading );
		$args          = array(
			'heading' => $email_heading,
			'content' => $email_content,
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

	public function get_emails_queue( \WP_REST_Request $request ) {
		global $wpdb;

		// Get pagination parameters
		$page     = absint( $request->get_param( 'page' ) ) ?: 1;
		$per_page = absint( $request->get_param( 'per_page' ) ) ?: 10;

		// Calculate offset
		$offset = ( $page - 1 ) * $per_page;

		// Get total count
		$total_count = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}yay_reviews_email_queue" );

		// Get paginated results
		$emails = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}yay_reviews_email_queue ORDER BY created_at DESC LIMIT %d OFFSET %d",
				$per_page,
				$offset
			),
			ARRAY_A
		);

		foreach ( $emails as $key => $email ) {
			// if status is 0, set delivery_time to current time
			$emails[ $key ]['email_data'] = maybe_unserialize( $email['email_data'] );
			if ( '0' === $email['status'] ) {
				$scheduled_event = maybe_unserialize( $email['scheduled_event'] );
				// display delivery time in human readable format
				$emails[ $key ]['delivery_time']   = __( 'Send in', 'yay-reviews' ) . ' ' . human_time_diff( $scheduled_event['timestamp'], current_time( 'timestamp' ) );
				$emails[ $key ]['scheduled_event'] = $scheduled_event;
			} elseif ( '1' === $email['status'] ) {
				$emails[ $key ]['delivery_time'] = $email['created_at'];
				unset( $emails[ $key ]['scheduled_event'] );
			} else {
				$emails[ $key ]['delivery_time'] = '';
				unset( $emails[ $key ]['scheduled_event'] );
			}
		}

		// Calculate pagination info
		$total_pages = ceil( $total_count / $per_page );

		return rest_ensure_response(
			array(
				'emails'     => $emails,
				'pagination' => array(
					'current_page'  => $page,
					'per_page'      => $per_page,
					'total_items'   => (int) $total_count,
					'total_pages'   => $total_pages,
					'has_next_page' => $page < $total_pages,
					'has_prev_page' => $page > 1,
				),
			)
		);
	}

	public function permission_callback() {
		// return true;
		return current_user_can( 'manage_options' );
	}
}
