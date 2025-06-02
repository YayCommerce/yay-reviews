<?php
namespace YayReviews\Classes;

class Products {
	public static function get_featured_products( $limit = -1 ) {
		// The tax query
		$tax_query[] = array(
			'taxonomy' => 'product_visibility',
			'field'    => 'name',
			'terms'    => 'featured',
			'operator' => 'IN', // or 'NOT IN' to exclude feature products
		);

		// The query
		$query = new \WP_Query(
			array(
				'post_type'           => 'product',
				'post_status'         => 'publish',
				'ignore_sticky_posts' => 1,
				'posts_per_page'      => $limit,
				'order'               => 'asc',
				'tax_query'           => $tax_query,
			)
		);

		$product_ids = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) :
				$query->the_post();
				$product_ids[] = get_the_ID();
			endwhile;
		}
		wp_reset_postdata();

		return $product_ids;
	}

	public static function get_on_sale_products( $limit = -1 ) {
		$query = new \WP_Query(
			array(
				'post_type'           => 'product',
				'post_status'         => 'publish',
				'ignore_sticky_posts' => 1,
				'posts_per_page'      => $limit,
				'order'               => 'asc',
				'meta_query'          => array(
					'relation' => 'OR',
					array(
						'key'     => '_sale_price',
						'value'   => 0,
						'compare' => '>',
						'type'    => 'numeric',
					),
					array(
						'key'     => '_min_variation_sale_price',
						'value'   => 0,
						'compare' => '>',
						'type'    => 'numeric',
					),

				),
				'tax_query'           => array(
					array(
						'taxonomy' => 'product_type',
						'field'    => 'slug',
						'terms'    => 'grouped',
						'operator' => 'NOT IN',
					),
				),
			)
		);

		$product_ids = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) :
				$query->the_post();
				$product_ids[] = get_the_ID();
			endwhile;
		}
		wp_reset_postdata();

		return $product_ids;
	}

	public static function get_newest_products( $limit = -1 ) {
		$args = array(
			'limit'     => $limit,
			'orderby'   => 'date',
			'order'     => 'DESC',
			'status'    => 'publish',
			'tax_query' => array(
				array(
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => 'grouped',
					'operator' => 'NOT IN',
				),
			),
		);

		$query    = new \WC_Product_Query( $args );
		$products = $query->get_products();

		$product_ids = array();
		foreach ( $products as $product ) {
			$product_ids[] = $product->get_id();
		}

		return $product_ids;
	}

	public static function get_high_rated_products( $limit = -1 ) {
		$query = new \WP_Query(
			array(
				'post_type'           => 'product',
				'post_status'         => 'publish',
				'ignore_sticky_posts' => 1,
				'posts_per_page'      => $limit,
				'orderby'             => 'meta_value_num',
				'meta_key'            => '_wc_average_rating',
				'order'               => 'DESC',
			)
		);

		$product_ids = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) :
				$query->the_post();
				$product_ids[] = get_the_ID();
			endwhile;
		}
		wp_reset_postdata();

		return $product_ids;
	}

	public static function get_low_rated_products( $limit = -1 ) {
		$query = new \WP_Query(
			array(
				'post_type'           => 'product',
				'post_status'         => 'publish',
				'ignore_sticky_posts' => 1,
				'posts_per_page'      => $limit,
				'orderby'             => 'meta_value_num',
				'meta_key'            => '_wc_average_rating',
				'order'               => 'ASC',
			)
		);

		$product_ids = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) :
				$query->the_post();
				$product_ids[] = get_the_ID();
			endwhile;
		}
		wp_reset_postdata();

		return $product_ids;
	}

	public static function get_best_selling_products( $limit = -1 ) {
		$query = new \WP_Query(
			array(
				'post_type'           => 'product',
				'post_status'         => 'publish',
				'ignore_sticky_posts' => 1,
				'posts_per_page'      => $limit,
				'orderby'             => 'meta_value_num',
				'meta_key'            => 'total_sales',
				'order'               => 'DESC',
			)
		);

		$product_ids = array();
		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) :
				$query->the_post();
				$product_ids[] = get_the_ID();
			endwhile;
		}
		wp_reset_postdata();

		return $product_ids;
	}

	public static function get_products_by_type( $type ) {
		$product_ids = array();
		switch ( $type ) {
			case 'featured':
				$product_ids = self::get_featured_products();
				break;
			case 'on_sale':
				$product_ids = self::get_on_sale_products();
				break;
			case 'newest':
				$product_ids = self::get_newest_products();
				break;
			case 'high_rated':
				$product_ids = self::get_high_rated_products();
				break;
			case 'low_rated':
				$product_ids = self::get_low_rated_products();
				break;
			case 'best_selling':
				$product_ids = self::get_best_selling_products();
				break;
			default:
				$product_ids = array();
				break;
		}
		return $product_ids;
	}
}
