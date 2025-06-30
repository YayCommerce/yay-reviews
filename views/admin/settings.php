<?php
/**
 * Yay Reviews Settings Page
 *
 * This template displays the settings page for the Yay Reviews plugin.
 *
 * @package Yay_Reviews
 */

defined( 'ABSPATH' ) || exit;

?>
<div style="display: none;">
	<?php
	wp_editor(
		'',
		'yay-reviews-wp-editor-placeholder',
		array(
			'quicktags'     => false,
			'media_buttons' => true,
			'tinymce'       => true,
		)
	);
	?>
</div>
<div id="yay-reviews-settings"></div>
