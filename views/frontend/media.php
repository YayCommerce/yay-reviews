<?php
/**
 * Template for displaying review media
 *
 * @var array $files Array of media files
 * @var object $comment Comment object
 * @var bool $echo Whether to echo the output or return it
 */

// Define arrays of image and video extensions
$image_extensions = array( 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp' );
$video_extensions = array( 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'quicktime' );
$rating           = (float) get_comment_meta( $comment->comment_ID, 'rating', true );
$comment_date     = get_comment_date( 'F j, Y', $comment );
$comment_time     = get_comment_date( 'g:i A', $comment );
$comment_media    = '';

$rating_stars = '';
for ( $i = 1; $i <= 5; $i++ ) {
	if ( $i <= $rating ) {
		$rating_stars .= '<span class="yay-star filled">&#9733;</span>'; // filled star
	} else {
		$rating_stars .= '<span class="yay-star">&#9733;</span>'; // unfilled star
	}
}

ob_start();
$uploads = wp_upload_dir();
echo '<div class="yay-reviews-medias">';
foreach ( $files as $key => $file ) {
	$extension = pathinfo( $file, PATHINFO_EXTENSION );
	if ( in_array( strtolower( $extension ), $image_extensions ) ) {
		$html           = '<img src="' . esc_url( $uploads['baseurl'] . $file ) . '" data-src="' . esc_url( $uploads['baseurl'] . $file ) . '" alt="" />';
		$comment_media .= '<div class="yay-reviews-modal-comment-medias-preview-item" data-index="' . esc_attr( $key ) . '" data-type="image">
                        <div class="rounded-lg overflow-hidden">
                            <img class="h-[68px] w-[68px] object-contain" src="' . esc_url( $uploads['baseurl'] . $file ) . '" alt="Media preview" data-src="' . esc_url( $uploads['baseurl'] . $file ) . '" />
                        </div>
                    </div>';
	} elseif ( in_array( strtolower( $extension ), $video_extensions ) ) {
		$html           = '<img src="' . esc_url( YAY_REVIEWS_PLUGIN_URL . 'assets/frontend/img/video-thumbnail.png' ) . '" data-src="' . esc_url( $uploads['baseurl'] . $file ) . '" alt="" />';
		$comment_media .= '<div class="yay-reviews-modal-comment-medias-preview-item" data-index="' . esc_attr( $key ) . '" data-type="video">
                        <div class="rounded-lg overflow-hidden">
                            <img class="h-[68px] w-[68px] object-contain" src="' . esc_url( YAY_REVIEWS_PLUGIN_URL . 'assets/frontend/img/video-thumbnail.png' ) . '" alt="Media preview" data-src="' . esc_url( $uploads['baseurl'] . $file ) . '" />
                        </div>
                    </div>';
	}

    echo '<div class="yay-reviews-media" data-comment-id="' . esc_attr( $comment->comment_ID ) . '" data-index="' . esc_attr( $key ) . '" data-type="' . esc_attr( in_array( strtolower( $extension ), $video_extensions ) ? 'video' : 'image' ) . '">' . $html . '</div>'; //phpcs:ignore
}
echo '</div>';
echo '<div class="yay-reviews-preview-media-modal" data-comment-id="' . esc_attr( $comment->comment_ID ) . '">
    <div class="yay-reviews-modal-content">
    <div class="yay-reviews-modal-comment-details">
    <div class="yay-reviews-modal-media-frame-title">
        <h1>' . esc_html__( 'Review Details', 'yay-reviews' ) . '</h1>
    </div>
    <div class="yay-reviews-modal-media-frame-content">
        <div class="yay-reviews-modal-media-frame-content-left">
            <div class="thumbnail thumbnail-image">
            </div>
        </div>
        <div class="yay-reviews-modal-media-frame-content-right">
            <div class="flex gap-4 flex-col">
                <div class="flex gap-2 flex-col">
                    <div class="flex items-center gap-2">
                        <div class="rounded-full overflow-hidden w-6 h-6">
                            <img src="' . esc_url( get_avatar_url( $comment->user_id ) ) . '" alt="' . esc_attr( $comment->comment_author ) . '" />
                        </div>
                        <div class="font-normal text-[#09090B] text-sm">' . esc_html( $comment->comment_author ) . '</div>
                    </div>
                    <div class="yay-reviews-modal-comment-rating">
                        <div class="yay-reviews-modal-comment-rating-stars">' . wp_kses_post( $rating_stars ) . '</div>
                    </div>
                    <div class="text-[#64748B] text-sm">' . esc_html__( 'Reviewed in ', 'yay-reviews' ) . ' ' . esc_html( $comment_date ) . ' ' . esc_html__( 'at', 'yay-reviews' ) . ' ' . esc_html( $comment_time ) . '</div>
                </div>
                <div class="text-[#0F172A] text-sm">' . wp_kses_post( $comment->comment_content ) . '</div>
                <div class="yay-reviews-modal-comment-medias-preview">
                    <div class="text-[#18181B] font-medium mb-2">' . esc_html__( 'Medias in this review', 'yay-reviews' ) . '</div>
                    <div class="flex gap-2">' . wp_kses_post( $comment_media ) . '</div>
                </div>
            </div>
        </div>
    </div>
    </div>
    </div>
</div><div class="yay-reviews-modal-backdrop" data-comment-id="' . esc_attr( $comment->comment_ID ) . '"></div>';
$html = ob_get_clean();
if ( $echo ) {
    echo $html; //phpcs:ignore
} else {
	return $html;
}
