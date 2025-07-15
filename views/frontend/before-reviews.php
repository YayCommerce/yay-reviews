<?php

use YayReviews\Classes\View;

echo View::load( 'frontend.reviews-overview', array(), false ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo View::load( 'frontend.all-reviews-media', array(), false ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
comments_template();
