import React, { useEffect } from 'react';

const Test = () => {
    useEffect(() => {
        fetch(yay_reviews_data.rest_url + '/get-settings', {
            headers: {
              'X-WP-Nonce': yay_reviews_data.rest_nonce
            }
          })
            .then(response => response.json())
            .then(data => {
              console.log(data)
            })
            .catch(() => message.error('Failed to load initial state.'));
    }, []);

    return (<h1>Test</h1>)
}
export default Test;