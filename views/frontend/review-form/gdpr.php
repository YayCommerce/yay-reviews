<?php

/**
 * Pass data:
 * - before
 * - inline_message
 */

if ( empty( trim( $pre_message ) ) && empty( trim( $gdpr_message ) ) ) {
	return;
}

?>

<div class="yay-reviews-gdpr">
	<?php if ( ! empty( $pre_message ) ) : ?>
		<span class="yay-reviews-gdpr__before"><?php echo wp_kses_post( $pre_message ); ?></span>
	<?php endif; ?>
	<?php if ( ! empty( $gdpr_message ) ) : ?>
		<div class="yay-reviews-gdpr__message">
			<label for="yay-reviews-gdpr-checkbox">
				<input
					type="checkbox"
					id="yay-reviews-gdpr-checkbox"
					name="yay-reviews-gdpr-checkbox"
				/>
				<span>
					<?php echo wp_kses_post( $gdpr_message ); ?>
				</span>
			</label>
		</div>
	<?php endif; ?>
</div>
