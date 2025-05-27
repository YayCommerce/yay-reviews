<?php if ( ! empty( $before ) ) : ?>
	<div class="yay-reviews-gdpr-before">
		<?php echo wp_kses_post( $before ); ?>
	</div>
<?php endif; ?>
<div class="yay-reviews-gdpr-wrap">
	<input type="checkbox" name="yay-reviews-gdpr-checkbox" value="1" id="yay-reviews-gdpr-checkbox">
	<label for="yay-reviews-gdpr-checkbox">
		<?php if ( ! empty( $gdpr_message ) ) : ?>
			<?php echo wp_kses_post( $gdpr_message ); ?>
		<?php endif; ?>
	</label>
</div>
<?php if ( ! empty( $after ) ) : ?>
	<div class="yay-reviews-gdpr-after">
		<?php echo wp_kses_post( $after ); ?>
	</div>
<?php endif; ?>