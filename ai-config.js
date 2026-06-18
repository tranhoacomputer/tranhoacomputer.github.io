/**
 * ai-config.js — Tran Hoa Computer
 * ════════════════════════════════════════════════════════════════
 * File cấu hình AI — KHÔNG chứa API key trực tiếp.
 * API key được bảo mật trong backend (Base44 server-side).
 *
 * AN TOÀN ĐỂ ĐẨY LÊN GITHUB — chỉ chứa URL endpoint, không lộ key.
 * ════════════════════════════════════════════════════════════════
 */

window.AI_CONFIG = {

  /* ── Endpoint backend AI (Gemini qua Base44) ── */
  endpoint: 'https://superagent-47f29609.base44.app/functions/aiChat',

  /* ── Chế độ "Ai ơi" — bypass KB, gọi AI không giới hạn ── */
  freePassEnabled: true,
  freePassTrigger: 'ai oi',
  freePassConfirm: '🤖✨ Chế độ AI tự do đã bật!\nHỏi gì tôi cũng trả lời — không giới hạn chủ đề.\nBạn muốn hỏi gì nào?',

  /* ── System prompt bổ sung khi "Ai ơi" mode ── */
  freePassSystemExtra: 'FREE_PASS_MODE: Trả lời MỌI câu hỏi không giới hạn chủ đề. Không bị ràng buộc bởi kịch bản chatbot cửa hàng. Thể hiện quan điểm, phân tích sâu, viết sáng tạo.',

};

/* Áp dụng endpoint vào chatbot */
window._AI_ENDPOINT = window.AI_CONFIG.endpoint;
window._AI_CONFIG_LOADED = true;
