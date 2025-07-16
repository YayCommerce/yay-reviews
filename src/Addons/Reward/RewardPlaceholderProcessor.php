<?php

namespace YayReviews\Addons\Reward;

use YayReviews\Emails\PlaceholderProcessors\BaseProcessors;

/**
 * RewardPlaceholderProcessor is a class that processes placeholders for the reward email.
 */
class RewardPlaceholderProcessor extends BaseProcessors {

	/**
	 * The default placeholders.
	 */
	public const DEFAULT_PLACEHOLDERS = array(
		'{customer_name}' => '',
		'{site_title}'    => '',
		'{coupon_code}'   => '',
		'{product_name}'  => '',
	);

	/**
	 * Get the placeholders.
	 *
	 * @return array The placeholders.
	 */
	public function get_placeholders() {
		return array(
			'{customer_name}' => $this->get_customer_name(),
			'{site_title}'    => $this->get_site_title(),
			'{coupon_code}'   => $this->get_coupon_code(),
			'{product_name}'  => $this->get_product_name(),
		);
	}

	/**
	 * Check if the comment is valid.
	 *
	 * @return bool True if the comment is valid, false otherwise.
	 */
	private function is_valid_comment() {
		return ! empty( $this->data['comment'] ) && $this->data['comment'] instanceof \WP_Comment;
	}

	/**
	 * Check if the coupon is valid.
	 *
	 * @return bool True if the coupon is valid, false otherwise.
	 */
	private function is_valid_coupon() {
		return ! empty( $this->data['coupon'] ) && $this->data['coupon'] instanceof \WC_Coupon;
	}

	/**
	 * Check if the product is valid.
	 *
	 * @return bool True if the product is valid, false otherwise.
	 */
	private function is_valid_product() {
		return ! empty( $this->data['product'] ) && $this->data['product'] instanceof \WC_Product;
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
		if ( ! $this->is_valid_comment() ) {
			return '';
		}
		return $this->data['comment']->comment_author;
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
	 * Get the coupon code.
	 *
	 * @return string The coupon code.
	 */
	public function get_coupon_code() {
		if ( $this->is_sample ) {
			return 'YAYREVIEW10';
		}

		if ( ! $this->is_valid_coupon() ) {
			return '';
		}
		return $this->data['coupon']->get_code();
	}

	/**
	 * Get the product name.
	 *
	 * @return string The product name.
	 */
	public function get_product_name() {
		if ( $this->is_sample ) {
			return 'Sample Product';
		}
		if ( ! $this->is_valid_product() ) {
			return '';
		}
		return $this->data['product']->get_name();
	}
}
