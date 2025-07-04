<?php
defined( 'ABSPATH' ) || exit;

?>

<div style="text-align: center; font-size: 0;">
	<?php
	foreach ( $product_list as $product ) :
		$product_id    = $product->get_id();
		$product_name  = $product->get_name();
		$product_image = wp_get_attachment_image_src( get_post_thumbnail_id( $product_id ), array( 150, 150 ) );
		if ( ! $product_image ) {
			if ( has_post_thumbnail( $product_id ) ) {
				$product_image_url = get_the_post_thumbnail_url( $product_id, array( 150, 150 ) );
			} else {
				$product_image_url = wc_placeholder_img_src( array( 150, 150 ) );
			}
		} else {
			$product_image_url = $product_image[0];
		}
		$product_link = get_permalink( $product_id ) . '#reviews';

		$rating = intval( $product->get_average_rating() );

		?>
		<div style="display: inline-block; margin: 8px; vertical-align: top; font-size: 14px; max-width: 200px;">
			<div style="background: #fff; border: 1px solid #f2f2f2; border-radius: 3px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 12px;">
				<div style="width: 150px; height: 150px; margin: 0 auto 8px auto; border-radius: 3px;">
					<img src="<?php echo esc_url( $product_image_url ); ?>" alt="<?php echo esc_html__( 'Product Image', 'yay-reviews' ); ?>" style="width: 100%; height: 100%; object-fit: contain; border-radius: 5px; margin: 0;">
				</div>
				<div style="font-size: 16px; line-height: 24px; margin: 12px 0; color: #232323; text-align: center;">
					<?php echo esc_html( $product_name ); ?>
				</div>
				<div style="color: #FFA500; text-align: center; font-size: 20px; margin-bottom: 8px;">
					<?php
					for ( $i = 1; $i <= 5; $i++ ) {
						if ( $i <= $rating ) {
							echo '★';
						} else {
							echo '☆';
						}
					}
					?>
				</div>
				<div style="font-size: 14px; background-color: #027C42; text-align: center; border-radius: 6px; width: max-content; margin: 0 auto;">
					<a href="<?php echo esc_url( $product_link ); ?>" target="_blank" style="font-weight: 500;line-height: 20px; color: #fff; text-decoration: none; padding: 8px 12px; display: block;">
						<?php echo esc_html__( 'Leave a review', 'yay-reviews' ); ?>
					</a>
				</div>
			</div>
		</div>
	<?php endforeach; ?>
</div>
