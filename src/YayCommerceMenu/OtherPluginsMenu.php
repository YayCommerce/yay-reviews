<?php
/**
 * YayCommerce other plugins menu
 *
 * @package YayRev
 */

namespace YayRev\YayCommerceMenu;

defined( 'ABSPATH' ) || exit;

/**
 * Declare class
 */
class OtherPluginsMenu {

	protected static $instance = null;

	public static function get_instance() {
		if ( empty( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	protected function __construct() {
		add_action( 'wp_ajax_yay_recommended_get_plugin_data', array( $this, 'yay_recommended_get_plugin_data' ) );
		add_action( 'wp_ajax_yay_recommended_activate_plugin', array( $this, 'yay_recommended_activate_plugin' ) );
		add_action( 'wp_ajax_yay_recommended_upgrade_plugin', array( $this, 'yay_recommended_upgrade_plugin' ) );
		add_action( 'admin_enqueue_scripts', function() {
			$screen    = get_current_screen();
			$screen_id = $screen ? $screen->id : '';
			if ( ! ( $screen_id === 'yaycommerce_page_yaycommerce-other-plugins' ) ) {
				return;
			}
			wp_enqueue_script( 'yaycommerce-other-plugins-script', YAYREV_PLUGIN_URL . 'src/YayCommerceMenu/assets/js/other-plugins-main.js', [], '1.0', true );
			wp_enqueue_style( 'yaycommerce-other-plugins-script', YAYREV_PLUGIN_URL . 'src/YayCommerceMenu/assets/css/other-plugins-main.css', [], '1.0' );
		} );
	}

	public static function render() {
		if ( function_exists( 'WC' ) ) {
			$featured_tab = '<li class="plugin-install-tab plugin-install-featured" data-tab="featured"><a href="#" >Featured</a> </li>';
			$woo_tab      = '<li class="plugin-install-tab plugin-install-woocommerce" data-tab="woocommerce"><a href="#" class="current" aria-current="page">WooCommerce</a> </li>';
		} else {
			$featured_tab = '<li class="plugin-install-tab plugin-install-featured" data-tab="featured"><a href="#" class="current" aria-current="page">Featured</a> </li>';
			$woo_tab      = '<li class="plugin-install-tab plugin-install-woocommerce" data-tab="woocommerce"><a href="#" >WooCommerce</a> </li>';
		}
		?>
		<div class="wrap">
			<div class="yay-recommended-plugins-layout">
				<div class="yay-recommended-plugins-layout-header">
					<div class="wp-filter yay-recommended-plugins-header">
						<h2 class="yay-recommended-plugins-header-title"><?php esc_attr_e( 'Other Plugins', 'yay-customer-reviews-woocommerce' ); ?></h2>
						<ul class="filter-links">
							<?php
							echo wp_kses_post( $featured_tab );
							?>
							<li class="plugin-install-tab plugin-install-all" data-tab="all"><a href="#">All</a></li>
							<?php
							echo wp_kses_post( $woo_tab );
							?>
							<li class="plugin-install-tab plugin-install-management" data-tab="management"><a href="#">Management</a> </li>
							<li class="plugin-install-tab plugin-install-marketing" data-tab="marketing"><a href="#">Marketing</a></li>
						</ul>
					</div>
				</div>
				<div class="wp-list-table widefat plugin-install">
					<div id="the-list"></div>
				</div>
			</div>
		</div>
		<?php
	}

	public static function enqueue_scripts() {
		wp_enqueue_script( 'plugin-install' );
		wp_enqueue_script( 'thickbox' );
		wp_enqueue_style( 'thickbox' );
		wp_register_script( 'yaycommerce-other-plugins', plugin_dir_url( __FILE__ ) . '/assets/js/other-plugins.js', array( 'jquery' ), '1.0', true );
		wp_localize_script(
			'yaycommerce-other-plugins',
			'yayRecommended',
			array(
				'nonce'      => wp_create_nonce( 'yay_recommended_nonce' ),
				'admin_ajax' => admin_url( 'admin-ajax.php' ),
				'woo_active' => function_exists( 'WC' ),
			)
		);
		wp_enqueue_script( 'yaycommerce-other-plugins' );
	}

	public static function load_data() {
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_scripts' ) );
	}

	public static function get_other_plugins() {
		return array(
			'filebird'          => array(
				'slug'              => 'filebird',
				'name'              => 'FileBird - WordPress Media Library Folders & File Manager',
				'short_description' => 'Organize thousands of WordPress media files in folders / categories at ease.',
				'icon'              => 'https://ps.w.org/filebird/assets/icon-128x128.gif?rev=2299145',
				'download_link'     => 'https://downloads.wordpress.org/plugin/filebird.zip',
				'type'              => array( 'featured' ),
				'version'           => 0,
			),
			'yaymail'           => array(
				'slug'              => 'yaymail',
				'name'              => 'YayMail - WooCommerce Email Customizer',
				'short_description' => 'Customize WooCommerce email templates with live preview & drag and drop email builder.',
				'icon'              => 'https://ps.w.org/yaymail/assets/icon-256x256.gif?rev=2599198',
				'download_link'     => 'https://downloads.wordpress.org/plugin/yaymail.zip',
				'type'              => array( 'featured', 'woocommerce' ),
				'version'           => 0,
			),
			'yaycurrency'       => array(
				'slug'              => 'yaycurrency',
				'name'              => 'YayCurrency - WooCommerce Multi-Currency Switcher',
				'short_description' => 'WooCommerce Multi-Currency made easy, powerful, and flexible.',
				'icon'              => 'https://ps.w.org/yaycurrency/assets/icon-256x256.png?rev=2550570',
				'download_link'     => 'https://downloads.wordpress.org/plugin/yaycurrency.zip',
				'type'              => array( 'featured', 'woocommerce' ),
				'version'           => 0,
			),
			'yayswatches'       => array(
				'slug'              => 'yayswatches',
				'name'              => 'YaySwatches - Variation Swatches for WooCommerce',
				'short_description' => 'Optimize your variable product showcase with color swatches, image swatches, custom images, buttons, and more!',
				'icon'              => 'https://ps.w.org/yayswatches/assets/icon-256x256.png?rev=2757155',
				'download_link'     => 'https://downloads.wordpress.org/plugin/yayswatches.zip',
				'type'              => array( 'woocommerce' ),
				'version'           => 0,
			),
			'yayextra'          => array(
				'slug'              => 'yayextra',
				'name'              => 'YayExtra - WooCommerce Extra Product Options',
				'short_description' => 'Add WooCommerce product options like personal engraving, print-on-demand items, gifts, custom canvas prints, and personalized products.',
				'icon'              => 'https://ps.w.org/yayextra/assets/icon-256x256.png?rev=2776349',
				'download_link'     => 'https://downloads.wordpress.org/plugin/yayextra.zip',
				'type'              => array( 'woocommerce' ),
				'version'           => 0,
			),
			'yaypricing'        => array(
				'slug'              => 'yaypricing',
				'name'              => 'YayPricing - WooCommerce Dynamic Pricing & Discounts',
				'short_description' => 'Offer automatic pricing and discounts to design a powerful marketing strategy for your WooCommerce store.',
				'icon'              => 'https://ps.w.org/yaypricing/assets/icon-256x256.png',
				'download_link'     => 'https://downloads.wordpress.org/plugin/yaypricing.zip',
				'type'              => array( 'woocommerce' ),
				'version'           => 0,
			),
			'yaysmtp'           => array(
				'slug'              => 'yaysmtp',
				'name'              => 'YaySMTP - Simple WP SMTP Mail',
				'short_description' => 'Send WordPress emails successfully with WP Mail SMTP via your favorite Mailer.',
				'icon'              => 'https://ps.w.org/yaysmtp/assets/icon-256x256.png?rev=2437984',
				'download_link'     => 'https://downloads.wordpress.org/plugin/yaysmtp.zip',
				'type'              => array( 'featured', 'marketing' ),
				'version'           => 0,
			),
			'wp-whatsapp'       => array(
				'slug'              => 'wp-whatsapp',
				'name'              => 'WP Chat App',
				'short_description' => 'Integrate WhatsApp experience directly into your WordPress website.',
				'icon'              => 'https://ps.w.org/wp-whatsapp/assets/icon-256x256.png?rev=2725670',
				'download_link'     => 'https://downloads.wordpress.org/plugin/wp-whatsapp.zip',
				'type'              => array( 'featured' ),
				'version'           => 0,
			),
			'filester'          => array(
				'slug'              => 'filester',
				'name'              => 'Filester - File Manager Pro',
				'short_description' => 'Best WordPress file manager without FTP access. Clean design. No need to upgrade because this…',
				'icon'              => 'https://ps.w.org/filester/assets/icon-256x256.gif?rev=2305540',
				'download_link'     => 'https://downloads.wordpress.org/plugin/filester.zip',
				'type'              => array( 'management' ),
				'version'           => 0,
			),
			'cf7-multi-step'    => array(
				'slug'              => 'cf7-multi-step',
				'name'              => 'Multi Step for Contact Form 7',
				'short_description' => 'Break your looooooong form into user-friendly steps.',
				'icon'              => 'https://ps.w.org/cf7-multi-step/assets/icon-256x256.png?rev=1994366',
				'download_link'     => 'https://downloads.wordpress.org/plugin/cf7-multi-step.zip',
				'type'              => array( 'management' ),
				'version'           => 0,
			),
			'cf7-database'      => array(
				'slug'              => 'cf7-database',
				'name'              => 'Database for Contact Form 7',
				'short_description' => 'Automatically save all data submitted via Contact Form 7 to your database.',
				'icon'              => 'https://ps.w.org/cf7-database/assets/icon-128x128.png?rev=1614091',
				'download_link'     => 'https://downloads.wordpress.org/plugin/cf7-database.zip',
				'type'              => array( 'management' ),
				'version'           => 0,
			),
			'wp-duplicate-page' => array(
				'slug'              => 'wp-duplicate-page',
				'name'              => 'WP Duplicate Page',
				'short_description' => 'Clone WordPress page, post, custom post types.',
				'icon'              => 'https://ps.w.org/wp-duplicate-page/assets/icon-256x256.gif?rev=2432962',
				'download_link'     => 'https://downloads.wordpress.org/plugin/wp-duplicate-page.zip',
				'type'              => array( 'management' ),
				'version'           => 0,
			),
			'notibar'           => array(
				'slug'              => 'notibar',
				'name'              => 'Notibar - Notification Bar for WordPress',
				'short_description' => 'Customizer for sticky header, notification bar, alert, promo code, marketing campaign, top banner.',
				'icon'              => 'https://ps.w.org/notibar/assets/icon-256x256.png?rev=2387855',
				'download_link'     => 'https://downloads.wordpress.org/plugin/notibar.zip',
				'type'              => array( 'marketing' ),
				'version'           => 0,
			),
		);
	}

	public function yay_recommended_get_plugin_data() {
		try {
			if ( isset( $_POST['tab'] ) ) {
				$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
				if ( ! wp_verify_nonce( $nonce, 'yay_recommended_nonce' ) ) {
					wp_send_json_error( array( 'mess' => __( 'Nonce is invalid', 'yay-customer-reviews-woocommerce' ) ) );
				}
				require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
				$tab                 = sanitize_text_field( wp_unslash( $_POST['tab'] ) );
				$recommended_plugins = array();
				$recommended_data    = apply_filters( 'yay_recommended_plugins_excluded', self::get_other_plugins() );
				foreach ( $recommended_data as $key => $plugin ) {
					if ( in_array( $tab, $plugin['type'] ) || 'all' === $tab ) {
						$recommended_plugins[ $key ] = $plugin;
					}
				}
				ob_start();
				$path = plugin_dir_path( __FILE__ ) . 'views/other-plugins-content.php';
				include $path;
				$html = ob_get_contents();
				ob_end_clean();
				wp_send_json_success(
					array(
						'mess' => __( 'Get data success', 'yay-customer-reviews-woocommerce' ),
						'html' => $html,
					)
				);
			}
		} catch ( \Exception $ex ) {
			wp_send_json_error(
				array(
					'mess' => __( 'Error exception.', 'yay-customer-reviews-woocommerce' ),
					array(
						'error' => $ex,
					),
				)
			);
		} catch ( \Error $ex ) {
			wp_send_json_error(
				array(
					'mess' => __( 'Error.', 'yay-customer-reviews-woocommerce' ),
					array(
						'error' => $ex,
					),
				)
			);
		}
	}

	public function yay_recommended_activate_plugin() {
		try {
			if ( isset( $_POST['file'] ) ) {
				$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
				if ( ! wp_verify_nonce( $nonce, 'yay_recommended_nonce' ) ) {
					wp_send_json_error( array( 'mess' => __( 'Nonce is invalid', 'yay-customer-reviews-woocommerce' ) ) );
				}
				$file   = sanitize_file_name( wp_unslash( $_POST['file'] ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotUnslashed
				$result = activate_plugin( $file );

				if ( is_wp_error( $result ) ) {
					wp_send_json_error(
						array(
							'mess' => $result->get_error_message(),
						)
					);
				}
				wp_send_json_success(
					array(
						'mess' => __( 'Activate success', 'yay-customer-reviews-woocommerce' ),
					)
				);
			}
		} catch ( \Exception $ex ) {
			wp_send_json_error(
				array(
					'mess' => __( 'Error exception.', 'yay-customer-reviews-woocommerce' ),
					array(
						'error' => $ex,
					),
				)
			);
		} catch ( \Error $ex ) {
			wp_send_json_error(
				array(
					'mess' => __( 'Error.', 'yay-customer-reviews-woocommerce' ),
					array(
						'error' => $ex,
					),
				)
			);
		}
	}

	public function yay_recommended_upgrade_plugin() {
		try {
			require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
			require_once ABSPATH . 'wp-admin/includes/class-wp-ajax-upgrader-skin.php';
			require_once ABSPATH . 'wp-admin/includes/class-plugin-upgrader.php';
			if ( isset( $_POST['plugin'] ) ) {
				$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
				if ( ! wp_verify_nonce( $nonce, 'yay_recommended_nonce' ) ) {
					wp_send_json_error( array( 'mess' => __( 'Nonce is invalid', 'yay-customer-reviews-woocommerce' ) ) );
				}
				$plugin   = sanitize_text_field( wp_unslash( $_POST['plugin'] ) );
				$type     = isset( $_POST['type'] ) ? sanitize_text_field( wp_unslash( $_POST['type'] ) ) : 'install';
				$skin     = new \WP_Ajax_Upgrader_Skin();
				$upgrader = new \Plugin_Upgrader( $skin );
				if ( 'install' === $type ) {
					$result = $upgrader->install( $plugin );
					if ( is_wp_error( $result ) ) {
						wp_send_json_error(
							array(
								'mess' => $result->get_error_message(),
							)
						);
					}
					$args        = array(
						'slug'   => $upgrader->result['destination_name'],
						'fields' => array(
							'short_description' => true,
							'icons'             => true,
							'banners'           => false,
							'added'             => false,
							'reviews'           => false,
							'sections'          => false,
							'requires'          => false,
							'rating'            => false,
							'ratings'           => false,
							'downloaded'        => false,
							'last_updated'      => false,
							'added'             => false,
							'tags'              => false,
							'compatibility'     => false,
							'homepage'          => false,
							'donate_link'       => false,
						),
					);
					$plugin_data = plugins_api( 'plugin_information', $args );
					if ( $plugin_data && ! is_wp_error( $plugin_data ) ) {
						$install_status = install_plugin_install_status( $plugin_data );
						$active_plugin  = activate_plugin( $install_status['file'] );
						if ( is_wp_error( $active_plugin ) ) {
							wp_send_json_error(
								array(
									'mess' => $active_plugin->get_error_message(),
								)
							);
						} else {
							wp_send_json_success(
								array(
									'mess' => __( 'Install success', 'yay-customer-reviews-woocommerce' ),
								)
							);
						}
					} else {
						wp_send_json_error(
							array(
								'mess' => 'Error',
							)
						);
					}
				} else {
					$is_active = is_plugin_active( $plugin );
					$result    = $upgrader->upgrade( $plugin );
					if ( is_wp_error( $result ) ) {
						wp_send_json_error(
							array(
								'mess' => $result->get_error_message(),
							)
						);
					} else {
						activate_plugin( $plugin );
						wp_send_json_success(
							array(
								'mess'   => __( 'Update success', 'yay-customer-reviews-woocommerce' ),
								'active' => $is_active,
							)
						);
					}
				}
			}
		} catch ( \Exception $ex ) {
			wp_send_json_error(
				array(
					'mess' => __( 'Error exception.', 'yay-customer-reviews-woocommerce' ),
					array(
						'error' => $ex,
					),
				)
			);
		} catch ( \Error $ex ) {
			wp_send_json_error(
				array(
					'mess' => __( 'Error.', 'yay-customer-reviews-woocommerce' ),
					array(
						'error' => $ex,
					),
				)
			);
		}
	}

	public function check_pro_version_exists( $plugin_detail ) {
		$exist_pro_ver = false;
		$all_plugin    = get_plugins();
		if ( 'filebird' === $plugin_detail['slug'] ) {
			$exist_pro_ver = array_key_exists( 'filebird-pro/filebird.php', $all_plugin ) === true ? 'filebird-pro/filebird.php' : false;
		}
		if ( 'yaymail' === $plugin_detail['slug'] ) {
			if ( array_key_exists( 'yaymail-pro/yaymail.php', $all_plugin ) ) {
				$exist_pro_ver = 'yaymail-pro/yaymail.php';
			} elseif ( array_key_exists( 'email-customizer-for-woocommerce/yaymail.php', $all_plugin ) ) {
				$exist_pro_ver = 'email-customizer-for-woocommerce/yaymail.php';
			}
		}
		if ( 'yaycurrency' === $plugin_detail['slug'] ) {
			if ( array_key_exists( 'yaycurrency-pro/yay-currency.php', $all_plugin ) ) {
				$exist_pro_ver = 'yaycurrency-pro/yay-currency.php';
			} elseif ( array_key_exists( 'multi-currency-switcher/yay-currency.php', $all_plugin ) ) {
				$exist_pro_ver = 'multi-currency-switcher/yay-currency.php';
			}
		}
		if ( 'yaysmtp' === $plugin_detail['slug'] ) {
			$exist_pro_ver = array_key_exists( 'yaysmtp-pro/yay-smtp.php', $all_plugin ) === true ? 'yaysmtp-pro/yay-smtp.php' : false;
		}
		if ( 'yayswatches' === $plugin_detail['slug'] ) {
			$exist_pro_ver = array_key_exists( 'yayswatches-pro/yay-swatches.php', $all_plugin ) === true ? 'yayswatches-pro/yay-swatches.php' : false;
		}
		if ( 'yayextra' === $plugin_detail['slug'] ) {
			$exist_pro_ver = array_key_exists( 'yayextra-pro/yayextra.php', $all_plugin ) === true ? 'yayextra-pro/yayextra.php' : false;
		}
		if ( 'yaypricing' === $plugin_detail['slug'] ) {
			if ( array_key_exists( 'yaypricing-pro/yaypricing.php', $all_plugin ) ) {
				$exist_pro_ver = 'yaypricing-pro/yaypricing.php';
			} elseif ( array_key_exists( 'dynamic-pricing-discounts/yaypricing.php', $all_plugin ) ) {
				$exist_pro_ver = 'dynamic-pricing-discounts/yaypricing.php';
			}
		}
		if ( 'cf7-multi-step' === $plugin_detail['slug'] ) {
			$exist_pro_ver = array_key_exists( 'contact-form-7-multi-step-pro/contact-form-7-multi-step.php', $all_plugin ) === true ? 'contact-form-7-multi-step-pro/contact-form-7-multi-step.php' : false;
		}
		if ( 'cf7-database' === $plugin_detail['slug'] ) {
			$exist_pro_ver = array_key_exists( 'contact-form-7-database-pro/cf7-database.php', $all_plugin ) === true ? 'contact-form-7-database-pro/cf7-database.php' : false;
		}
		if ( 'wp-whatsapp' === $plugin_detail['slug'] ) {
			$exist_pro_ver = array_key_exists( 'whatsapp-for-wordpress/whatsapp.php', $all_plugin ) === true ? 'whatsapp-for-wordpress/whatsapp.php' : false;
		}
		return $exist_pro_ver;
	}
}
