import ky, { Options, ResponsePromise } from 'ky';

const yayReviews = window.yayReviews;

let _ky = ky.create({
  prefixUrl: yayReviews.rest_url,
  headers: {
    'X-WP-Nonce': yayReviews.rest_nonce,
  },
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 403) {
          const body: any = await response.json();

          if (body?.code === 'rest_cookie_invalid_nonce') {
            // if session expired
            location.reload();
          }
        }
      },
    ],
  },
  timeout: 20000,
});

interface AbstractApi {
  get(input?: string, options?: Options): ResponsePromise;

  post(input?: string, options?: Options): ResponsePromise;

  put(input?: string, options?: Options): ResponsePromise;

  patch(input?: string, options?: Options): ResponsePromise;

  delete(input?: string, options?: Options): ResponsePromise;
}

class PrettyApi implements AbstractApi {
  readonly base: string;

  constructor(base = yayReviews.rest_base) {
    this.base = base;
  }

  get(input = '', options?: Options) {
    return _ky.get(`${this.base}/${input}`, options);
  }

  post(input = '', options?: Options) {
    return _ky.post(`${this.base}/${input}`, options);
  }

  put(input = '', options?: Options) {
    return _ky.put(`${this.base}/${input}`, options);
  }

  patch(input = '', options?: Options) {
    return _ky.patch(`${this.base}/${input}`, options);
  }

  delete(input = '', options?: Options) {
    return _ky.delete(`${this.base}/${input}`, options);
  }
}

class UglyApi implements AbstractApi {
  readonly restRoute: string;

  constructor(restRoute: string) {
    this.restRoute = restRoute;
  }

  get(input = '', options?: Options) {
    return _ky.get('', {
      ...options,
      searchParams: this._getSearchParams(input, options),
    });
  }

  post(input = '', options?: Options) {
    return _ky.post('', {
      ...options,
      searchParams: this._getSearchParams(input, options),
    });
  }

  put(input = '', options?: Options) {
    return _ky.put('', {
      ...options,
      searchParams: this._getSearchParams(input, options),
    });
  }

  patch(input = '', options?: Options) {
    return _ky.patch('', {
      ...options,
      searchParams: this._getSearchParams(input, options),
    });
  }

  delete(input = '', options?: Options) {
    return _ky.delete('', {
      ...options,
      searchParams: this._getSearchParams(input, options),
    });
  }

  _getSearchParams(input?: string, options?: Options) {
    let searchParams = new URLSearchParams();
    if (options?.searchParams) {
      searchParams = new URLSearchParams(options?.searchParams as Record<string, string>);
    }
    searchParams.set('rest_route', `${this.restRoute}/${input}`);
    return searchParams;
  }
}

export function createApi(base: string): AbstractApi {
  const baseUrl = new URL(`${yayReviews.rest_url}${base}`);
  const restRoute = baseUrl.searchParams.get('rest_route');

  if (!restRoute) {
    return new PrettyApi(base);
  } else {
    return new UglyApi(restRoute);
  }
}

export const yayReviewsApi = createApi(yayReviews.rest_base);
export const wordpressApi = createApi('wp/v2');

export const api = yayReviewsApi;
export { HTTPError } from 'ky';
