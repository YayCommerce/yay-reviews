<?php

/**
 * Pass data:
 * - before
 * - inline_message
 */

if ( empty( trim( $before ) ) && empty( trim( $inline_message ) ) ) {
	return;
}

?>

<div class="yay-reviews-gdpr">
	<?php if ( ! empty( $before ) ) : ?>
		<span class="yay-reviews-gdpr__before"><?php echo wp_kses_post( $before ); ?></span>
	<?php endif; ?>
	<?php if ( ! empty( $inline_message ) ) : ?>
		<div class="yay-reviews-gdpr__message">
			<label for="yay-reviews-gdpr-checkbox">
				<input
					type="checkbox"
					id="yay-reviews-gdpr-checkbox"
					name="yay-reviews-gdpr-checkbox"
				/>
				<span>
					<?php echo wp_kses_post( $inline_message ); ?>
				</span>
			</label>
		</div>
	<?php endif; ?>
</div>
