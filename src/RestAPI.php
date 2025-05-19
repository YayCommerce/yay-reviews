<?php
namespace YayReviews;

use YayReviews\SingletonTrait;
use YayReviews\Classes\Helpers;

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
		// $this->default_swatch_customize_settings     = Helper::get_default_swatch_customize_settings();
		// $this->default_button_customize_settings     = Helper::get_default_button_customize_settings();
		// $this->default_sold_out_customize_settings   = Helper::get_default_sold_out_settings();
		// $this->default_collection_customize_settings = Helper::get_default_collection_customize_settings();
		// $this->settings_service                      = SettingsService::get_instance();
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
			'/products',
			array(
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
						'limit'  => array(
							'required'          => false,
							'type'              => 'integer',
							'sanitize_callback' => 'absint',
							'default'           => 10,
						),
					),
				),
			)
		);

		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'/categories',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_categories' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => array(
					'search' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
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
			)
		);
	}

	public function post_settings( $request ) {
		$data     = $request->get_params();
		$response = Helpers::update_settings( $data );
		return rest_ensure_response( $response );
	}

	public function get_products( \WP_REST_Request $request ) {
		$search = $request->get_param( 'search' );
		$limit  = $request->get_param( 'limit' );

		$args = array(
			'post_type'      => 'product',
			'posts_per_page' => $limit,
			'post_status'    => 'publish',
		);

		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

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

	public function get_categories( \WP_REST_Request $request ) {
		$search = $request->get_param( 'search' );

		$args = array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
		);
		if ( $search ) {
			$args['search'] = $search;
		}

		$terms = get_terms( $args );

		if ( is_wp_error( $terms ) ) {
			return rest_ensure_response( array( 'error' => $terms->get_error_message() ) );
		}

		$categories = array();
		foreach ( $terms as $term ) {
			$categories[] = array(
				'value' => (string) $term->term_id,
				'label' => $term->name,
			);
		}

		return rest_ensure_response( $categories );
	}

	public function get_coupons( \WP_REST_Request $request ) {
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

		$coupons = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$coupons[] = array(
					'value' => (string) get_the_ID(),
					'label' => get_the_title(),
				);
			}
		}
		wp_reset_postdata();

		return rest_ensure_response( $coupons );
	}

	public function permission_callback() {
		// return true;
		return current_user_can( 'manage_options' );
	}
}
