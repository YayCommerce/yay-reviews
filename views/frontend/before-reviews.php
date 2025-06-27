<?php

use YayReviews\Classes\View;

echo wp_kses_post( View::load( 'frontend.reviews-overview', array(), false ) );

comments_template();
