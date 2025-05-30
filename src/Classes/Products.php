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

		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) :
				$query->the_post();
				$product_ids[] = get_the_ID();
			endwhile;
		}
		wp_reset_postdata();

		return $product_ids;
	}
}
