<?php

namespace YayReviews;

use YayReviews\Admin\AdminMenu;
use YayReviews\Admin\ReviewsPage;
use YayReviews\Admin\SingleReviewPage;

class Admin {

	use SingletonTrait;

	public function __construct() {
		AdminMenu::get_instance();
		ReviewsPage::get_instance();
		SingleReviewPage::get_instance();
	}

}
