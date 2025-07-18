<?php

namespace YayRev;

use YayRev\Addons\Reward\RewardAddonController;
use YayRev\SingletonTrait;

class Addons {

	use SingletonTrait;

	public function __construct() {
		RewardAddonController::get_instance();
	}
}
