const SettingsServices = {
    getSettings: (on_done, on_fail) => {
        fetch(yay_reviews_data.rest_url + '/get-settings', {
            headers: {
              'X-WP-Nonce': yay_reviews_data.rest_nonce
            }
        })
        .then(response => response.json())
        .then(data =>  on_done(data) )
        .catch(() => on_fail());
    },
    saveSettings: (data_to_save, on_done, on_fail) => {
        fetch(yay_reviews_data.rest_url + '/save-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': yay_reviews_data.rest_nonce
            },
            body: JSON.stringify(data_to_save),
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
export default SettingsServices;