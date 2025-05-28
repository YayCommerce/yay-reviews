<?php

if ( 'video_image' === $media_type ) {
	$upload_text = __( 'You can upload image &amp; video (maximum ' . $max_file_size . 'KB)', 'yay_reviews' );
	$accept      = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp,video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv,video/quicktime';
} elseif ( 'only_video' === $media_type ) {
	$upload_text = __( 'You can upload video (maximum ' . $max_file_size . 'KB)', 'yay_reviews' );
	$accept      = 'video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv,video/quicktime';
} else {
	$upload_text = __( 'You can upload image (maximum ' . $max_file_size . 'KB)', 'yay_reviews' );
	$accept      = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp';
}

?>

<div class="my-4 bg-[#FAFBFB] p-[10px] rounded-lg shadow-sm flex flex-col gap-[10px]">
	<?php if ( ! empty( $upload_media ) ) : ?>
		<?php if ( ! empty( $label ) ) : ?>
			<div class="text-sm font-medium"><?php echo esc_html( $label ); ?><?php echo $upload_required ? '&nbsp;<span class="required">*</span>' : ''; ?></div>
		<?php endif; ?>
		<?php if ( ! empty( $description ) ) : ?>
			<div class="text-sm text-gray-500"><?php echo esc_html( $description ); ?></div>
		<?php endif; ?>
		<!-- Upload area -->
		<div>
			<div class="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center py-8 mb-2 yay-reviews-dropzone" 
				data-accept="<?php echo esc_attr( $accept ); ?>"
				ondragover="event.preventDefault(); this.classList.add('border-blue-500');"
				ondragleave="this.classList.remove('border-blue-500');"
				ondrop="event.preventDefault(); this.classList.remove('border-blue-500'); handleFileDrop(event);"
			>
				<div class="mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" class="yay-reviews-icon bg-white rounded-lg" stroke-width="1"><g clip-path="url(#clip0_4482_9752)"><path d="M7.55957 11.44V9C7.55957 7.9 8.45957 7 9.55957 7H14.4496C15.5496 7 16.4496 7.9 16.4496 9V11.44" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="transparent"></path><path d="M10.8802 13.1099H13.1102L14.4502 11.7699C14.6602 11.5599 14.9402 11.4399 15.2402 11.4399H16.4502C17.0602 11.4399 17.5602 11.9399 17.5602 12.5499V14.9899C17.5602 16.0899 16.6602 16.9899 15.5602 16.9899H8.4502C7.3502 16.9899 6.4502 16.0899 6.4502 14.9899V12.5499C6.4502 11.9399 6.9502 11.4399 7.5602 11.4399H8.7602C9.0602 11.4399 9.3402 11.5599 9.5502 11.7699L10.8902 13.1099H10.8802Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="transparent"></path></g><defs><clipPath id="clip0_4482_9752"><rect width="48" height="48" fill="currentColor"></rect></clipPath></defs></svg>
				</div>
				<p class="text-lg font-semibold mb-2"><?php echo esc_html__( 'Select files to upload', 'yay_reviews' ); ?></p>
				<p class="text-sm text-gray-500 mb-4"><?php echo esc_html__( 'or drag and drop it here', 'yay_reviews' ); ?></p>
				<input type="file" name="yay_reviews_media[]" accept="<?php echo esc_attr( $accept ); ?>" multiple class="hidden" id="yay-reviews-file-input" <?php echo $upload_required ? 'required' : ''; ?>>
				<label for="yay-reviews-file-input" class="text-sm bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800 transition cursor-pointer flex items-center gap-2">
					<span class="upload-text"><?php echo esc_html__( 'Upload', 'yay_reviews' ); ?></span>
					<span class="loading-spinner hidden">
						<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</span>
				</label>
			</div>
			<p class="text-gray-500 text-sm mb-4"><?php echo esc_html( $upload_text ); ?></p>
			<div class="yay-reviews-thumbnails" style="margin-top: 10px;"></div>
		</div>
	<?php endif; ?>
	<?php if ( ! empty( $enable_gdpr ) ) : ?>
		<div class="space-y-2">
			<?php if ( ! empty( $before ) ) : ?>
				<p class="text-gray-500 text-sm"><?php echo esc_html( $before ); ?></p>
			<?php endif; ?>
			<?php if ( ! empty( $gdpr_message ) ) : ?>
				<div class="flex items-center space-x-2 yay-reviews-gdpr-checkbox-wrap">
					<label for="yay-reviews-gdpr-checkbox" class="flex items-center gap-2 cursor-pointer select-none">
						<input
							type="checkbox"
							class="peer sr-only"
							id="yay-reviews-gdpr-checkbox"
							name="yay-reviews-gdpr-checkbox"
						/>
						<div class="h-4 w-4 rounded border border-gray-300 bg-white peer-checked:bg-black peer-checked:border-black flex items-center justify-center transition-colors">
							<svg
								class="h-3 w-3 text-white peer-checked:opacity-100 transition-opacity"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</div>
						<span class="text-sm font-normal text-black">
							<?php echo esc_html( $gdpr_message ); ?>
						</span>
					</label>
				</div>
			<?php endif; ?>
			<?php if ( ! empty( $after ) ) : ?>
				<p class="text-gray-500 text-sm"><?php echo esc_html( $after ); ?></p>
			<?php endif; ?>
		</div>
	<?php endif; ?>
</div>
