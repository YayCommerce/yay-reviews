export async function changeAddonStatus(addon_id: string, status: string) {
  try {
    return await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yayrev_change_addon_status',
        nonce: window.yayReviews.nonce,
        addon_id,
        status,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function sendEmail(emailId: string) {
  try {
    return await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yayrev_send_email',
        nonce: window.yayReviews.nonce,
        email_id: emailId,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function dismissEmail(emailId: string) {
  try {
    return await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yayrev_dismiss_email',
        nonce: window.yayReviews.nonce,
        email_id: emailId,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getCurrentQueue(emailId: string) {
  try {
    return await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yayrev_get_current_queue',
        nonce: window.yayReviews.nonce,
        email_id: emailId,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function changeWcReviewsSettings(updateField: string, value: boolean) {
  try {
    return await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yayrev_update_wc_reviews_settings',
        nonce: window.yayReviews.nonce,
        update_field: updateField,
        value: value,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function previewEmail(email: string) {
  try {
    return await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yayrev_preview_email',
        nonce: window.yayReviews.nonce,
        email,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function initAppSettings(data: {
  request_review_timing: string;
  review_type: string;
}) {
  try {
    return await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yayrev_finish_wizard',
        nonce: window.yayReviews.nonce,
        request_review_timing: parseInt(data.request_review_timing ?? '5'),
        review_type: data.review_type ?? 'media',
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
