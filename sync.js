/**
 * sync.js
 * File cầu nối tương thích cho các bản `index.html`/`admin.html` cũ
 * đang còn tham chiếu tới `sync.js`.
 *
 * Mục tiêu:
 * - Không thay đổi nội dung `index.html`
 * - Tránh lỗi 404 khi hosting
 * - Khởi tạo sớm `window.GAS_URL` / `window.THC_CONFIG.GAS_URL` (không dùng
 *   localStorage/sessionStorage để tránh “bộ nhớ tạm” phía client)
 */
(function () {
  'use strict';

  var DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwQGNLmOPQy31xJdiTDR2p1B9OjO9NBYHHxj2zbYadytLhiFa2MQBZfXFnJz5fq8njh/exec';

  function isValidUrl(url) {
    return typeof url === 'string' && /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(url);
  }

  function getGasUrlFromWindow() {
    if (isValidUrl(window.GAS_URL)) return window.GAS_URL;
    if (window.THC_CONFIG && isValidUrl(window.THC_CONFIG.GAS_URL)) return window.THC_CONFIG.GAS_URL;
    return '';
  }

  var gasUrl = getGasUrlFromWindow() || DEFAULT_GAS_URL;

  window.THC_CONFIG = window.THC_CONFIG || {};
  if (gasUrl && !window.THC_CONFIG.GAS_URL) {
    window.THC_CONFIG.GAS_URL = gasUrl;
  }
  if (gasUrl && !window.GAS_URL) {
    window.GAS_URL = gasUrl;
  }

  window.THC_SYNC = Object.assign({}, window.THC_SYNC || {}, {
    getGasUrl: function () {
      return getGasUrlFromWindow() || DEFAULT_GAS_URL;
    },
    setGasUrl: function (url) {
      if (!isValidUrl(url)) return false;
      window.THC_CONFIG = window.THC_CONFIG || {};
      window.THC_CONFIG.GAS_URL = url;
      window.GAS_URL = url;
      return true;
    }
  });

  console.info('[THC sync.js] compatibility bridge loaded');
})();
