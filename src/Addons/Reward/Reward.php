<?php

namespace YayRev\Addons\Reward;

use YayRev\Models\CouponModel;

class Reward {

	protected $data;

	protected $coupon;

	public const DEFAULT_DATA = array(
		'id'                  => '',
		'name'                => '',
		'rating_requirement'  => '',
		'enabled'             => true,
		'coupon_type'         => 'one_time_coupon',
		'coupon_value'        => 100,
		'coupon_value_suffix' => 'currency',
		'coupon_id'           => '',
		'send_to'             => 'all_reviewers',
		'frequency'           => 'every_review',
		'rating_requirement'  => 'any',
		'media_requirement'   => 'none',
	);

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
		if ( 'one_time_coupon' === ( $this->data['coupon_type'] ?? self::DEFAULT_DATA['coupon_type'] ) ) {
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
			$coupon->set_meta_data(
				array(
					array(
						'id'    => 0,
						'key'   => 'yayrev_one_time_coupon',
						'value' => 'yes',
					),
				)
			);
			$coupon->save();
		} elseif ( ! empty( $this->data['coupon_id'] ) ) {
			$coupon_id                 = $this->data['coupon_id'];
			$coupon                    = new \WC_Coupon( $coupon_id );
			$is_yayrev_one_time_coupon = 'yes' === $coupon->get_meta( 'yayrev_one_time_coupon', true );

			if ( $is_yayrev_one_time_coupon ) {
				return null;
			}

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

		$send_to            = $this->data['send_to'] ?? self::DEFAULT_DATA['send_to'];
		$rating_requirement = $this->data['rating_requirement'] ?? self::DEFAULT_DATA['rating_requirement'];
		$frequency          = $this->data['frequency'] ?? self::DEFAULT_DATA['frequency'];
		$media_requirement  = $this->data['media_requirement'] ?? self::DEFAULT_DATA['media_requirement'];

		if ( empty( $send_to ) ) {
			return false;
		}

		/**
		 * Do not proceed if the comment is not from a purchased customer
		 */
		if ( 'purchased_customers' === $send_to ) {

			$comment_email      = $comment->comment_author_email;
			$comment_product_id = $comment->comment_post_ID;

			if ( ! \wc_customer_bought_product( $comment_email, $comment_user_id, $comment_product_id ) ) {
				return false;
			}
		}

		/**
		 * Do not proceed if the comment is not from a guest user
		 */
		if ( 'guest_users' === $send_to && ! empty( $comment_user_id ) ) {
			return false;
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

		if ( 'every_review' !== $frequency ) {
			$last_received_reward_time = $this->get_last_time_received( $comment->comment_author_email );

			$args = array(
				'author_email' => $comment->comment_author_email,
				'type'         => 'review',
				'status'       => 'approve',
			);

			$meta_query = array();
			if ( ! empty( $last_received_reward_time ) ) {
				$args['date_query'] = array(
					'after' => $last_received_reward_time,
				);
			}

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

	public function get_recipient_email( $comment ) {
		return $comment->comment_author_email;
	}

	public function get( $key = '' ) {
		return $this->data[ $key ] ?? '';
	}

	public function get_id() {
		return $this->data['id'] ?? '';
	}

	public function get_name() {
		return $this->data['name'] ?? '';
	}

	public function get_rating_requirement() {
		return $this->data['rating_requirement'] ?? self::DEFAULT_DATA['rating_requirement'];
	}

	public function get_media_requirement() {
		return $this->data['media_requirement'] ?? self::DEFAULT_DATA['media_requirement'];
	}

	public function get_frequency() {
		return $this->data['frequency'] ?? self::DEFAULT_DATA['frequency'];
	}

	public function get_last_time_received( $email ) {
		$data = RewardSchema::query_last_customer_reward_by_email( $email );
		if ( ! $data ) {
			return null;
		}
		return $data->created_at;
	}

	public function save_last_time_received( $email, $comment_id ) {
		RewardSchema::insert_reward(
			array(
				'customer_id'             => $this->data['customer_id'] ?? '',
				'customer_email'          => $email,
				'created_at'              => current_time( 'mysql' ),
				'last_trigger_comment_id' => $comment_id,
			)
		);
	}

}
