<?php

namespace YayRev\Emails\PlaceholderProcessors;

use YayRev\Addons\Reminder\ReminderAddonController;
use YayRev\Classes\Products;

/**
 * ReminderPlaceholderProcessor is a class that processes placeholders for the reminder email.
 */
class ReminderPlaceholderProcessor extends BaseProcessors {

	/**
	 * The default placeholders.
	 */
	public const DEFAULT_PLACEHOLDERS = array(
		'{order_date}'      => '',
		'{order_number}'    => '',
		'{customer_name}'   => '',
		'{site_title}'      => '',
		'{review_products}' => '',
	);

	/**
	 * Get the placeholders.
	 *
	 * @return array The placeholders.
	 */
	public function get_placeholders() {
		return array(
			'{order_date}'      => $this->get_order_date(),
			'{order_number}'    => $this->get_order_number(),
			'{customer_name}'   => $this->get_customer_name(),
			'{site_title}'      => $this->get_site_title(),
			'{review_products}' => $this->get_review_products(),
		);
	}

	/**
	 * Check if the order is valid.
	 *
	 * @return bool True if the order is valid, false otherwise.
	 */
	private function is_valid_order() {
		return ! empty( $this->data['order'] ) && $this->data['order'] instanceof \WC_Order;
	}

	/**
	 * Get the order date.
	 *
	 * @return string The order date.
	 */
	public function get_order_date() {
		if ( $this->is_sample ) {
			return '2025-01-01';
		}
		if ( ! $this->is_valid_order() ) {
			return '';
		}
		return \wc_format_datetime( $this->data['order']->get_date_created() );
	}

	/**
	 * Get the order number.
	 *
	 * @return string The order number.
	 */
	public function get_order_number() {
		if ( $this->is_sample ) {
			return '123456';
		}
		if ( ! $this->is_valid_order() ) {
			return '';
		}
		return $this->data['order']->get_order_number();
	}

	/**
	 * Get the customer name.
	 *
	 * @return string The customer name.
	 */
	public function get_customer_name() {
		if ( $this->is_sample ) {
			return 'John Doe';
		}
		if ( ! $this->is_valid_order() ) {
			return '';
		}
		return $this->data['order']->get_formatted_billing_full_name();
	}

	/**
	 * Get the site title.
	 *
	 * @return string The site title.
	 */
	public function get_site_title() {
		return get_bloginfo( 'name' );
	}

	/**
	 * Get the review products.
	 *
	 * @return string The review products.
	 */
	public function get_review_products() {
		if ( $this->is_sample ) {
			return \wc_get_template_html(
				'emails/review-products.php',
				array(
					'product_list' => self::get_sample_products(),
				),
				'',
				YAYREV_PLUGIN_PATH . 'views/'
			);

		}
		if ( ! $this->is_valid_order() ) {
			return '';
		}

		$order = $this->data['order'];

		$products_in_order = array();
		$items             = $order->get_items();
		foreach ( $items as $item ) {
			$products_in_order[] = $item->get_product_id();
		}

		if ( empty( $products_in_order ) ) {
			return '';
		}
		$remind_products_ids = $this->filter_products( $products_in_order );
		$remind_products     = array();
		foreach ( $remind_products_ids as $product_id ) {
			$remind_products[] = \wc_get_product( $product_id );
		}
		if ( empty( $remind_products ) ) {
			return '';
		}

		return \wc_get_template_html(
			'emails/review-products.php',
			array(
				'product_list' => $remind_products,
			),
			'',
			YAYREV_PLUGIN_PATH . 'views/'
		);
	}

	/**
	 * Get the sample products.
	 *
	 * @return array The sample products.
	 */
	public static function get_sample_products() {
		$products_data = array(
			array(
				'name'              => 'Sample Product 1',
				'regular_price'     => '99.99',
				'sale_price'        => '79.99',
				'sku'               => 'SP001',
				'short_description' => 'This is a sample product description for testing the email template. It includes some basic information about the product.',
				'average_rating'    => 4.5,
			),
			array(
				'name'              => 'Sample Product 2',
				'regular_price'     => '149.99',
				'sale_price'        => '129.99',
				'sku'               => 'SP002',
				'short_description' => 'Another sample product with a different price point and description for testing purposes.',
				'average_rating'    => 5,
			),
		);

		return array_map(
			function( $product_data ) {
				$product = new \WC_Product_Simple();
				$product->set_name( $product_data['name'] );
				$product->set_regular_price( $product_data['regular_price'] );
				$product->set_sale_price( $product_data['sale_price'] );
				$product->set_sku( $product_data['sku'] );
				$product->set_short_description( $product_data['short_description'] );
				$product->set_average_rating( $product_data['average_rating'] );
				return $product;
			},
			$products_data
		);
	}

	/**
	 * Filter the products.
	 *
	 * @param array $product_in_order The products in the order.
	 * @return array The filtered products.
	 */
	public function filter_products( $product_in_order ) {
		$reminder_settings      = ReminderAddonController::get_reminder_settings();
		$max_products_per_email = $reminder_settings['max_products_per_email'];
		$product_scope          = $reminder_settings['product_scope'];

		if ( 'all' === $product_scope ) {
			return $product_in_order;
		}

		if ( '' === $max_products_per_email ) { // $max_products_per_email is empty it means no limit.
			$max_products_per_email = 100; // Just 100 because it's impossible to have more than 100 products in an order.
		}

		if ( 'normal' === $product_scope ) {
			return array_slice( $product_in_order, 0, $max_products_per_email );
		}

		$remind_product_ids = array();

		$product_ids = Products::get_products_by_scope( $product_scope );
		foreach ( $product_ids as $product_id ) {
			if ( count( $remind_product_ids ) >= $max_products_per_email ) {
				break;
			}
			if ( in_array( $product_id, $product_in_order ) ) {
				$remind_product_ids[] = $product_id;
			}
		}
		return $remind_product_ids;
	}
}
