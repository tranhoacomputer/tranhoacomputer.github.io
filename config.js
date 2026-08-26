/**
 * config.js — Tran Hoa Computer
 * Cấu hình trung tâm dùng chung cho index.html và admin.html
 * ► Chỉ cần sửa file này khi đổi GAS URL hoặc thông tin cửa hàng
 * ► Đặt trước tất cả <script> khác trong <head> của cả 2 file
 * Last updated: 2026-08-26 | v37
 *
 * THAY ĐỔI v37:
 * - Tự động migrate localStorage nếu còn lưu URL cũ / stale
 * - Thêm window.THC_GAS helper: getUrl(), setUrl(), ping()
 * - Đảm bảo 1 nguồn sự thật duy nhất cho tất cả file
 */

window.THC_CONFIG = {

  // ═══════════════════════════════════════════
  //  GOOGLE APPS SCRIPT — endpoint duy nhất
  //  Đổi URL tại ĐÂY, sẽ áp dụng cho CẢ 2 file
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

  version: 'v37',
};

// ── Áp dụng GAS_URL và khởi tạo helper ──────────────────────────────────
(function () {
  'use strict';

  var CURRENT_URL = window.THC_CONFIG.GAS_URL;
  if (!CURRENT_URL) return;

  // ── 1. Gán window.GAS_URL (index.html đọc biến này) ──
  window.GAS_URL = CURRENT_URL;

  // ── 2. Cập nhật localStorage['thc_gasUrl'] ──────────────────────────────
  //    Logic v37: LUÔN force-overwrite — config.js là nguồn sự thật duy nhất
  //    (xem giải thích chi tiết trong khối try/catch bên dưới)
  try {
    var saved = localStorage.getItem('thc_gasUrl');

    // ═══ MIGRATION v37: LUÔN force-overwrite localStorage ═══
    // Lý do: từng có bug hardcode URL GAS sai vào admin.html bundle,
    // URL sai đó cũng là định dạng GAS hợp lệ → logic cũ "tôn trọng URL
    // admin tự đặt" đã bảo vệ URL sai, khiến nó kẹt mãi trong localStorage.
    // Giải pháp: config.js là NGUỒN SỰ THẬT duy nhất → luôn ghi đè.
    // Admin vẫn có thể đổi URL runtime qua setGasUrl() trong admin UI
    // (setGasUrl ghi cả window + localStorage), nhưng mỗi lần tải lại
    // config.js sẽ lại reset về giá trị đúng từ file.
    if (saved !== CURRENT_URL) {
      console.info('[THC config.js v37] Migrate localStorage gasUrl:',
        saved ? saved.slice(0, 60) + '…' : '(empty)', '→', CURRENT_URL.slice(0, 60) + '…');
      localStorage.setItem('thc_gasUrl', CURRENT_URL);
    }
  } catch (e) {}

  // ── 3. Khởi tạo window.THC_GAS — helper thống nhất ─────────────────────
  //    Dùng thay thế mọi pattern `window.GAS_URL || window.THC_CONFIG.GAS_URL`
  //    rải rác trong index.html / admin.html
  window.THC_GAS = {

    /**
     * getUrl() — trả về GAS URL theo thứ tự ưu tiên:
     *   1. window.THC_CONFIG.GAS_URL (config.js — nguồn sự thật)
     *   2. window.GAS_URL            (có thể đã được cập nhật runtime)
     *   3. localStorage['thc_gasUrl'] (admin đặt tay)
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
     * ping(url?) — kiểm tra kết nối GAS bằng action=ping.
     *   Trả về Promise<{ok:boolean, latencyMs:number, error?:string}>
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

    /** isValid(url) — kiểm tra nhanh định dạng URL GAS */
    isValid: _isValid,
  };

  function _isValid(url) {
    return typeof url === 'string'
      && url.startsWith('https://script.google.com/macros/s/')
      && url.indexOf('/exec') !== -1;
  }

  console.info('[THC config.js v37] GAS_URL set →', CURRENT_URL.slice(0, 72) + '…');
})();
