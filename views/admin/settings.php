<?php
/**
 * Yay Reviews Settings Page
 *
 * This template displays the settings page for the Yay Reviews plugin.
 *
 * @package YayRev
 */

defined( 'ABSPATH' ) || exit;

?>
<div style="display: none;">
	<?php
	wp_editor(
		'',
		'yayrev-wp-editor-placeholder',
		array(
			'quicktags'     => false,
			'media_buttons' => true,
			'tinymce'       => true,
		)
	);
	?>
</div>
<div id="yayrev-settings"></div>
