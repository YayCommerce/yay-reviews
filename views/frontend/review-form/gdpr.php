<?php

/**
 * Pass data:
 * - before
 * - inline_message
 */

defined( 'ABSPATH' ) || exit;

if ( empty( trim( $pre_message ) ) && empty( trim( $gdpr_message ) ) ) {
	return;
}

?>

<div class="yayrev-gdpr">
	<?php if ( ! empty( $pre_message ) ) : ?>
		<span class="yayrev-gdpr__before"><?php echo wp_kses_post( $pre_message ); ?></span>
	<?php endif; ?>
	<?php if ( ! empty( $gdpr_message ) ) : ?>
		<div class="yayrev-gdpr__message">
			<label for="yayrev-gdpr-checkbox">
				<input
					type="checkbox"
					id="yayrev-gdpr-checkbox"
					name="yayrev-gdpr-checkbox"
				/>
				<span>
					<?php echo wp_kses_post( $gdpr_message ); ?>
				</span>
			</label>
		</div>
	<?php endif; ?>
</div>
