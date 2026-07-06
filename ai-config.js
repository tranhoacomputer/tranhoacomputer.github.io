/**
 * ai-config.js — Tran Hoa Computer
 * ════════════════════════════════════════════════════════════════
 * File cấu hình AI — KHÔNG chứa API key trực tiếp.
 * API key được bảo mật trong backend (Base44 server-side).
 * Dùng chung cho cả trang khách (index.html) và trang quản trị (admin.html).
 *
 * AN TOÀN ĐỂ ĐẨY LÊN GITHUB — chỉ chứa URL endpoint, không lộ key.
 * ════════════════════════════════════════════════════════════════
 */

window.AI_CONFIG = {

  /* ── Endpoint chat AI (Gemini qua Base44) — dùng cho chatbot khách & Hỏi Đáp AI admin ── */
  endpoint: 'https://superagent-47f29609.base44.app/functions/aiChat',

  /* ── Endpoint chẩn đoán lỗi kỹ thuật (Gemini qua Base44) — dùng cho Trợ lý AI sửa lỗi admin ── */
  diagnoseEndpoint: 'https://superagent-47f29609.base44.app/functions/aiDiagnose',

  /* ── Endpoint gửi email SMTP thật (xác nhận lịch hẹn & cập nhật trạng thái) ── */
  sendEmailEndpoint: 'https://superagent-47f29609.base44.app/functions/sendEmail',

  /* ── Chế độ "Ai ơi" — bypass KB, gọi AI không giới hạn (chatbot khách) ── */
  freePassEnabled: true,
  freePassTrigger: 'ai oi',
  freePassConfirm: '🤖✨ Chế độ AI tự do đã bật!\nHỏi gì tôi cũng trả lời — không giới hạn chủ đề.\nBạn muốn hỏi gì nào?',

  /* ── System prompt bổ sung khi "Ai ơi" mode ── */
  freePassSystemExtra: 'FREE_PASS_MODE: Trả lời MỌI câu hỏi không giới hạn chủ đề. Không bị ràng buộc bởi kịch bản chatbot cửa hàng. Thể hiện quan điểm, phân tích sâu, viết sáng tạo.',

};

/* Áp dụng endpoint vào chatbot */
window._AI_ENDPOINT = window.AI_CONFIG.endpoint;
window._SEND_EMAIL_ENDPOINT = window.AI_CONFIG.sendEmailEndpoint;
window._AI_CONFIG_LOADED = true;
