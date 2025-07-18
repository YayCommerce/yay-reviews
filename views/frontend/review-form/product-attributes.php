<?php

defined( 'ABSPATH' ) || exit;

global $product;

if ( ! is_user_logged_in() ) {
	return;
}

$customer       = wp_get_current_user();
$customer_email = $customer->email;
$customer_id    = $customer->ID;

if ( ! \wc_customer_bought_product( $customer_email, $customer_id, $product->get_id() ) ) {
	return;
}

// Check if variable product and prepare attribute options
$attribute_options = array();
if ( isset( $product ) && $product->is_type( 'variable' ) ) {
	$attributes = $product->get_attributes();
	foreach ( $attributes as $attribute ) {
		$attribute_name   = $attribute->get_name();
		$attribute_label  = \wc_attribute_label( $attribute_name );
		$attribute_values = $attribute->get_options();

		// Get the actual term names for taxonomy attributes
		if ( $attribute->is_taxonomy() ) {
			$terms                                = wp_get_post_terms( $product->get_id(), $attribute_name );
			$attribute_options[ $attribute_name ] = array(
				'label'  => $attribute_label,
				'values' => array(),
			);
			foreach ( $terms as $attribute_term ) {
				$attribute_options[ $attribute_name ]['values'][ $attribute_term->slug ] = $attribute_term->name;
			}
		} else {
			// For custom attributes
			$attribute_options[ $attribute_name ] = array(
				'label'  => $attribute_label,
				'values' => array_combine( $attribute_values, $attribute_values ),
			);
		}
	}
}

if ( empty( $attribute_options ) ) {
	return;
}

?>

<div class="yayrev-product-attributes">
	<h4 class="yayrev-product-attributes__title"><?php echo esc_html__( 'Product Attributes (Optional)', 'yay-customer-reviews-woocommerce' ); ?></h4>
	<?php foreach ( $attribute_options as $attribute_name => $attribute_data ) : ?>
		<div class="yayrev-product-attributes__field">
			<label for="yayrev-attribute-<?php echo esc_attr( $attribute_name ); ?>" class="yayrev-product-attributes__label">
				<?php echo esc_html( $attribute_data['label'] ); ?>
			</label>
			<select 
				name="yayrev_attributes[<?php echo esc_attr( $attribute_name ); ?>]" 
				id="yayrev-attribute-<?php echo esc_attr( $attribute_name ); ?>"
				class="yayrev-product-attributes__select"
			>
				<option value=""><?php echo esc_html__( 'Select', 'yay-customer-reviews-woocommerce' ) . ' ' . esc_html( $attribute_data['label'] ); ?></option>
				<?php foreach ( $attribute_data['values'] as $attribute_value => $attribute_label ) : ?>
					<option value="<?php echo esc_attr( $attribute_value ); ?>"><?php echo esc_html( $attribute_label ); ?></option>
				<?php endforeach; ?>
			</select>
		</div>
	<?php endforeach; ?>
</div>
