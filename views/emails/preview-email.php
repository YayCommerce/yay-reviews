<?php
defined( 'ABSPATH' ) || exit;
use Automattic\WooCommerce\Utilities\FeaturesUtil;

$email_heading              = $data['heading'];
$content                    = $data['content'];
$email_improvements_enabled = FeaturesUtil::feature_is_enabled( 'email_improvements' );

// Load colors.
$bg               = get_option( 'woocommerce_email_background_color' );
$body             = get_option( 'woocommerce_email_body_background_color' );
$base             = get_option( 'woocommerce_email_base_color' );
$text             = get_option( 'woocommerce_email_text_color' );
$footer_text      = get_option( 'woocommerce_email_footer_text_color' );
$border_color     = wc_light_or_dark( $body, 'rgba(0, 0, 0, .2)', 'rgba(255, 255, 255, .2)' );
$header_alignment = get_option( 'woocommerce_email_header_alignment', $email_improvements_enabled ? 'left' : false );
$logo_image_width = get_option( 'woocommerce_email_header_image_width', '120' );
$default_font     = 'Helvetica';
$font_family      = $email_improvements_enabled ? get_option( 'woocommerce_email_font_family', $default_font ) : $default_font;

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=<?php bloginfo( 'charset' ); ?>" />
		<meta content="width=device-width, initial-scale=1.0" name="viewport">
		<title><?php echo wp_kses_post( get_bloginfo( 'name', 'display' ) ); ?></title>
	</head>
	<body <?php echo is_rtl() ? 'rightmargin' : 'leftmargin'; ?>="0" marginwidth="0" topmargin="0" marginheight="0" offset="0">
		<table width="100%" id="outer_wrapper">
			<tr>
				<td><!-- Deliberately empty to support consistent sizing and layout across multiple email clients. --></td>
				<td width="600">
					<div id="wrapper" dir="<?php echo is_rtl() ? 'rtl' : 'ltr'; ?>">
						<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="inner_wrapper">
							<tr>
								<td align="center" valign="top">
									<?php
									$img = get_option( 'woocommerce_email_header_image' );
									/**
									 * This filter is documented in templates/emails/email-styles.php
									 *
									 * @since 9.6.0
									 */
									if ( apply_filters( 'woocommerce_is_email_preview', false ) ) {
										$img_transient = get_transient( 'woocommerce_email_header_image' );
										$img           = false !== $img_transient ? $img_transient : $img;
									}

									if ( $email_improvements_enabled ) :
										?>
										<table border="0" cellpadding="0" cellspacing="0" width="100%">
											<tr>
												<td id="template_header_image">
													<?php
													if ( $img ) {
														echo '<p style="margin-top:0;"><img src="' . esc_url( $img ) . '" alt="' . esc_attr( get_bloginfo( 'name', 'display' ) ) . '" /></p>';
													} else {
														echo '<p class="email-logo-text" style="color: ' . esc_attr( $text ) . ';font-family: ' . esc_attr( $font_family ) . ';font-size: 18px;margin-bottom: 0;text-align: left;">' . esc_html( get_bloginfo( 'name', 'display' ) ) . '</p>';
													}
													?>
												</td>
											</tr>
										</table>
									<?php else : ?>
										<div id="template_header_image">
											<?php
											if ( $img ) {
												echo '<p style="margin-top:0;"><img src="' . esc_url( $img ) . '" alt="' . esc_attr( get_bloginfo( 'name', 'display' ) ) . '" /></p>';
											}
											?>
										</div>
									<?php endif; ?>
									<table border="0" cellpadding="0" cellspacing="0" width="100%" id="template_container">
										<tr>
											<td align="center" valign="top">
												<!-- Header -->
												<table border="0" cellpadding="0" cellspacing="0" width="100%" id="template_header">
													<tr>
														<td id="header_wrapper">
															<h1 style="color: <?php echo esc_attr( $text ); ?>;font-family: <?php echo esc_attr( $font_family ); ?>;font-size: 32px;"><?php echo wp_kses_post( $email_heading ); ?></h1>
														</td>
													</tr>
												</table>
												<!-- End Header -->
											</td>
										</tr>
										<tr>
											<td align="center" valign="top">
												<!-- Body -->
												<table border="0" cellpadding="0" cellspacing="0" width="100%" id="template_body">
													<tr>
														<td valign="top" id="body_content">
															<!-- Content -->
															<table border="0" cellpadding="20" cellspacing="0" width="100%">
																<tr>
																	<td valign="top" id="body_content_inner_cell">
																		<div id="body_content_inner">
																			<div class="email-content">
																				<?php echo wp_kses_post( $content ); ?>
																			</div>
																		</div>
																	</td>
																</tr>
															</table>
															<!-- End Content -->
														</td>
													</tr>
												</table>
												<!-- End Body -->
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
						</table>
					</div>
				</td>
				<td><!-- Deliberately empty to support consistent sizing and layout across multiple email clients. --></td>
			</tr>
		</table>
	</body>
</html>