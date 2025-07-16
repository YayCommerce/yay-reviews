<?php

namespace YayReviews\Admin;

use YayReviews\Classes\Helpers;
use YayReviews\SingletonTrait;

class ReviewsPage {

	use SingletonTrait;

	public function __construct() {
		add_filter( 'comment_text', array( $this, 'comment_text' ), 10, 2 );
	}

	public function comment_text( $comment_text, $comment ) {
		$title = get_comment_meta( $comment->comment_ID, 'yayrev_title', true );
		if ( $title ) {
			$comment_text = '<p class="meta yay-reviews-title"><strong>' . esc_html( $title ) . '</strong></p>' . $comment_text;
		}
		return $comment_text;
	}
}