export const productFetchOptions = async (value) => {
    return fetch(yay_reviews_data.rest_url + '/get-products/?search=' + value, {
        headers: {
          'X-WP-Nonce': yay_reviews_data.rest_nonce
        }
      })
      .then((response) => response.json())
      .then((body) =>
        body.map((item) => ({
          label: `${item.name}`,
          value: item.id,
        })),
      );
  };
export const categoryFetchOptions = async (value) => {
  return fetch(yay_reviews_data.rest_url + '/get-categories/?search=' + value, {
      headers: {
        'X-WP-Nonce': yay_reviews_data.rest_nonce
      }
    })
    .then((response) => response.json())
    .then((body) =>
      body.map((item) => ({
        label: `${item.name}`,
        value: item.id,
      })),
    );
};
export const couponFetchOptions = async (value) => {
  return fetch(yay_reviews_data.rest_url + '/get-coupons/?search=' + value, {
      headers: {
        'X-WP-Nonce': yay_reviews_data.rest_nonce
      }
    })
    .then((response) => response.json())
    .then((body) =>
      body.map((item) => ({
        label: `${item.name}`,
        value: item.id,
      })),
    );
};