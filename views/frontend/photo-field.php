<?php

if ( 'video_image' === $media_type ) {
	$accept = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp,video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv';
} elseif ( 'only_video' === $media_type ) {
	$accept = 'video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv';
} else {
	$accept = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp';
}

?>
<p class="yay-reviews-photo-field">
	<label for="yay_reviews_field_photos"><?php echo esc_html( $label ); ?><?php echo $upload_required ? '&nbsp;<span class="required">*</span>' : ''; ?></label>
	<?php if ( ! empty( $description ) ) : ?>
		<p class="yay-reviews-photo-field-description"><?php echo esc_html( $description ); ?></p>
	<?php endif; ?>
	<div class="yay_reviews_file_wrap">
		<input id="yay_reviews_field_photos" name="yay_reviews_field_photos[]" type="file" multiple accept="<?php echo esc_attr( $accept ); ?>" <?php echo $upload_required ? 'required' : ''; ?> />
	</div>
	<div class="yay-reviews-thumbnails" style="margin-top: 10px;"></div>
</p>