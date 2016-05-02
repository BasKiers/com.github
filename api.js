'use strict';

module.exports = [
  {
    description: 'Get Github Authorization token',
    method: 'GET',
    path: '/authorized/',
    fn: (callback, args) => Homey.app.auth.authWithToken(callback)
  },
  {
    description: 'Deauthorize Github',
    method: 'PUT',
    path: '/deauthorize/',
    fn: (callback, args) => Homey.app.auth.removeAccessToken(callback)
  },
  {
    description: 'Authorize Github',
    method: 'PUT',
    path: '/authorize/',
    fn: (callback, args) => Homey.app.auth.fetchAuthorizationURL(callback)
  }
];