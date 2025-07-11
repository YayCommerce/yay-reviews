<?php

use Automattic\WooCommerce\Utilities\FeaturesUtil;

defined( 'ABSPATH' ) || exit;

$email_improvements_enabled = FeaturesUtil::feature_is_enabled( 'email_improvements' );

$content = $email_content;
$content = str_replace(
	array( '{customer_name}', '{site_title}', '{review_products}', '{order_date}', '{order_number}' ),
	array(
		$email->placeholders['{customer_name}'],
		$email->placeholders['{site_title}'],
		$email->placeholders['{review_products}'],
		$email->placeholders['{order_date}'],
		$email->placeholders['{order_number}'],
	),
	$content
);

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>

<?php echo $email_improvements_enabled ? '<div class="email-introduction">' : ''; ?>
	
<p><?php echo wp_kses_post( $content ); ?></p>

<?php echo $email_improvements_enabled ? '</div>' : ''; ?>

<?php do_action( 'woocommerce_email_footer', $email ); ?>
