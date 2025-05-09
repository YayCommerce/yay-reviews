const PreviewEmailServices = {
    send: (type, data, on_done, on_fail) => {
        fetch(yay_reviews_data.rest_url + '/email-preview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': yay_reviews_data.rest_nonce
            },
            body: JSON.stringify({ type: type, data: data }),
          })
          .then(response => response.json())
          .then(data => {
            on_done(data)
          })
          .catch(() => {
            on_fail()
          });
    }
}
export default PreviewEmailServices;