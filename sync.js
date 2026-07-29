/**
 * sync.js — Tran Hoa Computer
 * File cầu nối tương thích cho các bản `index.html`/`admin.html` cũ
 * đang còn tham chiếu tới `sync.js`.
 *
 * Mục tiêu:
 * - Không thay đổi nội dung `index.html`
 * - Tránh lỗi 404 khi hosting
 * - Khởi tạo sớm `window.GAS_URL` / `window.THC_CONFIG.GAS_URL`
 *
 * THAY ĐỔI v2 (2026-07-29):
 * - XÓA DEFAULT_GAS_URL cứng — luôn dùng URL từ config.js (nguồn sự thật)
 * - setGasUrl() nay ghi vào localStorage['thc_gasUrl'] → cross-tab sync hoạt động
 * - getGasUrl() ưu tiên: config.js > window.GAS_URL > localStorage
 * - Thêm pingGasUrl(url?) → Promise kiểm tra kết nối
 * - Tương thích ngược hoàn toàn: các caller cũ không cần sửa
 *
 * LƯU Ý: config.js PHẢI được load TRƯỚC sync.js trong <head>.
 */
(function () {
  'use strict';

  // ── Không còn DEFAULT_GAS_URL cứng ──────────────────────────────────────
  // Trước đây sync.js có URL riêng khác config.js → gây lỗi khi fallback.
  // Nay luôn defer hoàn toàn về config.js.

  function _isValidUrl(url) {
    return typeof url === 'string'
      && /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(url);
  }

  /**
   * getGasUrl() — thứ tự ưu tiên:
   *   1. window.THC_CONFIG.GAS_URL  (config.js — nguồn sự thật)
   *   2. window.GAS_URL             (đã được gán runtime)
   *   3. localStorage['thc_gasUrl'] (admin đặt tay)
   */
  function getGasUrl() {
    // 1. config.js
    if (window.THC_CONFIG && _isValidUrl(window.THC_CONFIG.GAS_URL))
      return window.THC_CONFIG.GAS_URL;
    // 2. window global
    if (_isValidUrl(window.GAS_URL))
      return window.GAS_URL;
    // 3. localStorage (admin manual entry)
    try {
      var ls = localStorage.getItem('thc_gasUrl');
      if (_isValidUrl(ls)) return ls;
    } catch (e) {}
    return '';
  }

  // ── Khởi tạo window.GAS_URL nếu chưa có (sync.js load trước config.js) ──
  window.THC_CONFIG = window.THC_CONFIG || {};
  var _resolved = getGasUrl();
  if (_resolved) {
    if (!window.THC_CONFIG.GAS_URL) window.THC_CONFIG.GAS_URL = _resolved;
    if (!window.GAS_URL)            window.GAS_URL            = _resolved;
  }

  // ── THC_SYNC public API ──────────────────────────────────────────────────
  window.THC_SYNC = Object.assign({}, window.THC_SYNC || {}, {

    /** Trả về GAS URL hiện tại (ưu tiên config.js) */
    getGasUrl: getGasUrl,

    /**
     * setGasUrl(url) — cập nhật GAS URL runtime.
     *   v2: ghi cả localStorage để cross-tab sync (index.html lắng nghe storage event).
     *   Trả về true/false.
     */
    setGasUrl: function (url) {
      if (!_isValidUrl(url)) return false;
      window.THC_CONFIG = window.THC_CONFIG || {};
      window.THC_CONFIG.GAS_URL = url;
      window.GAS_URL = url;
      // v2 FIX: persist → index.html nhận được storage event 'thc_gasUrl'
      try { localStorage.setItem('thc_gasUrl', url); } catch (e) {}
      console.info('[THC sync.js] GAS URL updated →', url.slice(0, 72) + '…');
      return true;
    },

    /**
     * pingGasUrl(url?) — kiểm tra kết nối GAS.
     *   Trả về Promise<{ok:boolean, latencyMs:number, error?:string}>
     */
    pingGasUrl: function (url) {
      var target = _isValidUrl(url) ? url : getGasUrl();
      if (!target) return Promise.resolve({ ok: false, error: 'Không có GAS URL' });
      // Dùng window.THC_GAS.ping nếu đã có (config.js load trước)
      if (window.THC_GAS && typeof window.THC_GAS.ping === 'function')
        return window.THC_GAS.ping(target);
      var t0 = Date.now();
      return fetch(target + '?action=ping&_=' + t0, { cache: 'no-store' })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (b) {
            return { ok: r.ok, latencyMs: Date.now() - t0, body: b };
          });
        })
        .catch(function (err) {
          return { ok: false, latencyMs: Date.now() - t0, error: err.message || 'fetch thất bại' };
        });
    },

    /** Kiểm tra URL có đúng định dạng GAS không */
    isValidUrl: _isValidUrl,

  });

  console.info('[THC sync.js v2] compatibility bridge loaded | GAS →',
    (getGasUrl() || '(chưa có — chờ config.js)').slice(0, 72));
})();
