<?php

/**
 * Pass data:
 * - require_media_upload
 * - label
 * - description
 * - allowed_media_types
 */

defined( 'ABSPATH' ) || exit;

use YayRev\Constants\BaseConstants;

$video_mime_types = array_map(
	function ( $extension ) {
		return 'video/' . $extension;
	},
	BaseConstants::SUPPORTED_VIDEO_EXTENSIONS
);
$photo_mime_types = array_map(
	function ( $extension ) {
		return 'image/' . $extension;
	},
	BaseConstants::SUPPORTED_PHOTO_EXTENSIONS
);

$accept_mime_types = $photo_mime_types;

if ( 'video_photo' === $allowed_media_types ) {
	$accept_mime_types = array_merge( $video_mime_types, $photo_mime_types );
}
if ( 'only_video' === $allowed_media_types ) {
	$accept_mime_types = $video_mime_types;
}

$accept = implode( ',', $accept_mime_types );
?>
<?php wp_nonce_field( 'yayrev-nonce', 'yayrev_nonce' ); ?>
<div class="yayrev-upload-media">
	<?php if ( ! empty( $label ) ) : ?>
		<label class="yayrev-upload-media__label" for="yayrev-file-input"><?php echo esc_html( $label ); ?><?php echo $require_media_upload ? '&nbsp;<span class="required">*</span>' : ''; ?></label>
	<?php endif; ?>
	<!-- Upload area -->
	<div class="yayrev-upload-media__upload-list">
		<!-- Thumbnails will be inserted here by JS -->
		<div class="yayrev-upload-button"
			data-accept="<?php echo esc_attr( $accept ); ?>"	
			onclick="document.getElementById('yayrev-file-input').click();" ondragover="event.preventDefault(); this.classList.add('border-blue-500');"
			ondragleave="this.classList.remove('border-blue-500');"
			ondrop="event.preventDefault(); this.classList.remove('border-blue-500'); handleFileDrop(event);"
		>
			<span>+</span>
			<span><?php echo esc_html__( 'Upload', 'yay-customer-reviews-woocommerce' ); ?></span>
		</div>
	</div>
	<input type="file" name="yayrev_media[]" accept="<?php echo esc_attr( $accept ); ?>" multiple class="sr-only" id="yayrev-file-input" <?php echo $require_media_upload ? 'required' : ''; ?>>
	<?php if ( ! empty( $description ) ) : ?>
		<p class="yayrev-upload-media__description"><?php echo esc_html( $description ); ?></p>
	<?php endif; ?>
</div>
