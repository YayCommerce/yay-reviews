<?php

namespace YayRev;

use YayRev\Admin\AdminMenu;
use YayRev\Admin\ReviewsPage;
use YayRev\Admin\SingleReviewPage;

class Admin {

	use SingletonTrait;

	public function __construct() {
		AdminMenu::get_instance();
		ReviewsPage::get_instance();
		SingleReviewPage::get_instance();
	}

}
