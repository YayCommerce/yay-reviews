<?php

namespace YayReviews\Emails\PlaceholderProcessors;

class RewardPlaceholderProcessor extends BaseProcessors {

	public const DEFAULT_PLACEHOLDERS = array(
		'{customer_name}' => '',
		'{site_title}'    => '',
		'{coupon_code}'   => '',
		'{product_name}'  => '',
	);

	public function get_placeholders() {
		return array(
			'{customer_name}' => $this->get_customer_name(),
			'{site_title}'    => $this->get_site_title(),
			'{coupon_code}'   => $this->get_coupon_code(),
			'{product_name}'  => $this->get_product_name(),
		);
	}

	private function is_valid_comment() {
		return ! empty( $this->data['comment'] ) && $this->data['comment'] instanceof \WP_Comment;
	}

	private function is_valid_coupon() {
		return ! empty( $this->data['coupon'] ) && $this->data['coupon'] instanceof \WC_Coupon;
	}

	private function is_valid_product() {
		return ! empty( $this->data['product'] ) && $this->data['product'] instanceof \WC_Product;
	}

	public function get_customer_name() {
		if ( $this->is_sample ) {
			return 'John Doe';
		}
		if ( ! $this->is_valid_comment() ) {
			return '';
		}
		return $this->data['comment']->comment_author;
	}

	public function get_site_title() {
		return get_bloginfo( 'name' );
	}

	public function get_coupon_code() {
		if ( $this->is_sample ) {
			return 'YAYREVIEW10';
		}

		if ( ! $this->is_valid_coupon() ) {
			return '';
		}
		return $this->data['coupon']->get_code();
	}

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
