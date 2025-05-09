<?php
namespace YayReviews\Classes;

class View {
	public static function load( $file, $data = array(), $echo = true ) {
		$file = implode( '/', explode( '.', $file ) );

		$full_path = YAY_REVIEWS_VIEW_PATH . $file . '.php';
		if ( file_exists( $full_path ) ) {
			extract( $data );
			ob_start();
			require $full_path;
			$html = ob_get_clean();
			if ( $echo ) {
				echo $html;
			} else {
				return $html;
			}
		} else {
			exit( $full_path . ' <strong>NOT FOUND</strong>' );
		}
	}
}
