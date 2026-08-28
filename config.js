/**
 * config.js — Tran Hoa Computer
 * Cấu hình trung tâm dùng chung cho index.html và admin.html
 * ► Chỉ cần sửa file này khi đổi GAS URL hoặc thông tin cửa hàng
 * ► Đặt trước tất cả <script> khác trong <head> của cả 2 file
 * Last updated: 2026-08-28 | v38
 *
 * THAY ĐỔI v38:
 * - TÔN TRỎNG URL admin đã đặt: nếu localStorage có URL GAS hợp lệ,
 *   dùng URL đó thay vì ghi đè (khác v37 luôn force-overwrite)
 * - Vẫn migrate các URL cũ/stale đã biết về URL mặc định
 * - Admin đổi URL qua "Lưu liên kết" → persist qua page reload
 */

window.THC_CONFIG = {

  // ═══════════════════════════════════════════
  //  GOOGLE APPS SCRIPT — endpoint mặc định
  //  Admin có thể override runtime qua UI "Lưu liên kết"
  // ═══════════════════════════════════════════
  GAS_URL: 'https://script.google.com/macros/s/AKfycbyDCaMSu4aeWUzKsKieTNW40Jb2IGcXH5zLNNXmqgo3fCbD5Uf5YQv_ldjZuKmebZHMoA/exec',

  // ═══════════════════════════════════════════
  //  THÔNG TIN CỬA HÀNG
  // ═══════════════════════════════════════════
  shop: {
    name:    'Tran Hoa Computer',
    address: 'Phú Thịnh, Thái Nguyên',
    hours:   '07:30 – 21:00',
    phone:   '0834.089.xxx',         // cập nhật SĐT thực
    zalo:    'https://zalo.me/0834089xxx',
    fanpage: 'https://facebook.com/tranhoacomputer',
  },

  // ═══════════════════════════════════════════
  //  AI CHATBOT endpoint
  // ═══════════════════════════════════════════
  ai: {
    endpoint: 'https://superagent-47f29609.base44.app/functions/aiChat',
  },

  version: 'v38',
};

// ── Áp dụng GAS_URL và khởi tạo helper ──────────────────────────────────
(function () {
  'use strict';

  var DEFAULT_URL = window.THC_CONFIG.GAS_URL;
  if (!DEFAULT_URL) return;

  // ── Danh sách URL cũ/stale cần migrate về mặc định ──
  var STALE_URLS = [
    'https://script.google.com/macros/s/AKfycbz4oTtTRyybG2W7s3L6G6PjFJPk-XYNEHPjBQFoiPbSkm9CvYCv9AYqAbv6FHejvsfhDQ/exec',
    'https://script.google.com/macros/s/AKfycbIcEewka4C9njoprAE3U_2aDfBhfOzIjeFA_EEvvpeOF0oq5tgLNylUEREVsMgSHlwHQ/exec',
    'https://script.google.com/macros/s/AKfycbyU8qYONkF9mXYDW3dzmDqq7kX36fGzLpUYQf3day-HH9TT_-s72Sw3i3MJ5Nqo5Hvyxw/exec',
  ];

  function _isValid(url) {
    return typeof url === 'string'
      && url.startsWith('https://script.google.com/macros/s/')
      && url.indexOf('/exec') !== -1;
  }

  function _isStale(url) {
    return STALE_URLS.indexOf(url) !== -1;
  }

  // ── 1. Quyết định URL runtime: localStorage (admin đặt) > default ──
  var runtimeUrl = DEFAULT_URL;
  try {
    var saved = localStorage.getItem('thc_gasUrl');
    if (saved && _isValid(saved) && !_isStale(saved)) {
      // Admin đã đặt URL hợp lệ → tôn trọng
      runtimeUrl = saved;
    } else if (saved && _isStale(saved)) {
      // URL stale → migrate về mặc định
      console.info('[THC config.js v38] Migrate stale URL → default');
      localStorage.setItem('thc_gasUrl', DEFAULT_URL);
      runtimeUrl = DEFAULT_URL;
    } else if (!saved || !_isValid(saved)) {
      // localStorage trống/invalid → dùng mặc định + lưu lại
      localStorage.setItem('thc_gasUrl', DEFAULT_URL);
    }
  } catch (e) {}

  // ── 2. Gán window.GAS_URL + THC_CONFIG.GAS_URL (tất cả dùng 1 URL) ──
  window.GAS_URL = runtimeUrl;
  window.THC_CONFIG.GAS_URL = runtimeUrl;

  // ── 3. Khởi tạo window.THC_GAS — helper thống nhất ─────────────────────
  window.THC_GAS = {

    /**
     * getUrl() — trả về GAS URL hiện tại
     */
    getUrl: function () {
      var u;
      u = window.THC_CONFIG && window.THC_CONFIG.GAS_URL;
      if (_isValid(u)) return u;
      u = window.GAS_URL;
      if (_isValid(u)) return u;
      try { u = localStorage.getItem('thc_gasUrl'); } catch (e) {}
      if (_isValid(u)) return u;
      return '';
    },

    /**
     * setUrl(url) — đặt GAS URL mới runtime (admin đổi URL).
     *   Ghi vào window, THC_CONFIG, VÀ localStorage để cross-tab sync.
     *   Trả về true nếu hợp lệ, false nếu không.
     */
    setUrl: function (url) {
      if (!_isValid(url)) {
        console.warn('[THC GAS] URL không hợp lệ:', url);
        return false;
      }
      window.GAS_URL = url;
      window.THC_CONFIG = window.THC_CONFIG || {};
      window.THC_CONFIG.GAS_URL = url;
      try { localStorage.setItem('thc_gasUrl', url); } catch (e) {}
      console.info('[THC GAS] URL đã cập nhật →', url.slice(0, 72) + '…');
      return true;
    },

    /**
     * resetUrl() — reset về URL mặc định từ config.js
     */
    resetUrl: function () {
      window.GAS_URL = DEFAULT_URL;
      window.THC_CONFIG.GAS_URL = DEFAULT_URL;
      try { localStorage.setItem('thc_gasUrl', DEFAULT_URL); } catch (e) {}
      console.info('[THC GAS] URL đã reset về mặc định');
      return true;
    },

    /**
     * ping(url?) — kiểm tra kết nối GAS bằng action=ping.
     */
    ping: function (url) {
      var target = _isValid(url) ? url : window.THC_GAS.getUrl();
      if (!target) return Promise.resolve({ ok: false, error: 'Không có GAS URL' });
      var t0 = Date.now();
      return fetch(target + '?action=ping&_=' + t0, { cache: 'no-store' })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (body) {
            return { ok: r.ok, latencyMs: Date.now() - t0, body: body };
          });
        })
        .catch(function (err) {
          return { ok: false, latencyMs: Date.now() - t0, error: err.message || 'fetch thất bại' };
        });
    },

    isValid: _isValid,
  };

  console.info('[THC config.js v38] GAS_URL →', runtimeUrl.slice(0, 72) + '…');
})();
