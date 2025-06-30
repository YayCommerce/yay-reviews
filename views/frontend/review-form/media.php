<?php

/**
 * Pass data:
 * - label
 * - is_required
 * - description
 * - media_type
 * - max_files_qty
 * - max_file_size
 */

use YayReviews\Constants\BaseConstants;

$video_mime_types = array_map(
	function( $extension ) {
		return 'video/' . $extension;
	},
	BaseConstants::SUPPORTED_VIDEO_EXTENSIONS
);
$image_mime_types = array_map(
	function( $extension ) {
		return 'image/' . $extension;
	},
	BaseConstants::SUPPORTED_IMAGE_EXTENSIONS
);

$accept_mime_types = $image_mime_types;

if ( 'video_image' === $media_type ) {
	$accept_mime_types = array_merge( $video_mime_types, $image_mime_types );
}
if ( 'only_video' === $media_type ) {
	$accept_mime_types = $video_mime_types;
}

$accept = implode( ',', $accept_mime_types );
?>
<?php wp_nonce_field( 'yay-reviews-nonce', 'yay_reviews_nonce' ); ?>
<div class="yay-reviews-upload-media">
	<?php if ( ! empty( $label ) ) : ?>
		<label class="yay-reviews-upload-media__label" for="yay-reviews-file-input"><?php echo esc_html( $label ); ?><?php echo $is_required ? '&nbsp;<span class="required">*</span>' : ''; ?></label>
	<?php endif; ?>
	<!-- Upload area -->
	<div class="yay-reviews-upload-media__upload-list">
		<!-- Thumbnails will be inserted here by JS -->
		<div class="yay-reviews-upload-button"
			data-accept="<?php echo esc_attr( $accept ); ?>"	
			onclick="document.getElementById('yay-reviews-file-input').click();" ondragover="event.preventDefault(); this.classList.add('border-blue-500');"
			ondragleave="this.classList.remove('border-blue-500');"
			ondrop="event.preventDefault(); this.classList.remove('border-blue-500'); handleFileDrop(event);"
		>
			<span>+</span>
			<span><?php echo esc_html__( 'Upload', 'yay-reviews' ); ?></span>
		</div>
	</div>
	<input type="file" name="yay_reviews_media[]" accept="<?php echo esc_attr( $accept ); ?>" multiple class="hidden" id="yay-reviews-file-input" <?php echo $is_required ? 'required' : ''; ?>>
	<?php if ( ! empty( $description ) ) : ?>
		<p class="yay-reviews-upload-media__description"><?php echo esc_html( $description ); ?></p>
	<?php endif; ?>
</div>
