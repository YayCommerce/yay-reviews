<?php

use YayReviews\Classes\View;

echo View::load( 'frontend.reviews-overview', array(), false );
echo View::load( 'frontend.all-reviews-media', array(), false );
comments_template();
