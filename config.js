/**
 * config.js — Tran Hoa Computer
 * Cấu hình trung tâm dùng chung cho index.html và admin.html
 * ► Chỉ cần sửa file này khi đổi GAS URL hoặc thông tin cửa hàng
 * ► Đặt trước tất cả <script> khác trong <head> của cả 2 file
 * Last updated: 2026-06-28 | v35
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
    hours:   '07:00 – 22:00',
    phone:   '0963284044',         // cập nhật SĐT thực
    zalo:    'https://zalo.me/0963284044',
    fanpage: 'https://facebook.com/tranhoa84373',
  },

  // ═══════════════════════════════════════════
  //  AI CHATBOT endpoint
  // ═══════════════════════════════════════════
  ai: {
    endpoint: 'https://superagent-47f29609.base44.app/functions/aiChat',
  },

  version: 'v35',
};

// ── Áp dụng GAS_URL ngay khi script load ─────────────────────────────────
(function () {
  var url = window.THC_CONFIG.GAS_URL;
  if (!url) return;

  // index.html: đọc window.GAS_URL
  window.GAS_URL = url;

  // admin.html: đọc localStorage key "thc_gasUrl"
  try {
    var saved = localStorage.getItem('thc_gasUrl');
    if (!saved || !saved.startsWith('https://script.google.com')) {
      localStorage.setItem('thc_gasUrl', url);
    }
  } catch (e) {}

  console.info('[THC config.js] GAS_URL set →', url.slice(0, 72) + '…');
})();
