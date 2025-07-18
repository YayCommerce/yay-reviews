<?php

defined( 'ABSPATH' ) || exit;

use YayRev\Classes\Helpers;

$overview_data = Helpers::get_overview_data();

if ( empty( $overview_data ) ) {
	return;
}

$average_rating        = $overview_data['average_rating'];
$total_reviews         = $overview_data['total_reviews'];
$reviews_text          = $overview_data['reviews_text'] ?? 'reviews';
$stars_count           = $overview_data['stars_count'];
$current_rating_filter = isset( $_GET['rating_filter'] ) ? intval( sanitize_text_field( wp_unslash( $_GET['rating_filter'] ) ) ) : null; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

$rating       = intval( $average_rating );
$rating_stars = '';

if ( $rating && \wc_review_ratings_enabled() ) {
	if ( wp_get_theme()->get_template() === 'brandy' ) {
		$rating_stars = \wc_get_template_html(
			'template-parts/rating.php',
			array(
				'rating'          => $rating,
				'rating_count'    => 5,
				'show_only_stars' => true,
				'show_overall'    => false,
				'review_count'    => false,
			)
		);
	} else {
		$rating_stars = wc_get_rating_html( $rating ); // WPCS: XSS ok.
	}
}
?>
<div class="yayrev-reviews-overview">
	<div class="yayrev-reviews-overview__summary">
		<span class="yayrev-reviews-overview__summary-avg-rating"><?php echo esc_html( $average_rating ); ?></span>
		<?php if ( empty( $total_reviews ) ) : ?>
			<span style="font-size:1rem;">(<?php esc_html_e( 'No ratings', 'yay-customer-reviews-woocommerce' ); ?>)</span>
		<?php else : ?>
			<?php echo wp_kses_post( $rating_stars ); ?>
		<?php endif; ?>
		<span class="yayrev-reviews-overview__summary-total-reviews"><?php echo esc_html( $total_reviews ); ?> <?php echo esc_html( $reviews_text ); ?></span>
	</div>
	<div class="yayrev-reviews-overview__filters">
		<?php
		for ( $i = 5; $i >= 1; $i-- ) :
			$count         = isset( $stars_count[ $i ] ) ? $stars_count[ $i ] : 0;
			$percentage    = $total_reviews > 0 ? ( $count / $total_reviews ) * 100 : 0;
			$is_filterable = $count > 0;
			$html_info     = array(
				'tag'         => 'div',
				'class'       => 'yayrev-reviews-overview__filters-item',
				'data-rating' => $i,
			);
			if ( $is_filterable ) {
				$html_info['tag']    = 'a';
				$html_info['href']   = add_query_arg( 'rating_filter', $i ) . '#tab-reviews';
				$html_info['class'] .= ' filterable';
			}
			if ( $i === $current_rating_filter ) {
				$html_info['class'] .= ' active';
			}
			$html_attribute = array_map(
				function ( $key, $value ) {
					return $key . '="' . esc_attr( $value ) . '"';
				},
				array_keys( $html_info ),
				array_values( $html_info )
			);
			$html_tag       = '<' . $html_info['tag'] . ' ' . implode( ' ', $html_attribute ) . '>';
			$close_tag      = '</' . $html_info['tag'] . '>';
			echo wp_kses_post( $html_tag );
			?>
				<span class="yayrev-reviews-overview__filters-item__label"><?php echo esc_html( $i ); ?> ★</span>
				<div class="yayrev-reviews-overview__filters-item__progress-bar">
					<div class="yayrev-reviews-overview__filters-item__progress" style="width: <?php echo esc_attr( $percentage ); ?>%"></div>
				</div>
				<span class="yayrev-reviews-overview__filters-item__count"><?php echo esc_html( $count ); ?></span>
			<?php echo wp_kses_post( $close_tag ); ?>
		<?php endfor; ?>
	</div>
</div>
<?php
if ( $current_rating_filter ) :
	?>
	<div class="yayrev-filter-message">
		<?php
		printf(
			// translators: %1$s: rating, %2$s: see all reviews link
			wp_kses_post( __( 'You are currently viewing the reviews that provided a rating of <strong>%1$s stars</strong>. <a href="%2$s">See all reviews</a>', 'yay-customer-reviews-woocommerce' ) ),
			esc_html( $current_rating_filter ),
			esc_url( remove_query_arg( 'rating_filter' ) . '#tab-reviews' )
		);
		?>
	</div>
	<?php
endif;
