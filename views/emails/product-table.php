<?php
defined( 'ABSPATH' ) || exit;
use Automattic\WooCommerce\Utilities\FeaturesUtil;

$margin_side                = is_rtl() ? 'left' : 'right';
$price_text_align           = 'right';
$email_improvements_enabled = FeaturesUtil::feature_is_enabled( 'email_improvements' );
$image_size                 = $email_improvements_enabled ? array( 48, 48 ) : array( 32, 32 );
?>

<table class="td" cellspacing="0" cellpadding="6" style="width: 100%;border-collapse: collapse; font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif; margin: 20px 0;" border="1">
	<thead>
		<tr>
			<th class="td" scope="col" style="text-align:left;border: 1px solid #eee;padding: 10px;font-size: 14px;"><?php esc_html_e( 'Product', 'yay-reviews' ); ?></th>
			<th class="td" scope="col" style="text-align:left;border: 1px solid #eee;padding: 10px;font-size: 14px;"><?php esc_html_e( 'Short Description', 'yay-reviews' ); ?></th>
			<th class="td" scope="col" style="text-align:<?php echo esc_attr( $price_text_align ); ?>;border: 1px solid #eee;padding: 10px;font-size: 14px;"><?php esc_html_e( 'Price', 'yay-reviews' ); ?></th>
		</tr>
	</thead>
	<tbody>
		<?php
		foreach ( $product_list as $product ) :
			if ( ! is_a( $product, 'WC_Product' ) ) {
				$product = wc_get_product( $product );
			}
			if ( ! $product ) {
				continue;
			}

			if ( is_object( $product ) ) {
				$sku           = $product->get_sku();
				$purchase_note = $product->get_purchase_note();
				$image         = $product->get_image( $image_size );
			}

			?>
			<tr class="order_item">
				<td class="td" style="text-align:left; vertical-align:middle; border: 1px solid #eee; word-wrap:break-word; padding: 10px;">
					<?php
					// Show title/image etc
					echo wp_kses_post( apply_filters( 'woocommerce_order_item_thumbnail', $image, $product ) );
					echo wp_kses_post( apply_filters( 'woocommerce_order_item_name', $product->get_name(), $product, false ) );

					// SKU
					if ( $sku ) {
						echo wp_kses_post( ' (#' . $sku . ')' );
					}
					?>
				</td>
				<td class="td" style="text-align:left; vertical-align:middle; border: 1px solid #eee;padding: 10px;">
					<?php echo wp_kses_post( $product->get_short_description() ); ?>
				</td>
				<td class="td" style="text-align:<?php echo esc_attr( $price_text_align ); ?>; vertical-align:middle; border: 1px solid #eee;padding: 10px;">
					<?php
					$regular_price = $product->get_regular_price();
					$sale_price    = $product->get_sale_price();

					if ( $regular_price && $sale_price && $regular_price !== $sale_price ) {
						echo wp_kses_post( '<del>' . wc_price( $regular_price ) . '</del> <ins>' . wc_price( $sale_price ) . '</ins>' );
					} else {
						echo wp_kses_post( wc_price( $product->get_price() ) );
					}
					?>
				</td>
			</tr>
		<?php endforeach; ?>
	</tbody>
</table>