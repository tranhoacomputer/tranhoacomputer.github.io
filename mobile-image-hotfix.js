/* ═══════════════════════════════════════════════════════════════
   THC Mobile Camera & Canvas Quality Hotfix v1
   Fix: ảnh chụp/tải lên từ điện thoại di động bị mờ.

   Nguyên nhân:
   1) Khi mở camera qua getUserMedia({video:{facingMode:...}}) mà
      không ép width/height, nhiều trình duyệt di động (đặc biệt
      Safari/Chrome Android) tự chọn độ phân giải stream rất thấp
      (thường 640x480) → ảnh chụp ra bị vỡ/mờ.
   2) Khi resize ảnh lớn xuống nhỏ bằng canvas (drawImage), nếu
      không bật imageSmoothingQuality="high" thì thuật toán lấy mẫu
      mặc định trên một số trình duyệt di động cho chất lượng kém,
      ảnh nén ra bị mờ hơn cần thiết.

   Fix (không cần sửa code React đã build):
   1) Patch navigator.mediaDevices.getUserMedia để tự thêm ràng buộc
      độ phân giải cao (ideal 1920x1080) cho mọi yêu cầu video, trừ
      khi code gốc đã tự chỉ định width/height.
   2) Patch HTMLCanvasElement.prototype.getContext để mọi canvas 2D
      context mới tạo ra đều tự bật imageSmoothingEnabled + quality
      "high".
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MAX_W = 1920;
  var MAX_H = 1080;

  /* ── 1) Ép độ phân giải camera cao trên mobile ── */
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

      navigator.mediaDevices.getUserMedia = function (constraints) {
        try {
          if (constraints && constraints.video) {
            var v = constraints.video;

            if (v === true) {
              constraints = Object.assign({}, constraints, {
                video: {
                  width: { ideal: MAX_W },
                  height: { ideal: MAX_H }
                }
              });
            } else if (typeof v === 'object' && v !== null) {
              /* Chỉ thêm ideal resolution nếu code gốc chưa tự chỉ định */
              var mergedVideo = Object.assign({}, v);
              if (!('width' in mergedVideo) && !('height' in mergedVideo)) {
                mergedVideo.width = { ideal: MAX_W };
                mergedVideo.height = { ideal: MAX_H };
              }
              constraints = Object.assign({}, constraints, { video: mergedVideo });
            }
          }
        } catch (e) {
          console.warn('[THC hotfix] getUserMedia constraint patch skipped:', e);
        }
        return origGetUserMedia(constraints);
      };
    }
  } catch (e) {
    console.warn('[THC hotfix] getUserMedia patch failed:', e);
  }

  /* ── 2) Bật chất lượng lấy mẫu cao cho mọi canvas 2D context ── */
  try {
    var origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, opts) {
      var ctx = origGetContext.call(this, type, opts);
      if (ctx && type === '2d') {
        try {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        } catch (e) { /* ignore trên trình duyệt không hỗ trợ */ }
      }
      return ctx;
    };
  } catch (e) {
    console.warn('[THC hotfix] canvas getContext patch failed:', e);
  }

  console.log('[THC hotfix] Mobile camera & canvas quality hotfix loaded.');
})();
