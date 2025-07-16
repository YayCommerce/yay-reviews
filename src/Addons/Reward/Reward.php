<?php

namespace YayReviews\Addons\Reward;

use YayReviews\Classes\Helpers;
use YayReviews\Models\CouponModel;

class Reward {

	protected $data;

	protected $coupon;

	public function __construct( $data = null ) {
		$this->data = $data;
	}

	public function is_active() {
		return ! empty( $this->data['enabled'] );
	}

	public function generate_coupon( $comment ) {
		if ( ! $this->is_active() ) {
			return null;
		}

		if ( ! $this->is_valid_for_comment( $comment ) ) {
			return null;
		}

		$coupon = null;
		if ( 'one_time_coupon' === ( $this->data['coupon_type'] ?? 'manual_coupon' ) ) {
			$coupon_code = CouponModel::generate_unique_coupon_code( 8 );
			if ( ! $coupon_code ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
					error_log( 'YayReviews: Unable to generate unique coupon code for comment ID: ' . $comment->comment_ID ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				}
				return null;
			}
			// TODO: check coupon code exists
			$coupon = new \WC_Coupon();
			// Create new coupon with generated code and usage limit 1
			$coupon_code = strtolower( $coupon_code );
			$coupon->set_code( $coupon_code );
			$coupon->set_amount( $this->data['coupon_value'] );
			if ( 'currency' === $this->data['coupon_value_suffix'] ) {
				$coupon->set_discount_type( 'fixed_cart' );
			} else {
				$coupon->set_discount_type( 'percent' );
			}
			$coupon->set_usage_limit( 1 );
			$coupon->save();
		} elseif ( ! empty( $this->data['coupon_id'] ) ) {
			$coupon_id    = $this->data['coupon_id'];
			$coupon       = new \WC_Coupon( $coupon_id );
			$expired      = CouponModel::is_coupon_expired( $coupon );
			$out_of_usage = $coupon->get_usage_limit() !== 0 && $coupon->get_usage_count() >= $coupon->get_usage_limit() ? true : false;

			if ( $expired || $out_of_usage ) {
				return null;
			}
		}

		return $coupon;

	}

	public function is_valid_for_comment( $comment ) {

		if ( ! $this->is_active() ) {
			return false;
		}

		if ( ! $comment instanceof \WP_Comment ) {
			return false;
		}

		$valid           = true;
		$rating          = (float) get_comment_meta( $comment->comment_ID, 'rating', true );
		$media           = get_comment_meta( $comment->comment_ID, 'yayrev_files', true );
		$comment_user_id = $comment->user_id;

		$send_to            = $this->data['send_to'] ?? '';
		$rating_requirement = $this->data['rating_requirement'] ?? '';
		$frequency          = $this->data['frequency'] ?? '';
		$media_requirement  = $this->data['media_requirement'] ?? '';

		if ( empty( $send_to ) ) {
			return false;
		}

		if ( 'purchased_customers' === $send_to ) {
			if ( empty( $comment_user_id ) ) {
				$valid = false;
			} else {
				$total_orders = Helpers::get_user_orders_total( $comment_user_id );
				if ( 0 === $total_orders ) {
					$valid = false;
				}
			}
		}

		// TODO: change logic
		if ( 'guest_users' === $send_to ) {
			if ( ! empty( $comment_user_id ) ) {
				$valid = false;
			}
		}

		if ( 'less_than_5_stars' === $rating_requirement ) {
			if ( $rating >= 5 ) {
				$valid = false;
			}
		}

		if ( '5_stars' === $rating_requirement ) {
			if ( $rating < 5 ) {
				$valid = false;
			}
		}

		if ( 'none' !== $media_requirement && empty( $media ) ) {
			$valid = false;
		}

		if ( ! empty( $comment_user_id ) && 'every_review' !== $frequency ) {
			$last_received_reward_time = get_user_meta( $comment_user_id, 'last_received_reward_' . $this->data['id'] . '_time', true );

			$args = array(
				'user_id' => $comment_user_id,
				'type'    => 'review',
				'status'  => 'approve',
			);

			if ( ! empty( $last_received_reward_time ) ) {
				$args['date_query'] = array(
					'after' => gmdate( 'Y-m-d H:i:s', $last_received_reward_time ),
				);
			}

			$meta_query = array();
			if ( 'any' !== $rating_requirement ) {
				$meta_query[] = array(
					'key'     => 'rating',
					'value'   => 5,
					'compare' => '5_stars' === $rating_requirement ? '=' : '<',
				);
			}
			if ( 'none' !== $media_requirement ) {
				$meta_query[] = array(
					'key'     => 'yayrev_files',
					'value'   => '',
					'compare' => '!=',
				);
			}
			if ( ! empty( $meta_query ) ) {
				$args['meta_query'] = $meta_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				if ( count( $meta_query ) > 1 ) {
					$args['meta_query']['relation'] = 'AND';
				}
			}

			$user_reviews_count = count( get_comments( $args ) );

			if ( 'every_2_reviews' === $frequency ) {
				if ( $user_reviews_count < 2 ) {
					$valid = false;
				}
			}

			if ( 'every_3_reviews' === $frequency ) {
				if ( $user_reviews_count < 3 ) {
					$valid = false;
				}
			}
		}

		return $valid;

	}

}
