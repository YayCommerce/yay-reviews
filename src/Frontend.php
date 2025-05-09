<?php
namespace YayReviews;

use YayReviews\Classes\Helpers;
use YayReviews\Classes\View as View;
class Frontend {
    public function __construct() {
        if( ! Helpers::get_settings( 'general', 'enabled', true ) ) {
            return;
        }
        add_filter('woocommerce_product_review_comment_form_args', array($this, 'add_photo_fields'));
        add_filter('woocommerce_product_review_comment_form_args', array($this, 'add_optional_fields'));
        add_filter('woocommerce_product_review_comment_form_args', array($this, 'add_gdpr'));
        add_action('comment_post', array($this, 'save_custom_review_fields'));
        add_action('pre_comment_on_post', array( $this, 'pre_comment_on_post' ));
        add_action('woocommerce_review_after_comment_text', array($this, 'review_after_comment_text'), 10, 1);
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));

        
    }

    public function add_photo_fields($comment_form) {
        if( Helpers::get_settings( 'reviews', 'enabled_photos_videos', false ) ) {
            $comment_form['comment_field'] .= View::load( 'frontend.photo-field', array(), false );
        }
        return $comment_form;
    }
    public function add_optional_fields($comment_form) {
        if( ! Helpers::get_settings( 'optional_fields', 'enabled', false ) ) {
            return $comment_form;
        }
        $op_fields = Helpers::get_settings( 'optional_fields', 'fields', array() );
        // Loop through each custom field in the array
        foreach ($op_fields as $field) {
            if(!isset($field['value'])) {
                $field['value'] = '';
            }
            // Generate the HTML for each field based on its type
            switch ($field['type']) {
                case 'text':
                    $comment_form['comment_field'] .= '<div class="yay-reviews-field yay-reviews-field-' . esc_attr($field['name']) . '">
                        <label for="' . esc_attr($field['name']) . '">' . esc_html($field['label']) . '</label>
                        <input type="text" name="' . esc_attr($field['name']) . '" id="' . esc_attr($field['name']) . '" value="' . esc_attr($field['value']) . '" />
                    </div>';
                    break;
                
                case 'dropdown':
                    // Split values into options for the dropdown
                    $options = explode('|', $field['value']);
                    $dropdown_html = '<select name="' . esc_attr($field['name']) . '" id="' . esc_attr($field['name']) . '">';
                    foreach ($options as $option) {
                        $dropdown_html .= '<option value="' . esc_attr($option) . '">' . esc_html($option) . '</option>';
                    }
                    $dropdown_html .= '</select>';
                    
                    $comment_form['comment_field'] .= '<div class="yay-reviews-field yay-reviews-field-' . esc_attr($field['name']) . '">
                        <label for="' . esc_attr($field['name']) . '">' . esc_html($field['label']) . '</label>' . $dropdown_html . '
                    </div>';
                    break;

                case 'textarea':
                    $comment_form['comment_field'] .= '<div class="yay-reviews-field yay-reviews-field-' . esc_attr($field['name']) . '">
                        <label for="' . esc_attr($field['name']) . '">' . esc_html($field['label']) . '</label>
                        <textarea name="' . esc_attr($field['name']) . '" id="' . esc_attr($field['name']) . '">' . esc_textarea($field['value']) . '</textarea>
                    </div>';
                    break;
            }
        }
        return $comment_form;
    }
    public function add_gdpr($comment_form) {
        if( Helpers::get_settings( 'reviews', 'enabled_gdpr_checkbox', false ) ) {
            $data                            = array('gdpr_message' => Helpers::get_settings( 'reviews', 'gdpr_message', '' ));
            $comment_form['comment_field']  .= View                 :: load( 'frontend.gdpr-field', $data, false );
        }
        return $comment_form;
    }
    public function pre_comment_on_post($comment_post_ID) {
        if ( Helpers::get_settings( 'reviews', 'enabled_photos_videos', false )) {
            //validate required files
            if( Helpers::get_settings( 'reviews', 'upload_required', false ) ) {
                if( !isset($_FILES['yay_reviews_field_photos']) || count($_FILES['yay_reviews_field_photos']) == 0 || empty( $_FILES['yay_reviews_field_photos']['name'][0] ) ) {
                    wp_die( esc_html__( 'Please upload at least 1 photo or video.' , 'yay_reviews') );
                }
            }
            //validate file size
            if(isset($_FILES['yay_reviews_field_photos'])) {
                $files = $_FILES['yay_reviews_field_photos'];
                $total_files = count($files['name']);
                if( $total_files > Helpers::get_settings( 'reviews', 'max_upload_file_qty', Helpers::upload_max_qty() ) ) {
                    wp_die( esc_html__( 'The number of files you uploaded exceeds the allowed limit.' , 'yay_reviews') );
                }
                $max_upload_size = Helpers::get_settings( 'reviews', 'max_upload_file_size', Helpers::upload_max_size() ) * 1000;//converts to byte
                for ($i = 0; $i < $total_files; $i++) {
                    if($files['size'][$i] > $max_upload_size) {
                        $text = esc_html__( 'The size of the file %s is too large; the maximum allowed size is %sKB.', 'yay_reviews' );
                        wp_die( sprintf( $text, $files['name'][$i], ($max_upload_size / 1000) ) );
                    }
                }
            }
        }
        if ( Helpers::get_settings( 'reviews', 'enabled_gdpr_checkbox', false )) {
            if( ! isset($_POST['yay-reviews-gdpr-checkbox']) ) {
                wp_die( esc_html__( 'Please check GDPR checkbox.' , 'yay_reviews') );
            }
        }
    }
    
    public function save_custom_review_fields($comment_id) {
        if ( Helpers::get_settings( 'reviews', 'enabled_photos_videos', false )) {
            if(isset($_FILES['yay_reviews_field_photos'])) {
                $files       = $_FILES['yay_reviews_field_photos'];
                $total_files = count($files['name']);
                if( $total_files > Helpers::get_settings( 'reviews', 'max_upload_file_qty', Helpers::upload_max_qty() ) ) {
                    return;
                }
                $max_upload_size = Helpers::get_settings( 'reviews', 'max_upload_file_size', Helpers::upload_max_size() ) * 1000;//converts to byte

                include_once ABSPATH . 'wp-admin/includes/image.php';
                include_once ABSPATH . 'wp-admin/includes/file.php';
                include_once ABSPATH . 'wp-admin/includes/media.php';

                $paths = array();
                for ($i = 0; $i < $total_files; $i++) {
                    // Get file information
                    $file = array(
                        'name'     => $files['name'][$i],
                        'type'     => $files['type'][$i],
                        'tmp_name' => $files['tmp_name'][$i],
                        'error'    => $files['error'][$i],
                        'size'     => $files['size'][$i]
                    );
                    if( $file['size'] > $max_upload_size ) {
                        //file's to large
                        continue;
                    }
                    if ($file['error'] === UPLOAD_ERR_OK) {
                        // Upload the file to WordPress
                        $movefile = wp_handle_upload($file, array('test_form' => false));

                        // Check for upload errors
                        if (isset($upload['error'])) {
                            error_log("Failed to upload image: {$file['name']}. Error: " . $upload['error'] . "\n");
                            continue;
                        }
                        $uploads  = wp_upload_dir();
                        $filename = basename( $movefile['url'] );
                        $paths[]  = $uploads['subdir'] . "/$filename";
                    }
                }
                add_comment_meta($comment_id, 'yay_reviews_photos', $paths);
            }
        }
        if ( Helpers::get_settings( 'optional_fields', 'enabled', false )) {
            $op_fields = Helpers::get_settings( 'optional_fields', 'fields', array() );
            foreach ($op_fields as $field) {
                if(isset($_POST[$field['name']])) {
                    update_comment_meta($comment_id, 'yay_reviews_' . $field['name'], sanitize_text_field($_POST[$field['name']]));
                }
            }
        }
    }
    public function review_after_comment_text($comment) {
        $photos = get_comment_meta($comment->comment_ID, 'yay_reviews_photos', true);
        if (is_array( $photos ) && count( $photos ) > 0) {
            Helpers::print_photos($photos);
        }
    }
    public function frontend_enqueue_scripts() {
        wp_enqueue_script('yay-reviews-script', YAY_REVIEWS_PLUGIN_URL . '/assets/frontend/js/yay-reviews.js', array('jquery'), null, true);
        wp_localize_script('yay-reviews-script', 'yay_reviews', array(
            'ajax_url'   => admin_url('admin-ajax.php'),
            'nonce'      => wp_create_nonce('yay-reviews-nonce'),
            'max_upload' => intval(Helpers::get_settings( 'reviews', 'max_upload_file_qty', Helpers::upload_max_qty() ))
        ));
        wp_enqueue_style('yay-reviews-style', YAY_REVIEWS_PLUGIN_URL . '/assets/frontend/css/yay-reviews.css', array(), '1.0');
    }
}
