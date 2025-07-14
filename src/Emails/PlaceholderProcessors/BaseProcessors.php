<?php

namespace YayReviews\Emails\PlaceholderProcessors;

abstract class BaseProcessors {

	protected $data;

	protected $is_sample = true;

	public function __construct( $data = null ) {
		if ( ! empty( $data ) ) {
			$this->is_sample = true;
			$this->data      = $data;
		}
	}

}
