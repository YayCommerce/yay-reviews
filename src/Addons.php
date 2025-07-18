<?php

namespace YayReviews;

use YayReviews\Addons\Reward\RewardAddonController;
use YayReviews\SingletonTrait;

class Addons {

	use SingletonTrait;

	public function __construct() {
		RewardAddonController::get_instance();
	}
}
