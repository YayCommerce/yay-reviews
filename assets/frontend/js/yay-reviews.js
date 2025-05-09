jQuery(document).ready(function($) {
    if(jQuery('#yay_reviews_field_photos').closest('form').length) {
        jQuery('#yay_reviews_field_photos').closest('form')[0].encoding = 'multipart/form-data';
    }
    
    $('#yay_reviews_field_photos').on('change', function(event) {
        var max_upload = parseInt( yay_reviews.max_upload )

        var files = event.target.files;
        var thumbnailsContainer = $('.yay-reviews-thumbnails');
        thumbnailsContainer.empty(); // Clear existing thumbnails

        if (files.length > max_upload) {
            alert('You can only upload a maximum of '+max_upload+' files.');
            $('#yay_reviews_field_photos').val(''); // Clear the input field
            return;
        }

        $.each(files, function(index, file) {
            if (file.type.startsWith('image/')) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var thumbnail = $('<div class="yay-reviews-thumbnail">')
                        .append($('<img>').attr('src', e.target.result));
                        // .append($('<span class="delete-icon">&times;</span>'));
                    
                    thumbnailsContainer.append(thumbnail);

                    // Handle delete icon click
                    thumbnail.find('.delete-icon').on('click', function() {
                        thumbnail.remove();
                        // Remove the file from the input
                        var newFiles = [];
                        $.each(files, function(i, f) {
                            if (i !== index) {
                                newFiles.push(f);
                            }
                        });
                        $('#yay_reviews_field_photos')[0].files = new FileListItems(newFiles);
                    });
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                var video = document.createElement('video');
                video.preload = 'metadata';

                video.onloadedmetadata = function() {
                    window.URL.revokeObjectURL(video.src);
                    video.currentTime = 1;
                };

                video.onseeked = function() {
                    var canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 100;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    var thumbnail = $('<div class="yay-reviews-thumbnail">')
                        .append($('<img>').attr('src', canvas.toDataURL()));
                        // .append($('<span class="delete-icon">&times;</span>'));

                    thumbnailsContainer.append(thumbnail);

                    // Handle delete icon click
                    thumbnail.find('.delete-icon').on('click', function() {
                        thumbnail.remove();
                        // Remove the file from the input
                        var newFiles = [];
                        $.each(files, function(i, f) {
                            if (i !== index) {
                                newFiles.push(f);
                            }
                        });
                        $('#yay_reviews_field_photos')[0].files = new FileListItems(newFiles);
                    });
                };

                video.src = URL.createObjectURL(file);
            }
        });
        // Utility function to create a new FileList object
        function FileListItems(files) {
            var b = new ClipboardEvent('').clipboardData || new DataTransfer();
            for (var i = 0, len = files.length; i < len; i++) b.items.add(files[i]);
            return b.files;
        }
    });
    $(document).on('click', '.yay-reviews-photo', function(){
        var imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        var videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
        function getFileExtension(fileName) {
            return fileName.split('.').pop().toLowerCase();
        }
        function getMimeType(extension) {
            var mimeTypes = {
                'mp4': 'video/mp4',
                'avi': 'video/x-msvideo',
                'mov': 'video/quicktime',
                'wmv': 'video/x-ms-wmv',
                'flv': 'video/x-flv',
                'mkv': 'video/x-matroska',
                // Add more mappings as needed
            };
            return mimeTypes[extension] || 'application/octet-stream';
        }
        var img_photo = $(this).find('img')

        var preview_obj = $(this).closest('.yay-reviews-photos').next('.yay-reviews-preview-photo')

        var src = img_photo.attr('data-src')
        var ext = getFileExtension(src);
        var mimeType = getMimeType(ext);

        //empty all preview
        $('.yay-reviews-preview-photo').html('');
        //remove/add active class
        $('.yay-reviews-photo').removeClass('active')
        $(this).addClass('active')

        if ($.inArray(ext, imageExtensions) !== -1) {
            preview_obj.html('<img src="'+src+'" alt="" />');
        } else if ($.inArray(ext, videoExtensions) !== -1) {
            preview_obj.html('<video width="320" height="240" controls><source src="' + src + '" type="' + mimeType + '">Your browser does not support the video tag.</video>');
        } 
    })
});
