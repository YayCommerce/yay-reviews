<?php
global $product;

// Check if variable product and prepare attribute options
$attribute_options = array();
if ( isset( $product ) && $product->is_type( 'variable' ) ) {
	$attributes = $product->get_attributes();
	foreach ( $attributes as $attribute ) {
		$attribute_name   = $attribute->get_name();
		$attribute_label  = wc_attribute_label( $attribute_name );
		$attribute_values = $attribute->get_options();

		// Get the actual term names for taxonomy attributes
		if ( $attribute->is_taxonomy() ) {
			$terms                                = wp_get_post_terms( $product->get_id(), $attribute_name );
			$attribute_options[ $attribute_name ] = array(
				'label'  => $attribute_label,
				'values' => array(),
			);
			foreach ( $terms as $attribute_term ) {
				$attribute_options[ $attribute_name ]['values'][ $attribute_term->slug ] = $attribute_term->name;
			}
		} else {
			// For custom attributes
			$attribute_options[ $attribute_name ] = array(
				'label'  => $attribute_label,
				'values' => array_combine( $attribute_values, $attribute_values ),
			);
		}
	}
}

if ( 'video_image' === $media_type ) {
	$accept = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp,video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv,video/quicktime';
} elseif ( 'only_video' === $media_type ) {
	$accept = 'video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv,video/quicktime';
} else {
	$accept = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp';
}

?>

<div class="yay-reviews-review-title mb-4">
	<label for="yay-reviews-title"><?php echo esc_html__( 'Title (optional)', 'yay-reviews' ); ?></label>
	<input type="text" name="yay-reviews-title" id="yay-reviews-title" class="w-full border rounded-md focus:outline-none focus:ring-2" maxlength="60">
	<p class="description"><?php echo esc_html__( 'Maximum 60 characters', 'yay-reviews' ); ?></p>
</div>
<div class="my-4">
	<?php wp_nonce_field( 'yay-reviews-nonce', 'yay_reviews_nonce' ); ?>
	
	<?php if ( ! empty( $attribute_options ) ) : ?>
		<!-- Product Attributes Selection -->
		<div>
			<h4 class="text-lg font-medium mb-3"><?php echo esc_html__( 'Product Attributes (Optional)', 'yay-reviews' ); ?></h4>
			<?php foreach ( $attribute_options as $attribute_name => $attribute_data ) : ?>
				<div class="yay-reviews-attribute-field mb-3">
					<label for="yay-reviews-attribute-<?php echo esc_attr( $attribute_name ); ?>" class="block text-sm font-medium text-gray-700 mb-1">
						<?php echo esc_html( $attribute_data['label'] ); ?>
					</label>
					<select 
						name="yay_reviews_attributes[<?php echo esc_attr( $attribute_name ); ?>]" 
						id="yay-reviews-attribute-<?php echo esc_attr( $attribute_name ); ?>"
						class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
					>
						<option value=""><?php echo esc_html__( 'Select', 'yay-reviews' ) . ' ' . esc_html( $attribute_data['label'] ); ?></option>
						<?php foreach ( $attribute_data['values'] as $attribute_value => $attribute_label ) : ?>
							<option value="<?php echo esc_attr( $attribute_value ); ?>"><?php echo esc_html( $attribute_label ); ?></option>
						<?php endforeach; ?>
					</select>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
	
	<?php if ( ! empty( $upload_media ) ) : ?>
		<?php if ( ! empty( $label ) ) : ?>
			<label for="yay-reviews-file-input"><?php echo esc_html( $label ); ?><?php echo $upload_required ? '&nbsp;<span class="required">*</span>' : ''; ?></label>
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
				<p class="description"><?php echo esc_html( $description ); ?></p>
			<?php endif; ?>
		</div>
	<?php endif; ?>
	<?php if ( ! empty( $enable_gdpr ) ) : ?>
		<div class="space-y-2">
			<?php if ( ! empty( $before ) ) : ?>
				<span class="description"><?php echo esc_html( $before ); ?></span>
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
						<span>
							<?php echo esc_html( $gdpr_message ); ?>
						</span>
					</label>
				</div>
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
.yay-reviews-thumb-card img {
	width: 100%;
	height: 100%;
	border-radius: 0.5rem;
}
.yay-reviews-thumb-card button {
	position: absolute;
	top: 0;
	right: 0;
	background-color: #757575;
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
