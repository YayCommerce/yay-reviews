<?php
namespace YayRev;

use YayRev\SingletonTrait;
use YayRev\Models\CouponModel;
use YayRev\Models\QueueModel;
use YayRev\Models\SettingsModel;

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
			YAYREV_REST_URL,
			'/settings',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'save_settings' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);

		register_rest_route(
			YAYREV_REST_URL,
			'/coupons',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'create_coupon' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);

		register_rest_route(
			YAYREV_REST_URL,
			'/send-test-mail',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'send_test_mail' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			)
		);

		register_rest_route(
			YAYREV_REST_URL,
			'/emails-queue',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_emails_queue' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			)
		);
	}

	public function save_settings( $request ) {
		$data       = $request->get_params();
		$saved_data = $data;
		unset( $saved_data['email'] );
		SettingsModel::update_settings( $saved_data );
		do_action( 'yayrev_after_update_settings', $data );
		return rest_ensure_response( true );
	}

	public function create_coupon( \WP_REST_Request $request ) {
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
					'coupon'    => CouponModel::get_coupon_data( $coupon ),
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
		$data          = $request->get_params();
		$email_address = $data['email'];
		$subject       = $data['subject'];
		$email_content = $data['content'];

		$email_subject = str_replace( '{site_title}', get_bloginfo( 'name' ), $subject );
		if ( ! class_exists( 'WC_Email' ) ) {
			\WC()->mailer();
		}
		$email = new \WC_Emails();
		$sent  = $email->send( $email_address, $email_subject, $email_content );

		if ( $sent ) {
			return rest_ensure_response( array( 'message' => 'Email sent successfully' ) );
		} else {
			return rest_ensure_response( array( 'message' => 'Email sending failed' ), 500 );
		}
	}

	public function get_emails_queue( \WP_REST_Request $request ) {

		// Get pagination parameters
		$page     = absint( $request->get_param( 'page' ) ?? 1 );
		$per_page = absint( $request->get_param( 'per_page' ) ?? 10 );

		// Get total count
		$total_count = QueueModel::count();

		// Get paginated results
		$queues = QueueModel::find_all( $page, $per_page );

		$emails = array_map(
			function( $queue ) {
				return $queue->get_object_data();
			},
			$queues
		);

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
