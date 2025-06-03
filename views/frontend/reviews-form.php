<?php

if ( 'video_image' === $media_type ) {
	$accept = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp,video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv,video/quicktime';
} elseif ( 'only_video' === $media_type ) {
	$accept = 'video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv,video/quicktime';
} else {
	$accept = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp';
}

?>

<div class="my-4 flex flex-col gap-[10px]">
	<?php wp_nonce_field( 'yay-reviews-nonce', 'yay_reviews_nonce' ); ?>
	<?php if ( ! empty( $upload_media ) ) : ?>
		<?php if ( ! empty( $label ) ) : ?>
			<div class="text-sm font-medium"><?php echo esc_html( $label ); ?><?php echo $upload_required ? '&nbsp;<span class="required">*</span>' : ''; ?></div>
		<?php endif; ?>
		<!-- Upload area -->
		<div>
			<div class="yay-reviews-picture-card-grid flex gap-2 flex-wrap">
				<!-- Thumbnails will be inserted here by JS -->
				<div class="yay-reviews-upload-card flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg w-24 h-24 cursor-pointer hover:border-blue-500 transition"
					data-accept="<?php echo esc_attr( $accept ); ?>"	
					onclick="document.getElementById('yay-reviews-file-input').click();" ondragover="event.preventDefault(); this.classList.add('border-blue-500');"
					ondragleave="this.classList.remove('border-blue-500');"
					ondrop="event.preventDefault(); this.classList.remove('border-blue-500'); handleFileDrop(event);"
				>
					<span class="text-3xl text-gray-400">+</span>
					<span class="text-xs text-gray-500 mt-1"><?php echo esc_html__( 'Upload', 'yay-reviews' ); ?></span>
				</div>
			</div>
			<input type="file" name="yay_reviews_media[]" accept="<?php echo esc_attr( $accept ); ?>" multiple class="hidden" id="yay-reviews-file-input" <?php echo $upload_required ? 'required' : ''; ?>>
			<?php if ( ! empty( $description ) ) : ?>
				<div class="text-gray-500 text-sm my-2"><?php echo esc_html( $description ); ?></div>
			<?php endif; ?>
		</div>
	<?php endif; ?>
	<?php if ( ! empty( $enable_gdpr ) ) : ?>
		<div class="space-y-2">
			<?php if ( ! empty( $before ) ) : ?>
				<div class="text-gray-500 text-sm"><?php echo esc_html( $before ); ?></div>
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
				<div class="text-gray-500 text-sm"><?php echo esc_html( $after ); ?></div>
			<?php endif; ?>
		</div>
	<?php endif; ?>
</div>

<style>
.yay-reviews-picture-card-grid {
	display: flex;
	flex-wrap: wrap;
}
.yay-reviews-upload-card {
	width: 6rem;
	height: 6rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 1px dashed #e5e7eb;
	border-radius: 0.5rem;
	cursor: pointer;
	transition: border-color 0.2s;
}
.yay-reviews-upload-card:hover {
	border-color: #1890ff;
}
.yay-reviews-thumb-card {
	position: relative;
	width: 6rem;
	height: 6rem;
	border-radius: 0.5rem;
	overflow: hidden;
	border: 1px dashed #e5e7eb;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.yay-reviews-thumb-card img {
	width: 100%;
	height: 100%;
	border-radius: 0.5rem;
	object-fit: cover;
}
.yay-reviews-thumb-card button {
	position: absolute;
	top: 0;
	right: 0;
	background: rgba(0, 0, 0, 0.5) !important;
	color: #fff !important;
	border: none !important;
	border-radius: 9999px;
	padding: 0.25rem;
	width: 1.25rem;
	height: 1.25rem;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

</style>
