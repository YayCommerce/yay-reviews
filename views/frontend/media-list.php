<?php
/**
 * Template for displaying review media
 *
 * @var array $files Array of media files
 * @var object $comment Comment object
 */

use YayReviews\Constants\BaseConstants;

$uploads = wp_upload_dir();
?>

<div class="yay-reviews-review__media-list">
	<?php
	foreach ( $files as $key => $file ) :
		$extension  = pathinfo( $file, PATHINFO_EXTENSION );
		$media_type = in_array( strtolower( $extension ), BaseConstants::SUPPORTED_VIDEO_EXTENSIONS ) ? 'video' : 'image';
		?>
		<div class="yay-reviews-review__media-item yay-reviews-media-card" data-comment-id="<?php echo esc_attr( $comment->comment_ID ); ?>" data-index="<?php echo esc_attr( $key ); ?>" data-type="<?php echo esc_attr( $media_type ); ?>">
			<div class="yay-reviews-media-card-wrapper">
				<div class="yay-reviews-media-card-inner">
					<?php if ( 'video' === $media_type ) : ?>
						<img class="yay-reviews-media-card__video-thumbnail yay-reviews-video_thumbnail" src="<?php echo esc_url( YAY_REVIEWS_PLUGIN_URL . 'assets/frontend/img/video-thumbnail.png' ); ?>" data-src="<?php echo esc_url( $uploads['baseurl'] . $file ); ?>" alt="video_thumbnail" />
						<div class="yay-reviews-media-card__video-details"></div>
					<?php else : ?>
						<img src="<?php echo esc_url( $uploads['baseurl'] . $file ); ?>" alt="Media preview" data-src="<?php echo esc_url( $uploads['baseurl'] . $file ); ?>" />
					<?php endif; ?>
				</div>
			</div>
		</div>
	<?php endforeach; ?>
</div>

<div class="yay-reviews-review-details-modal" data-comment-id="<?php echo esc_attr( $comment->comment_ID ); ?>">
	<div class="yay-reviews-modal-content">
		<div class="yay-reviews-modal-comment-details">
			<div class="yay-reviews-modal-header">
				<h1><?php echo esc_html__( 'Review Details', 'yay-reviews' ); ?></h1>
				<?php if ( ! is_admin() && ! $is_my_account ) : ?>
					<span class="yay-reviews-modal-see-all-media"><?php echo esc_html__( 'See all media', 'yay-reviews' ); ?></span>
				<?php endif; ?>
			</div>
		</div>
	</div>
	<?php
		$has_multiple_media = count( $files ) > 1;
	?>
	<div class="yay-reviews-modal-media-frame-content">
		<div class="yay-reviews-modal-media-frame-content-left">
			<?php if ( $has_multiple_media ) : ?>
				<div class="yay-reviews-nav-arrow yay-reviews-nav-prev" aria-label="Previous media">
					<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 11L1 6L6 1" stroke="#D3DCE5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
				</div>
			<?php endif; ?>
			<div class="thumbnail thumbnail-image"></div>
			<?php if ( $has_multiple_media ) : ?>
				<div class="yay-reviews-nav-arrow yay-reviews-nav-next" aria-label="Next media">
					<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L1 11" stroke="#D3DCE5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
				</div>
			<?php endif; ?>
		</div>
		<div class="yay-reviews-modal-media-frame-content-right">
			<div class="comment-details-wrapper">
				<div class="comment-info">
					<div class="comment-author-avatar">
						<div class="comment-avatar">
							<img src="<?php echo esc_url( get_avatar_url( $comment->user_id ) ); ?>" alt="<?php echo esc_attr( $comment->comment_author ); ?>" />
						</div>
						<div class="comment-author"><?php echo esc_html( $comment->comment_author ); ?></div>
						<?php if ( 'yes' === get_option( 'woocommerce_review_rating_verification_label' ) && wc_review_is_from_verified_owner( $comment->comment_ID ) ) : ?>
							<span class="yay-reviews-verified-badge" data-tippy-content="<?php esc_attr_e( 'Verified Owner', 'yay-reviews' ); ?>"><svg xmlns="http://www.w3.org/2000/svg " width="24" height="24" viewBox="0 0 24 24" fill="#067D62">
							<g clip-path="url(#clip0_4418_8618)">
							<path d="M21.5599 10.7405L20.1999 9.16055C19.9399 8.86055 19.7299 8.30055 19.7299 7.90055V6.20055C19.7299 5.14055 18.8599 4.27055 17.7999 4.27055H16.0999C15.7099 4.27055 15.1399 4.06055 14.8399 3.80055L13.2599 2.44055C12.5699 1.85055 11.4399 1.85055 10.7399 2.44055L9.16988 3.81055C8.86988 4.06055 8.29988 4.27055 7.90988 4.27055H6.17988C5.11988 4.27055 4.24988 5.14055 4.24988 6.20055V7.91055C4.24988 8.30055 4.03988 8.86055 3.78988 9.16055L2.43988 10.7505C1.85988 11.4405 1.85988 12.5605 2.43988 13.2505L3.78988 14.8405C4.03988 15.1405 4.24988 15.7005 4.24988 16.0905V17.8005C4.24988 18.8605 5.11988 19.7305 6.17988 19.7305H7.90988C8.29988 19.7305 8.86988 19.9405 9.16988 20.2005L10.7499 21.5605C11.4399 22.1505 12.5699 22.1505 13.2699 21.5605L14.8499 20.2005C15.1499 19.9405 15.7099 19.7305 16.1099 19.7305H17.8099C18.8699 19.7305 19.7399 18.8605 19.7399 17.8005V16.1005C19.7399 15.7105 19.9499 15.1405 20.2099 14.8405L21.5699 13.2605C22.1499 12.5705 22.1499 11.4305 21.5599 10.7405ZM16.1599 10.1105L11.3299 14.9405C11.1899 15.0805 10.9999 15.1605 10.7999 15.1605C10.5999 15.1605 10.4099 15.0805 10.2699 14.9405L7.84988 12.5205C7.55988 12.2305 7.55988 11.7505 7.84988 11.4605C8.13988 11.1705 8.61988 11.1705 8.90988 11.4605L10.7999 13.3505L15.0999 9.05055C15.3899 8.76055 15.8699 8.76055 16.1599 9.05055C16.4499 9.34055 16.4499 9.82055 16.1599 10.1105Z" fill="white" style="fill: var(--fillg);"></path>
							</g>
							<defs>
							<clipPath id="clip0_4418_8618">
							<rect width="24" height="24" fill="white"></rect>
							</clipPath>
							</defs>
						</svg></span>
						<?php endif; ?>
					</div>
					<?php
					$rating       = intval( get_comment_meta( $comment->comment_ID, 'rating', true ) );
					$rating_stars = '';

					if ( $rating && wc_review_ratings_enabled() ) {
						if ( wp_get_theme()->get_template() === 'brandy' ) {
							$rating_stars = wc_get_template_html(
								'template-parts/rating.php',
								array(
									'rating'          => $rating,
									'rating_count'    => 5,
									'show_only_stars' => true,
									'show_overall'    => false,
									'review_count'    => false,
								)
							);
						} else {
							$rating_stars = wc_get_rating_html( $rating ); // WPCS: XSS ok.
						}
					}
					?>
					<div class="yay-reviews-modal-comment-rating"><?php echo $rating_stars; ?></div> 
					<?php
						$comment_date = get_comment_date( 'F j, Y', $comment );
						$comment_time = get_comment_date( 'g:i A', $comment );
					?>
					<div class="comment-date"><?php echo esc_html__( 'Reviewed in ', 'yay-reviews' ) . ' ' . esc_html( $comment_date ) . ' ' . esc_html__( 'at', 'yay-reviews' ) . ' ' . esc_html( $comment_time ); ?></div>
				</div>
				<div class="comment-content"><?php echo wp_kses_post( $comment->comment_content ); ?></div>
				<div class="yay-reviews-review-details__medias-wrapper">
					<div class="yay-reviews-review-details__medias-title"><?php echo esc_html__( 'Medias in this review', 'yay-reviews' ); ?></div>
					<div class="yay-reviews-review-details__media-list">
						<?php foreach ( $files as $key => $file ) : ?>
							<?php
							$extension  = pathinfo( $file, PATHINFO_EXTENSION );
							$media_type = in_array( strtolower( $extension ), BaseConstants::SUPPORTED_VIDEO_EXTENSIONS ) ? 'video' : 'image';
							?>
							<?php if ( 'video' === $media_type ) : ?>
							<div class="yay-reviews-modal-comment-medias-preview-item yay-reviews-media-card" data-index="<?php echo esc_attr( $key ); ?>" data-type="video">
								<div class="yay-reviews-media-card-wrapper">
									<div class="yay-reviews-media-card-inner">
										<img class="yay-reviews-video_thumbnail" src="<?php echo esc_url( YAY_REVIEWS_PLUGIN_URL . 'assets/frontend/img/video-thumbnail.png' ); ?>" alt="Media preview" data-src="<?php echo esc_url( $uploads['baseurl'] . $file ); ?>" />
										<div class="yay-reviews-media-card__video-details"></div>
									</div>
								</div>
							</div>
							<?php else : ?>
							<div class="yay-reviews-modal-comment-medias-preview-item yay-reviews-media-card" data-index="<?php echo esc_attr( $key ); ?>" data-type="image">
								<div class="yay-reviews-media-card-wrapper">
									<div class="yay-reviews-media-card-inner">
										<img src="<?php echo esc_url( $uploads['baseurl'] . $file ); ?>" alt="Media preview" data-src="<?php echo esc_url( $uploads['baseurl'] . $file ); ?>" />
									</div>
								</div>
							</div>
							<?php endif; ?>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<div class="yay-reviews-modal-backdrop" data-comment-id="<?php echo esc_attr( $comment->comment_ID ); ?>"></div>
