export async function changeAddonStatus(addon_id: string, status: string) {
  try {
    const response = await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yay_reviews_change_addon_status',
        nonce: window.yayReviews.nonce,
        addon_id,
        status,
      },
    });
    if (!response.success) {
      throw new Error('Call ajax failed');
    }
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function sendEmail(emailId: string) {
  try {
    const response = await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yay_reviews_send_email',
        nonce: window.yayReviews.nonce,
        email_id: emailId,
      },
    });
    if (!response.success) {
      throw new Error('Call ajax failed');
    }
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function dismissEmail(emailId: string) {
  try {
    const response = await window.jQuery.ajax({
      type: 'POST',
      url: window.yayReviews.ajax_url,
      data: {
        action: 'yay_reviews_dismiss_email',
        nonce: window.yayReviews.nonce,
        email_id: emailId,
      },
    });
    if (!response.success) {
      throw new Error('Call ajax failed');
    }
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}