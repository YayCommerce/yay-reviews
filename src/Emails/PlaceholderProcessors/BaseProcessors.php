<?php

namespace YayReviews\Emails\PlaceholderProcessors;

/**
 * BaseProcessors is an abstract class that provides methods to process placeholders.
 */
abstract class BaseProcessors {

	/**
	 * The data to process.
	 */
	protected $data;

	/**
	 * Whether to use sample data.
	 */
	protected $is_sample = true;

	/**
	 * Constructor.
	 *
	 * @param array|null $data The data to process.
	 */
	public function __construct( $data = null ) {
		if ( ! empty( $data ) ) {
			$this->is_sample = true;
			$this->data      = $data;
		}
	}

}
