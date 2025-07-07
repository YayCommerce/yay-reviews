<?php
use YayReviews\Classes\View;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div class="yay-reviews-container">
	<?php
	// Render list of reviews into cards
	foreach ( $reviews as $review ) {
		$product      = wc_get_product( $review->comment_post_ID );
		$product_name = $product->get_name();
		$product_link = get_permalink( $product->get_id() );
		$rating       = get_comment_meta( $review->comment_ID, 'rating', true );
		$date         = get_comment_date( 'F j, Y', $review->comment_ID );
		?>
		<div class="yay-review-card">
			<div class="yay-review-card-header">
				<div class="yay-review-card-product-wrapper">
					<div class="yay-review-card-product">
						<a href="<?php echo esc_url( $product_link ); ?>"><?php echo esc_html( $product_name ); ?></a>
					</div>
					<span class="yay-review-card-separator">-</span>
					<div class="yay-review-card-date">
						<?php echo esc_html( $date ); ?>
					</div>
				</div>
				<div class="yay-review-card-rating">
					<?php echo wc_get_rating_html( $rating ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
			</div>

			<div class="yay-review-card-content">
				<div class="yay-review-card-content-text"><?php echo esc_html( $review->comment_content ); ?></div>
				<div class="yay-review-card-content-media">
					<?php
					$media = get_comment_meta( $review->comment_ID, 'yay_reviews_files', true );
					// Render media like single product media list
					if ( $media ) {
						echo '<div class="yay-review-card-content-media-list">';
						View::load(
							'frontend.media-list',
							array(
								'files'         => $media,
								'comment'       => $review,
								'is_my_account' => true,
							),
							true
						);
						echo '</div>';
					}
					?>
				</div>
			</div>
		</div>
		<?php
	}
	?>
</div>