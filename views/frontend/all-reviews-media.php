<?php

defined( 'ABSPATH' ) || exit;

?>

<div class="yayrev-all-media">
	<div class="yayrev-all-media__title">
		<h3><?php echo esc_html__( 'Reviews with media', 'yay-customer-reviews-woocommerce' ); ?></h3>
		<strong class="yayrev-see-all-media"><?php echo esc_html__( 'See all media', 'yay-customer-reviews-woocommerce' ); ?></strong>
	</div>
	<div class="yayrev-all-media-dialog" style="display: none;">
		<div class="yayrev-all-media-dialog-content">
			<div class="yayrev-modal-header">
				<h1><?php echo esc_html__( 'All media', 'yay-customer-reviews-woocommerce' ); ?></h1>
			</div>
			<div class="yayrev-all-media-dialog-content-wrapper"></div>
		</div>
	</div>
	<div class="yayrev-all-media-dialog-backdrop" style="display: none;"></div>
	<div class="yayrev-all-media-wrapper">
		<div class="yayrev-all-media-track"></div>
		<div class="yayrev-all-media-buttons">
			<div class="yayrev-all-media-arrow left-arrow">
			<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 11L1 6L6 1" stroke="#D3DCE5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
			</div>
			<div class="yayrev-all-media-arrow right-arrow">
			<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L1 11" stroke="#D3DCE5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
			</div>
		</div>
	</div>
</div>
