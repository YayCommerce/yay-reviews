<?php
defined( 'ABSPATH' ) || exit;
?>

<div class="yay-reviews-product-list">
	<ul style="list-style: none; padding: 0; margin: 0;">
		<?php
		foreach ( $product_list as $product ) :
			if ( ! is_a( $product, 'WC_Product' ) ) {
				$product = wc_get_product( $product );
			}
			if ( ! $product ) {
				continue;
			}
			?>
			<li style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 4px;">
				<div style="display: flex; gap: 15px;">
					<div style="flex: 0 0 100px;">
						<?php echo wp_kses_post( $product->get_image( 'thumbnail' ) ); ?>
					</div>
					<div style="flex: 1;">
						<h3 style="margin: 0 0 10px 0; font-size: 16px;">
							<a href="<?php echo esc_url( $product->get_permalink() ); ?>" style="color: #333; text-decoration: none;">
								<?php echo esc_html( $product->get_name() ); ?>
							</a>
						</h3>
						<div style="margin-bottom: 10px; color: #666;">
							<?php echo wp_kses_post( $product->get_short_description() ); ?>
						</div>
						<div style="font-weight: bold; color: #333;">
							<?php
							$regular_price = $product->get_regular_price();
							$sale_price    = $product->get_sale_price();

							if ( $regular_price && $sale_price && $regular_price !== $sale_price ) {
								echo wp_kses_post( '<span style="text-decoration: line-through; color: #999; margin-right: 8px;">' . wc_price( $regular_price ) . '</span>' );
								echo wp_kses_post( '<span style="color: #e2401c;">' . wc_price( $sale_price ) . '</span>' );
							} else {
								echo wp_kses_post( wc_price( $product->get_price() ) );
							}
							?>
						</div>
					</div>
				</div>
			</li>
		<?php endforeach; ?>
	</ul>
</div>