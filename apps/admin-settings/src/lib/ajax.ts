export async function changeAddonStatus(addon_id: string, status: string) {
  try {
    return await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yay_reviews_change_addon_status',
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
        action: 'yay_reviews_send_email',
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
        action: 'yay_reviews_dismiss_email',
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
        action: 'yay_reviews_get_current_queue',
        nonce: window.yayReviews.nonce,
        email_id: emailId,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}