<?php

namespace YayReviews;

use YayReviews\SingletonTrait;
use YayReviews\Classes\Helpers;

class Ajax {
	use SingletonTrait;

	protected function __construct() {
		$this->init_hooks();
	}

	protected function init_hooks() {
		add_action( 'wp_ajax_yay_reviews_change_addon_status', array( $this, 'change_addon_status' ) );
	}

	public function change_addon_status() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yay_reviews_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay_reviews' ) ) );
		}
		try {
			$addon_id = isset( $_POST['addon_id'] ) ? sanitize_text_field( $_POST['addon_id'] ) : '';
			$status   = isset( $_POST['status'] ) ? sanitize_text_field( $_POST['status'] ) : '';

			if ( ! empty( $addon_id ) && ! empty( $status ) ) {
				$settings = Helpers::get_all_settings();
				$addons   = $settings['addons'];
				if ( isset( $addons[ $addon_id ] ) ) {
					$addons[ $addon_id ] = 'active' === $status ? true : false;
					$settings['addons']  = $addons;
					Helpers::update_settings( $settings );
				}
				wp_send_json_success( array( 'status' => $status ) );
			}
			wp_send_json_error( array( 'mess' => __( 'Invalid addon id or status', 'yay_reviews' ) ) );
		} catch ( \Exception $e ) {
			return wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}
	}
}
