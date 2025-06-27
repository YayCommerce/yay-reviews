<?php

use YayReviews\Classes\View;

echo wp_kses_post( View::load( 'frontend.reviews-overview', array(), false ) );
echo wp_kses_post( View::load( 'frontend.all-reviews-media', array(), false ) );
comments_template();
