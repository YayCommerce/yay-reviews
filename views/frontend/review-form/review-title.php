<?php

defined( 'ABSPATH' ) || exit;

?>

<div class="yayrev-review-title">
	<label for="yayrev-title" class="yayrev-review-title__label"><?php echo esc_html__( 'Title (optional)', 'yay-customer-reviews-woocommerce' ); ?></label>
	<input type="text" name="yayrev-title" id="yayrev-title" maxlength="60">
	<p class="yayrev-review-title__description"><?php echo esc_html__( 'Maximum 60 characters', 'yay-customer-reviews-woocommerce' ); ?></p>
</div>
