/* ════════════════════ CHATBOT ENGINE v16 ════════════════════ */
(function(){
'use strict';

/* ── SESSION STORAGE: restore chat on reload ── */
var _chatHistory = [];
function _saveChatHistory() {
  try {
    sessionStorage.setItem('thc_chat', JSON.stringify(
      _chatHistory.slice(-30) // keep last 30 messages
    ));
  } catch(e) {}
}
function _loadChatHistory() {
  try {
    var saved = sessionStorage.getItem('thc_chat');
    return saved ? JSON.parse(saved) : [];
  } catch(e) { return []; }
}
var _open=false, _greeted=false;
var botIsTyping=false; /* guard: prevents overlapping responses on rapid clicks */
var msgs=document.getElementById('cbMsgs');
var qrDiv=document.getElementById('cbQR');

/* ── KNOWLEDGE BASE ── */
var KB=[
 {k:['xin chào','hello','hi ','chào ','alo','hey','bắt đầu','start'],
  a:'👋 Xin chào! Mình là trợ lý AI của <b>Tran Hoa Computer</b>.<br>Bạn đang gặp vấn đề gì với máy tính? Mình sẵn sàng hỗ trợ 24/7!',
  q:['Giá sửa phần cứng','Giá cài phần mềm','Lắp đặt PC','Laptop/iPad/MacBook','Phụ kiện','Ưu đãi hiện tại']},

 {k:['giá','bao nhiêu','chi phí','phí','tiền','price','tốn','mất bao'],
  a:'💰 <b>Bảng giá tham khảo:</b><br>• Sửa lỗi nguồn/main: <b>150k–450k</b><br>• Thay RAM/SSD: <b>50k–150k</b><br>• Cài Windows trọn gói: <b>150k–350k</b><br>• Diệt virus: <b>80k–200k</b><br>• Cứu dữ liệu: <b>200k–800k</b><br>• Ráp PC Gaming (công): <b>100k–300k</b><br>• Hỗ trợ từ xa: <b>MIỄN PHÍ 🎁</b>',
  q:['Kiểm tra miễn phí','Đặt lịch sửa','Liên hệ ngay']},

 {k:['địa chỉ','ở đâu','chỗ nào','vị trí','đường','thái nguyên','đại từ'],
  a:'📍 Cửa hàng tại <b>Phú Thịnh, Đại Từ, Thái Nguyên</b>.<br>Xem bản đồ ngay trên trang hoặc gọi hotline để được hướng dẫn đường đi!',
  q:['Hotline gọi ngay','Zalo tư vấn','Giờ làm việc']},

 {k:['giờ','mở cửa','đóng cửa','thời gian','mấy giờ','khi nào mở'],
  a:'🕐 Mở cửa <b>07:00 – 22:00 mỗi ngày</b>, kể cả thứ 7 & Chủ nhật.<br>Đặt lịch trước để được phục vụ ưu tiên!',
  q:['Đặt lịch sửa','Hotline gọi ngay']},

 {k:['đặt lịch','hẹn','booking','đăng ký lịch','appointment'],
  a:'📅 Đặt lịch ngay tại phần <b>Đặt Lịch Sửa Chữa</b> trên trang này, hoặc nhắn Zalo / gọi hotline.<br>✅ Xác nhận trong <b>15 phút</b>!',
  q:['Zalo tư vấn','Hotline gọi ngay','Giá dịch vụ']},

 {k:['laptop','máy xách tay','notebook','macbook'],
  a:'💻 <b>Sửa Laptop:</b><br>• Không lên nguồn, lỗi nguồn<br>• Màn hình hỏng, bản lề gãy<br>• Chậm, treo, virus<br>• Thay SSD, RAM, pin, bàn phím<br>• Lỗi mainboard, chip<br>✅ Kiểm tra miễn phí!',
  q:['Giá sửa laptop','Đặt lịch','Bảo hành']},

 {k:['pc','máy bàn','desktop','máy cây','máy tính để bàn'],
  a:'🖥️ <b>Sửa PC / Máy bàn:</b><br>• Lỗi nguồn, không khởi động<br>• Lỗi mainboard, RAM, VGA<br>• Cài Windows, driver, phần mềm<br>• Nâng cấp SSD, RAM, VGA, PSU<br>• Ráp PC Gaming theo yêu cầu',
  q:['Ráp PC Gaming','Giá dịch vụ','Đặt lịch']},

 {k:['gaming','game','chơi game','ráp máy','build pc','cấu hình game','rtx','rx ','ryzen','i5','i7','i9'],
  a:'🎮 <b>Ráp PC Gaming chuyên nghiệp:</b><br>• Tư vấn cấu hình theo ngân sách<br>• Linh kiện chính hãng 100%<br>• Ráp & test bền trước giao<br>• Bảo hành theo hãng<br>Cho mình biết ngân sách nhé! 💪',
  q:['Tư vấn ngân sách','Lắp đặt PC','Zalo tư vấn']},

 {k:['bảo hành','warranty','đổi trả','hoàn tiền','cam kết'],
  a:'🛡️ <b>Chính sách bảo hành:</b><br>• Dịch vụ sửa: <b>3–12 tháng</b><br>• Linh kiện mới: theo hãng<br>• Lỗi tái phát → sửa lại miễn phí<br>• Báo giá trước — không phát sinh ẩn',
  q:['Giá dịch vụ','Đặt lịch','Liên hệ']},

 {k:['virus','malware','mã độc','bị hack','ransomware','trojan','diệt virus','bảo mật'],
  a:'🦠 <b>Diệt virus & bảo mật:</b><br>• Quét & diệt malware, ransomware<br>• Phục hồi file bị mã hóa (nếu khả thi)<br>• Cài phần mềm bảo vệ chuyên dụng<br>• Hỗ trợ từ xa miễn phí 🎁',
  q:['Hỗ trợ từ xa','Giá dịch vụ','Đặt lịch']},

 {k:['dữ liệu','cứu dữ liệu','xóa nhầm','format nhầm','ổ cứng chết','mất file','phục hồi'],
  a:'💾 <b>Cứu dữ liệu:</b><br>• Ổ cứng chết cơ, bad sector<br>• SSD lỗi, không nhận ổ<br>• Xóa nhầm, format nhầm<br>• Tỉ lệ phục hồi <b>80–95%</b><br><i>Kiểm tra → báo kết quả trước!</i>',
  q:['Giá cứu dữ liệu','Đặt lịch','Liên hệ ngay']},

 {k:['pass','mật khẩu','password','bios','quên pass','unlock','bitlocker'],
  a:'🔑 <b>Xử lý mật khẩu & PASS BIOS:</b><br>• Phá pass Windows (không mất dữ liệu)<br>• PASS BIOS/UEFI (phần cứng trực tiếp)<br>• Xử lý Bitlocker, TPM<br>⚠️ <i>Cần mang máy đến — không từ xa!</i>',
  q:['Đặt lịch sửa','Địa chỉ','Giá dịch vụ']},

 {k:['máy in','printer','kẹt giấy','in mờ','mực in','không in được'],
  a:'🖨️ <b>Sửa máy in & ngoại vi:</b><br>• Kẹt giấy, in mờ, không in<br>• Thay mực, drum<br>• Cài driver từ xa miễn phí 🎁<br>• Sửa chuột, bàn phím, màn hình ngoài',
  q:['Hỗ trợ từ xa','Giá dịch vụ','Đặt lịch']},

 {k:['từ xa','remote','ultraviewer','teamviewer','hỗ trợ online','qua mạng'],
  a:'🌐 <b>Hỗ trợ từ xa MIỄN PHÍ TRỌN ĐỜI:</b><br>• Lỗi vặt văn phòng, ứng dụng<br>• Cài driver, phần mềm<br>• Quét virus nhẹ<br>Tải UltraViewer → nhắn ID + Pass là xong! 🚀',
  q:['Zalo tư vấn','Hotline gọi ngay']},

 {k:['win','windows','cài win','cài lại windows','hệ điều hành','win 10','win 11'],
  a:'⚙️ <b>Cài Windows trọn gói:</b><br>• Windows 10 / 11 bản quyền<br>• Kèm driver, Office, phần mềm<br>• Tối ưu hiệu năng, dọn rác<br>• Backup dữ liệu trước khi cài<br><i>Xong trong 45–90 phút!</i>',
  q:['Giá cài Windows','Đặt lịch','Hỗ trợ từ xa']},

 {k:['nóng','quá nhiệt','overheat','tản nhiệt','quạt kêu','fan','nhiệt độ cao'],
  a:'🌡️ <b>Máy bị nóng:</b><br>• Bụi bám quạt → cần <b>vệ sinh</b><br>• Keo tản nhiệt khô → cần <b>thay keo</b><br>• Quạt hỏng → cần <b>thay quạt</b><br><i>Vệ sinh & thay keo chuyên nghiệp — máy mát ngay!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Liên hệ']},

 {k:['chậm','lag','đơ máy','giật','treo máy','loading lâu','khởi động chậm'],
  a:'🐢 <b>Máy chậm — giải pháp:</b><br>1. Nâng cấp HDD → <b>SSD</b> (nhanh 5–10 lần)<br>2. Thêm <b>RAM</b> (tối thiểu 8GB)<br>3. Cài lại Windows sạch<br>4. Diệt virus, dọn rác<br>Mang đến kiểm tra free để biết cần làm gì!',
  q:['Giá nâng cấp SSD','Đặt lịch','Hỗ trợ từ xa']},

 {k:['giá màn hình','giá thay màn','thay màn hình','thay màn laptop','bao nhiêu thay màn','màn hình vỡ giá','giá sửa màn'],
  a:'<b>Giá thay màn hình laptop:</b><br>• Laptop phổ thông (FHD): <b>700K – 1.5 triệu</b><br>• Laptop gaming / màn 2K: <b>1.5 – 3.5 triệu</b><br>• MacBook Air/Pro: <b>3 – 8 triệu</b><br><i>Báo giá chính xác sau khi kiểm tra model máy. Liên hệ hoặc đặt lịch để được tư vấn!</i>',
  q:['Đặt lịch sửa','Chat Zalo','Liên hệ ngay']},

 {k:['màn hình','screen','sọc màn','đen màn','vỡ màn','không lên hình','màn tối'],
  a:'🖥️ <b>Lỗi màn hình laptop:</b><br>• Vỡ màn → thay màn chính hãng<br>• Sọc dọc/ngang → lỗi cáp hoặc màn<br>• Màn tối → lỗi backlight/cáp<br>• Không lên hình → kiểm tra VGA<br><i>Cần kiểm tra trực tiếp để chẩn đoán chính xác!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Liên hệ']},

 {k:['pin','battery','chai pin','hết pin','sạc không vào','pin hao'],
  a:'🔋 <b>Vấn đề pin laptop:</b><br>• Pin chai → nên <b>thay pin</b> mới<br>• Không nhận sạc → lỗi cổng sạc/IC<br>• Hao nhanh bất thường → kiểm tra phần mềm ngốn pin<br><i>Thay pin chính hãng, bảo hành 3–6 tháng!</i>',
  q:['Giá thay pin','Đặt lịch','Liên hệ ngay']},

 {k:['bàn phím','keyboard','phím liệt','phím không bấm','đổ nước bàn phím'],
  a:'⌨️ <b>Lỗi bàn phím laptop:</b><br>• Phím liệt → vệ sinh hoặc thay cụm<br>• Đổ nước → <b>tắt ngay, không cắm điện!</b><br>• Thay bàn phím mới: 200k–600k tùy model',
  q:['Đặt lịch sửa','Liên hệ ngay']},

 {k:['không lên nguồn','không bật','không khởi động','bấm nguồn không lên','chết nguồn'],
  a:'⚡ <b>Máy không lên nguồn:</b><br>• Lỗi adapter / nguồn máy bàn<br>• Pin chai hoàn toàn<br>• Lỗi IC nguồn, mainboard<br>• RAM lỗi (thử tháo lắp lại)<br><i>Chẩn đoán miễn phí — không sửa thì không tính tiền!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Liên hệ']},

 {k:['ssd','hdd','ổ cứng','nvme','sata','nâng cấp ổ'],
  a:'💡 <b>SSD vs HDD:</b><br>• SSD nhanh hơn HDD <b>5–10 lần</b><br>• Windows khởi động trong 10–15 giây với SSD!<br>• SSD 256GB+ cho ổ hệ thống là lý tưởng<br>• HDD vẫn tốt cho lưu trữ dung lượng lớn<br><i>Nâng cấp SSD = đầu tư xứng đáng nhất!</i>',
  q:['Giá nâng cấp SSD','Đặt lịch','Liên hệ']},

 {k:['ram','bộ nhớ','memory','ddr4','ddr5','8gb','16gb','32gb'],
  a:'🧠 <b>RAM — bao nhiêu là đủ?</b><br>• Văn phòng / lướt web: <b>8GB</b><br>• Đa nhiệm + game: <b>16GB</b> lý tưởng<br>• Đồ họa / 3D: <b>32GB+</b><br>Thêm RAM = cách rẻ nhất để máy nhanh hơn!',
  q:['Giá nâng cấp RAM','Đặt lịch','Liên hệ']},

 {k:['amd','intel','ryzen','core i','cpu','vi xử lý','processor'],
  a:'⚔️ <b>AMD vs Intel:</b><br>• <b>Intel i5/i7</b> thế hệ mới: tốt cho gaming FPS cao<br>• <b>AMD Ryzen 5/7</b>: đa nhân tốt, giá rẻ hơn, tiết kiệm điện<br>• Văn phòng → Ryzen 5 tốt nhất theo giá<br>• Gaming thuần → Intel i5 thế hệ mới vẫn dẫn',
  q:['Tư vấn cấu hình','Ráp PC Gaming','Liên hệ ngay']},

 {k:['wifi','mạng','internet','mất mạng','không kết nối mạng','lan','ethernet'],
  a:'📶 <b>Lỗi WiFi / Mạng:</b><br>• Không kết nối → quên mạng và kết nối lại<br>• Driver lỗi → cài lại driver WiFi<br>• Card WiFi hỏng → thay mới 150–300k<br>• Mạng chậm → kiểm tra DNS, tắt app ngốn băng thông<br><i>Hỗ trợ từ xa miễn phí cho lỗi phần mềm!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch','Liên hệ']},

 {k:['office','word','excel','powerpoint','phần mềm','cài phần mềm','cài app'],
  a:'📄 <b>Cài đặt phần mềm:</b><br>• Microsoft Office, kế toán, thiết kế<br>• Driver thiết bị ngoại vi<br>• Hỗ trợ từ xa miễn phí cho cài đặt cơ bản 🎁<br>Nhắn mình tên phần mềm cần cài nhé!',
  q:['Hỗ trợ từ xa','Đặt lịch','Liên hệ']},

 {k:['màn hình xanh','bsod','blue screen','crash','restart liên tục','lỗi hệ thống'],
  a:'💙 <b>Màn hình xanh (BSOD):</b><br>• RAM lỗi → tháo lắp lại, test MemTest<br>• Driver lỗi → xem error code, gỡ driver<br>• SSD/HDD lỗi → chạy CHKDSK<br>• Windows hỏng → SFC /scannow hoặc cài lại<br><i>Bó tay thì mang đến mình!</i>',
  q:['Đặt lịch sửa','Hỗ trợ từ xa','Liên hệ']},

 {k:['mua mới','nên sửa','đáng sửa','nên mua hay sửa','worth'],
  a:'🤔 <b>Nên sửa hay mua mới?</b><br>• Chi phí sửa > 60–70% giá máy mới → nên mua mới<br>• Máy dưới 3 tuổi, lỗi nhỏ → sửa là hợp lý<br>• Chỉ cần SSD/RAM → rẻ mà hiệu quả như mua mới<br><i>Mang đến kiểm tra — tư vấn thật lòng!</i>',
  q:['Kiểm tra miễn phí','Đặt lịch','Liên hệ ngay']},

 {k:['vệ sinh','bảo trì','bảo dưỡng','dọn bụi','tăng tuổi thọ máy'],
  a:'🧹 <b>Bảo dưỡng định kỳ:</b><br>• Vệ sinh bụi: <b>6–12 tháng/lần</b><br>• Thay keo tản nhiệt: <b>1–2 năm/lần</b><br>• Dọn rác hệ thống: hàng tháng<br>• Quét virus: hàng tuần<br><i>Đặt lịch bảo dưỡng để máy bền lâu!</i>',
  q:['Đặt lịch','Giá dịch vụ','Liên hệ']},

 {k:['hotline','điện thoại','gọi điện','số điện thoại','liên hệ','contact'],
  a:'📞 Hotline: <b>0963.284.044</b><br>Bấm nút <b>Gọi Ngay</b> màu xanh lá ở góc phải trang!',
  q:['Zalo tư vấn','Địa chỉ','Đặt lịch']},

 {k:['zalo','nhắn tin zalo','chat zalo','liên hệ zalo'],
  a:'💬 Nhắn Zalo ngay — phản hồi trong vài phút ⚡<br>Bấm nút <b>Zalo</b> ở góc phải trang.',
  q:['Hotline gọi ngay','Địa chỉ','Đặt lịch']},

 {k:['miễn phí','free','kiểm tra máy','chẩn đoán','xem thử','không mất tiền'],
  a:'🔍 <b>Kiểm tra máy MIỄN PHÍ:</b><br>Mang máy đến → kỹ thuật viên chẩn đoán & báo giá.<br>✅ Không hài lòng → mang máy về, không tính tiền!',
  q:['Đặt lịch','Địa chỉ','Liên hệ ngay']},

 {k:['cảm ơn','thank you','thanks','ok rồi','được rồi','hiểu rồi'],
  a:'😊 Không có gì! Cứ hỏi thêm nếu cần nhé. Chúc bạn một ngày tốt lành! ✨',
  q:['Đặt lịch sửa','Hotline gọi ngay']},

 {k:['dịch vụ','service','sửa gì','làm gì','bán gì','cung cấp gì'],
  a:'🛠️ <b>Dịch vụ tại Tran Hoa Computer:</b><br>💻 Sửa Laptop & PC<br>🎮 Ráp PC Gaming<br>⚙️ Cài Windows, phần mềm<br>💾 Cứu dữ liệu<br>🦠 Diệt virus, bảo mật<br>🖨️ Sửa máy in & ngoại vi<br>🌐 Hỗ trợ từ xa MIỄN PHÍ',
  q:['Giá dịch vụ','Đặt lịch','Liên hệ ngay']},

 {k:['tiếng ồn','tiếng kêu','ổ cứng kêu','quạt ồn','noise lạ'],
  a:'🔊 <b>Máy kêu lạ:</b><br>• Quạt ồn → bụi hoặc bi hỏng → vệ sinh/thay<br>• <b>Ổ cứng kêu lạch cạch → NGUY HIỂM!</b> Backup dữ liệu ngay!<br>• Nguồn kêu → tụ hoặc cuộn cảm vấn đề<br><i>Ổ cứng kêu = báo động đỏ, đừng bỏ qua!</i>',
  q:['Cứu dữ liệu','Đặt lịch sửa','Liên hệ']},

 {k:['usb','cổng usb','type-c','hdmi','vga port','jack tai nghe','âm thanh không ra'],
  a:'🔌 <b>Lỗi cổng kết nối:</b><br>• USB/Type-C lỏng → cần hàn lại hoặc thay<br>• Không ra âm thanh → lỗi driver hoặc IC âm thanh<br>• HDMI không nhận màn → kiểm tra driver VGA<br><i>Mang đến kiểm tra để chẩn đoán chính xác!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Liên hệ']},

 {k:['bluetooth','kết nối bluetooth','tai nghe bluetooth','không tìm thấy bluetooth'],
  a:'📱 <b>Lỗi Bluetooth:</b><br>• Thử bật/tắt Bluetooth trong Settings<br>• Cài lại driver Bluetooth<br>• Kiểm tra xem BIOS có tắt Bluetooth không<br>• Card Bluetooth hỏng → thay card WiFi+BT combo<br><i>Hỗ trợ từ xa miễn phí để kiểm tra!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch','Liên hệ']},

 /* ═══ NEW KB ENTRIES v2 ═══ */
 {k:['giờ mở cửa','giờ làm việc','mấy giờ','còn mở không','mở cửa lúc mấy','đóng cửa','hoạt động','open','hours'],
  a:'🕐 <b>Giờ làm việc:</b><br>📅 <b>Thứ 2 – Chủ nhật: 7:00 – 22:00</b><br>🎉 Làm việc cả ngày lễ, Tết!<br>📞 Gọi trước để đảm bảo kỹ thuật viên có mặt nhé!',
  q:['Đặt lịch','Địa chỉ','Hotline gọi ngay']},

 {k:['thanh toán','trả tiền','payment','chuyển khoản','tiền mặt','momo','banking','ví điện tử'],
  a:'💳 <b>Hình thức thanh toán:</b><br>💵 Tiền mặt tại cửa hàng<br>🏦 Chuyển khoản ngân hàng<br>📱 MoMo, ZaloPay, VietQR<br>✅ <i>Báo giá trước, thanh toán sau khi hài lòng!</i>',
  q:['Giá dịch vụ','Đặt lịch','Liên hệ ngay']},

 {k:['camera','webcam','camera không hoạt động','camera mờ','không nhận webcam','cam bị lỗi'],
  a:'📷 <b>Lỗi camera laptop:</b><br>• Camera bị tắt trong Device Manager → bật lại<br>• Driver camera lỗi → cài lại driver<br>• Camera vật lý hỏng → thay module camera<br>• Privacy shutter bị đóng → kiểm tra nút trượt trên máy<br><i>Hỗ trợ từ xa kiểm tra driver miễn phí!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Liên hệ']},

 {k:['bao lâu','mất bao lâu','sửa nhanh không','thời gian sửa','trong ngày','lấy ngay','lấy liền'],
  a:'<b>Thời gian sửa chữa:</b><br>• Cài Windows: <b>45–90 phút</b><br>• Vệ sinh máy: <b>30–60 phút</b><br>• Thay màn hình/bàn phím: <b>1–2 giờ</b><br>• Sửa mainboard: <b>1–3 ngày</b><br>• Cứu dữ liệu: <b>1–5 ngày</b> (tùy mức độ)<br>🚀 <i>Đa số lấy ngay trong ngày!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Liên hệ ngay']},

 {k:['khẩn','gấp','urgent','cần gấp','ngay bây giờ','sửa khẩn','cần sửa gấp'],
  a:'🚨 <b>Hỗ trợ KHẨN CẤP:</b><br>📞 Gọi ngay: <b>0963.284.044</b><br>⚡ Hỗ trợ từ xa trong 15 phút<br>🏃 Mang đến cửa hàng — ưu tiên xử lý ngay!<br><i>Nói "khẩn cấp" khi gọi để được ưu tiên!</i>',
  q:['Hotline gọi ngay','Hỗ trợ từ xa','Đặt lịch sửa']},

 {k:['dell','hp','asus','lenovo','acer','msi','samsung laptop','lg laptop','razer','gigabyte laptop'],
  a:'🏷️ <b>Tất cả thương hiệu laptop:</b><br>✅ Dell, HP, ASUS, Lenovo<br>✅ Acer, MSI, Gigabyte<br>✅ Samsung, LG, Razer<br>✅ Toshiba, Sony, Fujitsu<br>💡 <i>Có linh kiện cho hầu hết dòng máy phổ biến!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Liên hệ ngay']},

 {k:['mac','macbook','imac','macos','apple laptop','mac mini','m1','m2','m3'],
  a:'🍎 <b>Sửa MacBook / iMac:</b><br>• Sửa MacBook Air/Pro các đời<br>• Thay pin, màn hình MacBook<br>• Cài macOS, song song Windows<br>• Chẩn đoán lỗi mainboard<br>⚠️ <i>Lưu ý: linh kiện Apple chính hãng cần đặt trước!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Liên hệ ngay']},

 {k:['mua laptop','chọn laptop','laptop nào tốt','laptop văn phòng','laptop học sinh','laptop gaming','laptop đồ họa','tư vấn laptop mua'],
  a:'🛒 <b>Tư vấn mua laptop:</b><br>📚 <b>Học sinh/Sinh viên:</b> ASUS Vivobook, Acer Aspire (8–12 triệu)<br>💼 <b>Văn phòng:</b> Dell Inspiron, Lenovo IdeaPad (10–15 triệu)<br>🎮 <b>Gaming:</b> ASUS TUF, Acer Nitro, Lenovo Legion (15–25 triệu)<br>🎨 <b>Đồ họa:</b> MacBook Pro, Dell XPS (20–35 triệu)<br><i>Nhắn ngân sách & nhu cầu để tư vấn chi tiết!</i>',
  q:['Tư vấn cấu hình','Liên hệ ngay','Zalo tư vấn']},

 {k:['cổng sạc','sạc hỏng','không vào điện','type-c sạc','adapter','cục sạc','dc jack'],
  a:'🔌 <b>Lỗi cổng sạc / Adapter:</b><br>• Cổng sạc lỏng → hàn lại hoặc thay: 150–350k<br>• Adapter hỏng → thay adapter xịn: 200–500k<br>• IC sạc hỏng → sửa mainboard<br>• Type-C sạc bị bẩn → vệ sinh cổng<br><i>Đem adapter + máy đến để kiểm tra cùng lúc!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Liên hệ ngay']},

 {k:['âm thanh','loa','speaker','không có âm thanh','tiếng máy nhỏ','mic lỗi','microphone','headphone','tai nghe lỗi'],
  a:'🔊 <b>Lỗi âm thanh laptop:</b><br>• Không ra tiếng → kiểm tra driver âm thanh<br>• Loa bị bẩn/hỏng → vệ sinh hoặc thay loa: 150–400k<br>• Jack tai nghe lỏng → hàn lại: 100–200k<br>• Mic không nhận → kiểm tra privacy settings<br><i>Hỗ trợ từ xa miễn phí cho lỗi driver âm thanh!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Liên hệ']},

 {k:['card màn hình','gpu','vga','card rời','rtx 3060','rtx 4060','rx 6600','màn hình nhòe','artifact','xuất hiện chấm'],
  a:'🎮 <b>Lỗi Card đồ họa (GPU):</b><br>• Artifact, màn nhòe → GPU quá nhiệt hoặc lỗi VRAM<br>• Driver lỗi → cài lại driver GPU<br>• Card rời hỏng → reballing hoặc thay card<br>• Chuyển qua iGPU tạm thời trong khi sửa<br><i>Chẩn đoán miễn phí — mang đến kiểm tra!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Liên hệ ngay']},

 {k:['dual boot','ubuntu','linux','kali','fedora','cài linux','song song linux windows','wsl'],
  a:'🐧 <b>Cài Linux / Dual Boot:</b><br>• Ubuntu, Kali, Fedora cạnh Windows<br>• Phân vùng an toàn, không mất dữ liệu<br>• Cấu hình bootloader, driver<br>• WSL2 cho Windows nếu cần nhẹ hơn<br><i>Dịch vụ kỹ thuật cao — liên hệ báo giá!</i>',
  q:['Liên hệ ngay','Zalo tư vấn','Đặt lịch sửa']},

 {k:['game','cài game','steam','epic','battle.net','valorant','lol','liên minh','pubg','gta'],
  a:'🕹️ <b>Cài đặt game & tối ưu FPS:</b><br>• Cài Steam, Epic, Battle.net, game offline<br>• Cài driver GPU, DirectX, VCRedist<br>• Tối ưu Windows cho gaming (Game Mode, latency)<br>• Xử lý lỗi anti-cheat, launch fail<br>🎁 <i>Cài từ xa miễn phí cho game PC cơ bản!</i>',
  q:['Hỗ trợ từ xa','Ráp PC Gaming','Liên hệ ngay']},

 {k:['khuyến mãi','giảm giá','ưu đãi','discount','sale','voucher','coupon','miễn giảm'],
  a:'🎁 <b>Ưu đãi hiện tại:</b><br>🌐 Hỗ trợ từ xa <b>MIỄN PHÍ TRỌN ĐỜI</b><br>🔍 Kiểm tra & chẩn đoán máy <b>MIỄN PHÍ</b><br>💰 Báo giá trước, không phát sinh ẩn<br>🔁 Lỗi tái phát → sửa lại miễn phí<br><i>Nhắn Zalo để nhận tư vấn ưu đãi riêng!</i>',
  q:['Zalo tư vấn','Đặt lịch','Giá dịch vụ']},

 {k:['đánh giá','review','feedback','khách hàng nói gì','uy tín không','có đáng tin không'],
  a:'⭐ <b>Đánh giá từ khách hàng:</b><br>⭐⭐⭐⭐⭐ Hơn 98% khách hài lòng<br>💬 <i>"Sửa nhanh, giá hợp lý, kỹ thuật viên nhiệt tình"</i><br>💬 <i>"Tư vấn thật lòng, không ép mua linh kiện không cần thiết"</i><br>📍 <i>Xem Google Maps của shop để đọc thêm đánh giá thực!</i>',
  q:['Địa chỉ','Kiểm tra miễn phí','Đặt lịch']},

 {k:['không nhận ổ','ổ cứng không hiện','không thấy ổ cứng','disk không nhận','ổ d không thấy','ổ c đầy'],
  a:'💽 <b>Ổ cứng không nhận / không hiện:</b><br>• Kiểm tra Disk Management → phân vùng mất letter<br>• Driver disk controller lỗi → cài lại<br>• Cáp SATA lỏng (máy bàn) → cắm lại<br>• Ổ cứng chết → cứu dữ liệu trước!<br>⚠️ <i>Ổ C đầy → dọn Temp, WinSxS, hoặc thêm SSD!</i>',
  q:['Cứu dữ liệu','Giá nâng cấp SSD','Đặt lịch sửa']},

 {k:['mainboard','bo mạch chủ','main chết','lỗi main','không phát hiện cpu','mạch lỗi'],
  a:'🔩 <b>Sửa mainboard laptop / PC:</b><br>• Chẩn đoán lỗi bằng thiết bị chuyên dụng<br>• Thay IC nguồn, IC sạc, mosfet<br>• Reballing GPU, chip cầu nam/bắc<br>• Hàn chip SMD, BGA<br>💡 <i>Sửa mainboard là kỹ thuật cao — cần mang đến kiểm tra trực tiếp!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Liên hệ ngay']},

 {k:['bật lên bị đứng','bị treo ở logo','loading mãi','stuck ở boot','không vào được windows','loading screen'],
  a:'🔄 <b>Máy treo/đứng khi khởi động:</b><br>1. Thử Safe Mode (F8 hoặc Shift+Restart)<br>2. Chạy Startup Repair từ USB Boot<br>3. Kiểm tra SSD/HDD bằng CrystalDiskInfo<br>4. RAM lỗi → tháo lắp hoặc test MemTest<br>5. Cài lại Windows nếu cần<br><i>Mang đến — chẩn đoán & sửa trong ngày!</i>',
  q:['Đặt lịch sửa','Hỗ trợ từ xa','Liên hệ ngay']},

 {k:['lỗi update','windows update lỗi','cập nhật lỗi','update fail','stuck update','rollback update'],
  a:'🔄 <b>Lỗi Windows Update:</b><br>• Chạy Windows Update Troubleshooter<br>• Reset Windows Update components<br>• Xóa thư mục SoftwareDistribution<br>• DISM /Online /Cleanup-Image /RestoreHealth<br>• Cài lại Windows nếu lỗi nghiêm trọng<br><i>Hỗ trợ từ xa miễn phí!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Liên hệ']},

 {k:['in 3d','máy in 3d','3d printer','resin','filament','fdm'],
  a:'🖨️ <b>Hỗ trợ thiết bị in 3D:</b><br>• Cài phần mềm slicer (Cura, Bambu Studio)<br>• Driver và kết nối USB/WiFi<br>• Tư vấn sử dụng cơ bản<br>⚠️ <i>Sửa phần cứng máy in 3D — liên hệ trao đổi trước!</i>',
  q:['Liên hệ ngay','Zalo tư vấn','Hỗ trợ từ xa']},

 {k:['cloud','google drive','onedrive','icloud','dropbox','đồng bộ','sync','backup đám mây'],
  a:'☁️ <b>Backup & Cloud Storage:</b><br>• Hỗ trợ cài & đồng bộ Google Drive, OneDrive<br>• Tư vấn backup dữ liệu an toàn<br>• Khôi phục từ cloud khi máy hỏng<br>• Cài đặt tự động backup<br>🎁 <i>Hỗ trợ từ xa miễn phí!</i>',
  q:['Hỗ trợ từ xa','Liên hệ ngay','Đặt lịch']},


  /* ── BẢNG GIÁ CHI TIẾT ── */
  {k:['giá sửa phần cứng','bảng giá phần cứng','giá hardware','giá linh kiện','phần cứng bao nhiêu','sửa cứng giá'],
   q:['Giá cài phần mềm','Lắp đặt PC','Sửa mainboard','Đặt lịch sửa'],
   a:'<b>Bảng giá sửa phần cứng:</b><br>• Lỗi nguồn (IC, FET, jack): <b>200K – 700K</b><br>• Thay nguồn mới: <b>550K – 950K</b><br>• Lỗi ROM / Nạp ROM: <b>300K – 600K</b><br>• Pass BIOS: <b>200K – 400K</b><br>• Sửa mainboard / chip: <b>400K – 1.600K</b><br>• Vệ sinh máy: <b>150K</b><br>• Bo cao áp màn hình: <b>300K – 800K</b><br>• Bản lề laptop: <b>200K / 1 bên</b><br>• Quạt CPU: <b>300K – 600K</b><br><i>Kiểm tra miễn phí — báo giá trước khi sửa!</i>'},

  {k:['giá cài phần mềm','giá cài win','bảng giá phần mềm','cài windows bao nhiêu','giá software','cài phần mềm giá'],
   q:['Giá sửa phần cứng','Lắp đặt PC','Ưu đãi hiện tại','Đặt lịch sửa'],
   a:'<b>Bảng giá cài phần mềm:</b><br>• Cài Windows PC/máy bàn: <b>100K – 120K</b><br>• Cài Windows Laptop: <b>100K – 150K</b><br>• Cài phần mềm lẻ (Office, AutoCAD...): <b>50K – 100K</b><br>• Diệt virus chuyên sâu: <b>70K</b><br>• Cứu dữ liệu format nhầm: <b>Từ 300K</b><br>• Cấu hình mạng / Router Wifi: <b>80K – 150K</b><br>• Sửa máy in & thiết bị ngoại vi: <b>80K – 250K</b><br>• Hỗ trợ từ xa qua TeamViewer: <b class="text-green-600">MIỄN PHÍ TRỌN ĐỜI</b>'},

  {k:['giá lắp đặt pc','giá ráp pc','pc văn phòng giá','pc gaming giá','lắp pc bao nhiêu','cấu hình máy tính','mua pc'],
   q:['Tư vấn cấu hình','Giá sửa phần cứng','Ưu đãi hiện tại','Đặt lịch sửa'],
   a:'<b>Báo giá lắp đặt PC:</b><br><br>🏢 <b>Máy văn phòng:</b><br>• Cơ bản (i3-12100, 8GB, 240GB): <b>~6.5 triệu</b><br>• Trung bình (i5-12400, 16GB, 512GB): <b>~9.5 triệu</b><br>• Cao cấp (i5-13400, 16GB, 1TB NVMe): <b>~13 triệu</b><br><br>🎮 <b>PC Gaming:</b><br>• Nhập môn (R5 5600 + GTX 1650): <b>~15 triệu</b><br>• Tầm trung (R5 7600 + RTX 4060): <b>~22 triệu</b><br>• Cao cấp (i7-13700F + RTX 4070): <b>~32 triệu</b><br><br><i>Giá trên chưa bao gồm màn hình. Liên hệ để báo giá chi tiết!</i>'},

  {k:['ưu đãi','khuyến mãi','miễn phí','từ xa free','hỗ trợ từ xa miễn phí','nhận ngay','ưu đãi tháng','ưu đãi hiện tại'],
   q:['Hỗ trợ từ xa','Giá cài phần mềm','Vào nhóm Zalo','Đặt lịch sửa'],
   a:'<b>Ưu đãi hiện tại tháng này:</b><br><br>Hỗ trợ từ xa <b>MIỄN PHÍ TRỌN ĐỜI</b> cho mọi khách hàng!<br><br>Bao gồm:<br>• Lỗi phần mềm, Office, Windows<br>• Cài driver, cấu hình mạng<br>• Diệt virus nhẹ qua TeamViewer / UltraViewer<br><br>Tham gia nhóm Zalo để nhận hỗ trợ kỹ thuật online, cập nhật ưu đãi mới nhất!<br><a href="https://zalo.me/g/ebbuf9yfotpeiwxgziqo" target="_blank" style="color:#2563eb;font-weight:700;">Vào nhóm Zalo ngay →</a>'},

  /* ── XỬ LÝ SỰ CỐ TRỰC QUAN ── */
  {k:['máy không lên','không bật được','không khởi động','chết nguồn','bấm nút không lên'],
   q:['Giá sửa phần cứng','Kiểm tra miễn phí','Đặt lịch sửa','Hỗ trợ từ xa'],
   a:'<b>Máy không lên nguồn — hướng xử lý:</b><br><br><b>Bước 1:</b> Kiểm tra dây điện / sạc còn cắm chặt không<br><b>Bước 2:</b> Thử cắm sạc khác / ổ điện khác<br><b>Bước 3:</b> Ấn giữ nút nguồn 15 giây, thả ra rồi bật lại<br><br>Nếu vẫn không lên → <b>lỗi phần cứng</b> cần kiểm tra trực tiếp.<br><br>Nguyên nhân thường gặp:<br>• Hỏng IC nguồn / FET nguồn<br>• Lỗi mainboard, ROM<br>• Pin chai, cổng sạc hỏng<br><br><i>Mang máy đến kiểm tra miễn phí — báo giá trước khi sửa!</i>'},

  {k:['máy chạy chậm','máy bị lag','treo máy','đơ máy','máy chậm quá','máy giật lag'],
   q:['Giá cài phần mềm','Hỗ trợ từ xa','Giá sửa phần cứng','Đặt lịch sửa'],
   a:'<b>Máy tính chậm / lag — kiểm tra nhanh:</b><br><br><b>Phần mềm (tự xử lý):</b><br>• Xóa file rác: <i>Disk Cleanup</i> hoặc <i>CCleaner</i><br>• Tắt ứng dụng khởi động: <i>Task Manager → Startup</i><br>• Quét virus: Defender / Malwarebytes<br><br><b>Cần mang đến:</b><br>• Ổ cứng HDD già (nên nâng cấp SSD: 200K – 400K)<br>• RAM thiếu (nâng cấp 8GB→16GB: ~200K – 400K)<br>• Máy đầy bụi (vệ sinh: 150K, làm ngay trong 30 phút)<br><br><i>Hỗ trợ từ xa qua TeamViewer MIỄN PHÍ nếu lỗi phần mềm!</i>'},

  {k:['màn hình đen','màn hình tắt','không có hình','màn xanh bsod','màn hình lỗi','sọc màn hình'],
   q:['Giá sửa phần cứng','Kiểm tra miễn phí','Đặt lịch sửa'],
   a:'<b>Lỗi màn hình — hướng xử lý:</b><br><br><b>Màn hình đen khi mở máy:</b><br>• Thử ấn <b>Fn + F5/F6/F7</b> để bật màn hình<br>• Kết nối màn hình ngoài để kiểm tra<br>• Có thể lỗi driver GPU → cần hỗ trợ<br><br><b>Màn xanh (BSOD):</b><br>• Ghi lại mã lỗi, nhắn Zalo để tư vấn<br>• Thường do driver, RAM, hoặc ổ cứng lỗi<br><br><b>Sọc màn hình / đốm chết:</b><br>• Lỗi màn hình vật lý → cần thay<br><br><i>Kiểm tra miễn phí — xác định lỗi trước khi báo giá!</i>'},

  {k:['vào nhóm zalo','nhóm hỗ trợ','cộng đồng','tham gia nhóm','link zalo','zalo group'],
   q:['Ưu đãi hiện tại','Hỗ trợ từ xa','Hotline gọi ngay'],
   a:'Tham gia nhóm Zalo để:<br>• Nhận hỗ trợ kỹ thuật online <b>miễn phí</b><br>• Cập nhật ưu đãi, khuyến mãi mới nhất<br>• Hỏi đáp trực tiếp với kỹ thuật viên<br><br><a href="https://zalo.me/g/ebbuf9yfotpeiwxgziqo" target="_blank" style="color:#2563eb;font-weight:700;text-decoration:underline;">Bấm đây để vào nhóm Zalo ngay</a>'},


  /* ── FAQ: Thời gian sửa ── */
  {k:['bao lâu','lấy máy khi nào','mất bao giờ','sửa bao lâu','chờ bao lâu','thời gian sửa','lấy máy lúc nào','trả máy'],
   q:['Giá dịch vụ','Đặt lịch sửa','Bảo hành'],
   a:'<b>Thời gian sửa nhanh:</b><br>• Cài Win, diệt virus, cài phần mềm: <b>30–60 phút</b><br>• Thay pin, thay màn hình, nâng cấp RAM/SSD: <b>45–90 phút</b><br>• Sửa mainboard, lỗi nguồn phức tạp: <b>trong ngày</b> (hẹn giờ trả máy)<br><br><i>Cửa hàng luôn báo trước thời gian dự kiến khi nhận máy!</i>'},

  /* ── FAQ: Dữ liệu an toàn ── */
  {k:['dữ liệu','mất file','backup','bảo mật','ảnh bị mất','file bị xóa','mất dữ liệu','an toàn','bảo mật dữ liệu'],
   q:['Cứu dữ liệu','Hỗ trợ từ xa','Đặt lịch sửa'],
   a:'<b>Dữ liệu của bạn LUÔN an toàn:</b><br>• Kỹ thuật viên hỏi và backup dữ liệu quan trọng <b>trước khi cài lại</b><br>• Cam kết bảo mật tuyệt đối<br>• Cứu dữ liệu bị format nhầm / ổ cứng hỏng: từ 300K<br><br><i>Dữ liệu quan trọng luôn được bảo vệ — không lo mất!</i>'},

  /* ── FAQ: Linh kiện chính hãng ── */
  {k:['linh kiện','chính hãng','hàng giả','hàng nhái','tem seal','nguồn gốc','chất lượng linh kiện','đảm bảo'],
   q:['Bảo hành','Giá dịch vụ','Liên hệ ngay'],
   a:'✅ <b>100% linh kiện chính hãng:</b><br>• Có tem/seal đầy đủ, rõ nguồn gốc<br>• Không dùng linh kiện tháo máy hay không rõ nguồn gốc<br>• Khách hàng có thể giám sát trực tiếp quá trình thay thế<br><br><i>Minh bạch — bạn thấy tận mắt linh kiện trước khi lắp!</i>'},

  /* ── FAQ: Bảo hành ── */
  {k:['bảo hành','bảo đảm','hỏng lại','lỗi lại','sửa lại','bảo hành bao lâu','thời gian bảo hành'],
   q:['Giá dịch vụ','Kiểm tra miễn phí','Đặt lịch sửa'],
   a:'<b>Chính sách bảo hành:</b><br>• Linh kiện thay thế: <b>3–12 tháng</b> tùy loại<br>• Cài Win, phần mềm: bảo hành <b>30 ngày</b><br>• Máy hỏng lại đúng lỗi cũ → <b>sửa miễn phí</b> trong thời gian bảo hành<br><br><i>Bảo hành có giấy tờ rõ ràng, không nói suông!</i>'},

  /* ── FAQ: Tại nhà / Onsite ── */
  {k:['đến nhà','thợ đến nhà','tại nhà','onsite','lên nhà','đến tận nơi','kỹ thuật viên đến'],
   q:['Đặt lịch sửa','Hotline gọi ngay','Địa chỉ'],
   a:'🏠 Hiện tại cửa hàng chủ yếu phục vụ tại địa chỉ:<br><b>Xóm 6, Phú Thịnh, Đại Từ, Thái Nguyên</b><br><br>Đặt lịch trước qua form hoặc gọi trực tiếp để trao đổi thêm.<br>Một số trường hợp đặc biệt có thể hỗ trợ onsite — liên hệ hỏi trực tiếp nhé!'},

  /* ── FAQ: Xem sửa trực tiếp ── */
  {k:['xem trực tiếp','xem sửa','giám sát','sửa trước mặt','xem kỹ thuật viên','minh bạch'],
   q:['Đặt lịch sửa','Kiểm tra miễn phí'],
   a:'✅ <b>Hoàn toàn được xem trực tiếp!</b><br>Cửa hàng khuyến khích khách theo dõi quá trình sửa chữa:<br>• Biết chính xác máy bị lỗi gì<br>• Kỹ thuật viên làm gì, thay linh kiện nào<br>• Không phát sinh chi phí ẩn<br><br><i>Minh bạch 100% — bạn thấy thì mới tin!</i>'},

  /* ── FAQ: Báo giá / Phát sinh ── */
  {k:['báo giá','phát sinh','có phát sinh không','giá trọn gói','tính tiền','chi phí','thanh toán bao nhiêu','có tính thêm không'],
   q:['Giá dịch vụ','Kiểm tra miễn phí','Đặt lịch sửa'],
   a:'💯 <b>KHÔNG phát sinh chi phí ẩn:</b><br>• Bảng giá niêm yết công khai<br>• Kiểm tra xong → báo <b>một giá duy nhất</b> trọn gói<br>• Bạn đồng ý thì mới sửa, không ép<br>• Kiểm tra máy <b>hoàn toàn miễn phí</b><br><br><i>Giá đã nói là giá đó — không thêm đồng nào!</i>'},

  /* ── FAQ: Hỗ trợ từ xa ── */
  {k:['teamviewer','ultraviewer','từ xa','remote','hỗ trợ online','sửa từ xa','không cần mang máy'],
   q:['Ưu đãi hiện tại','Đặt lịch sửa','Hotline gọi ngay'],
   a:'🌐 <b>Hỗ trợ từ xa — MIỄN PHÍ TRỌN ĐỜI:</b><br>• Cài phần mềm Office, driver máy in<br>• Quét virus vặt, dọn file rác<br>• Cấu hình mạng, Wifi<br>• Sửa lỗi Windows nhỏ<br><br><b>Cách dùng:</b> Tải UltraViewer hoặc TeamViewer → gửi ID + Pass → kỹ thuật viên kết nối sửa ngay!'},

  /* ── FAQ: Kiểm tra miễn phí ── */
  {k:['kiểm tra miễn phí','không mất phí','không tính tiền','xem lỗi miễn phí','chẩn đoán miễn phí'],
   q:['Đặt lịch sửa','Giá dịch vụ'],
   a:'✅ <b>Kiểm tra máy 100% MIỄN PHÍ:</b><br>• Mang máy đến → kỹ thuật viên kiểm tra, xác định lỗi, báo giá<br>• Bạn không muốn sửa → lấy máy về, <b>không mất đồng nào</b><br>• Chính sách áp dụng trọn đời, mọi lần mang đến<br><br><i>Biết lỗi gì rồi mới quyết định — không rủi ro!</i>'},

  /* ── PC GAMING BUILD DETAIL ── */
  {k:['ráp pc gaming','build gaming','máy gaming','cấu hình gaming','lắp pc gaming','pc chơi game','xây dựng pc gaming'],
   q:['Tư vấn ngân sách','Zalo tư vấn','Đặt lịch sửa'],
   a:'🎮 <b>Ráp PC Gaming chuyên nghiệp:</b><br><br>• <b>~15 triệu (nhập môn):</b> Ryzen 5 5600 + GTX 1650, 16GB RAM<br>• <b>~22 triệu (tầm trung):</b> Ryzen 5 7600 + RTX 4060, 16GB DDR5<br>• <b>~32 triệu (cao cấp):</b> i7-13700F + RTX 4070, 32GB DDR5<br><br>✅ Linh kiện chính hãng 100%<br>✅ Ráp & test stress 30 phút trước giao<br>✅ Bảo hành linh kiện đầy đủ<br><br><b>Ngân sách của bạn là bao nhiêu?</b>'},

  /* ── PC VĂN PHÒNG BUILD ── */
  {k:['pc văn phòng','lắp pc văn phòng','máy văn phòng','máy bàn văn phòng','ráp pc văn phòng'],
   q:['Lắp đặt PC','Tư vấn ngân sách','Zalo tư vấn'],
   a:'🏢 <b>Lắp PC Văn phòng:</b><br><br>• <b>~6.5 triệu (cơ bản):</b> i3-12100, 8GB RAM, SSD 240GB<br>• <b>~9.5 triệu (trung bình):</b> i5-12400, 16GB RAM, SSD 512GB<br>• <b>~13 triệu (cao cấp):</b> i5-13400, 16GB RAM, 1TB NVMe<br><br>Tất cả bao gồm lắp, cài Windows bản quyền + driver đầy đủ.<br><b>Ngân sách của bạn là bao nhiêu?</b>'},

  /* ── TƯ VẤN NGÂN SÁCH ── */
  {k:['tư vấn ngân sách','ngân sách bao nhiêu','bao nhiêu tiền','giá bao nhiêu cho pc','tư vấn theo ngân sách'],
   q:['Lắp đặt PC','Ráp PC Gaming','Zalo tư vấn'],
   a:'💬 Cho mình biết ngân sách của bạn (ví dụ: 10 triệu, 15tr, 25 triệu...).<br>Mình sẽ tư vấn cấu hình phù hợp nhất nhé! 💪'},



  /* PHU KIEN: CHUOT */
  {k:['chuột','mouse','chuột gaming','chuột văn phòng','chuột không dây','logitech chuột','razer chuột'],
   q:['Bàn phím','Màn hình','Zalo tư vấn'],
   a:'<b>Báo giá Chuột máy tính:</b><br><br>• <b>Văn phòng có dây:</b> Logitech B100, A4Tech → <b>80K–200K</b><br>• <b>Không dây:</b> Logitech M185/M330 → <b>200K–500K</b><br>• <b>Gaming tầm trung:</b> Logitech G102, Razer Deathadder E → <b>350K–800K</b><br>• <b>Gaming cao cấp:</b> Razer DeathAdder V3, G Pro X → <b>800K–2 triệu</b><br><br><i>Liên hệ để được tư vấn chọn chuột phù hợp ngân sách!</i>'},

  /* PHU KIEN: BAN PHIM */
  {k:['bàn phím','keyboard','bàn phím cơ','bàn phím giả cơ','bàn phím gaming','phím cơ','switch','keycap','mechanical'],
   q:['Chuột','Màn hình','Zalo tư vấn'],
   a:'<b>Báo giá Bàn phím:</b><br><br>• <b>Màng (membrane):</b> Logitech K120, A4Tech → <b>80K–250K</b><br>• <b>Giả cơ:</b> E-Dra EK387, Akko 3087 → <b>250K–600K</b><br>• <b>Cơ (switch thật):</b> Keychron K2, Akko 3068B → <b>600K–3 triệu</b><br>• <b>Gaming cao cấp:</b> Razer BlackWidow, SteelSeries Apex → <b>2–5 triệu</b><br><br><i>Phím cơ Gateron Blue/Brown thích hợp nhất cho lập trình và gaming!</i>'},

  /* PHU KIEN: MAN HINH */
  {k:['màn hình','monitor','mua màn hình','màn hình gaming','144hz','1080p','2k','4k','qhd','full hd','1440p'],
   q:['Lắp đặt PC','Chuột','Zalo tư vấn'],
   a:'<b>Báo giá Màn hình:</b><br><br>• <b>HD 720p (18–20"):</b> → <b>800K–1.5tr</b><br>• <b>FHD 1080p (21–24"):</b> Dell/Acer/LG → <b>1.8–4.5 triệu</b> (phổ biến nhất)<br>• <b>FHD Gaming 144Hz+ (24–27"):</b> ASUS/MSI → <b>3.5–7 triệu</b><br>• <b>2K QHD (27"):</b> LG/Dell → <b>4.5–10 triệu</b><br>• <b>4K UHD (27–32"):</b> LG/Samsung/ASUS → <b>8–20 triệu</b><br><br><i>Văn phòng/giải trí: FHD 1080p là lựa chọn tối ưu nhất!</i>'},

  /* PHU KIEN: LOA */
  {k:['loa','loa vi tính','speaker','loa máy tính','loa pc','loa để bàn','subwoofer'],
   q:['Màn hình','Tai nghe','Zalo tư vấn'],
   a:'<b>Báo giá Loa vi tính:</b><br><br>• <b>Mini 2.0 cơ bản:</b> Soundmax, Kisonli → <b>80K–250K</b><br>• <b>2.0 tầm trung:</b> Microlab M-109, Edifier R1000T4 → <b>400K–1.2 triệu</b><br>• <b>2.1 có subwoofer:</b> Edifier C3X, Creative T3130 → <b>1–4 triệu</b><br><br><i>Edifier R1000T4 – lựa chọn âm thanh tốt nhất tầm 1 triệu!</i>'},

  /* PHU KIEN: LOT CHUOT */
  {k:['lót chuột','mousepad','pad chuột','bàn di chuột','lót bàn','desk mat'],
   q:['Chuột','Bàn phím','Zalo tư vấn'],
   a:'<b>Báo giá Lót chuột (Mousepad):</b><br><br>• <b>Nhỏ văn phòng (21×26cm):</b> → <b>30K–80K</b><br>• <b>Cỡ vừa (30×35cm):</b> SteelSeries QcK, Corsair → <b>80K–250K</b><br>• <b>XL trải bàn (40×90cm):</b> Razer Goliathus, Logitech Desk Mat → <b>200K–600K</b><br><br><i>Lót chuột XL che phủ cả bàn phím, rất gọn gàng cho bàn làm việc!</i>'},

  /* PHU KIEN: MAY IN */
  {k:['máy in','printer','in ấn','in tài liệu','in màu','in laser','máy in đa năng','scan','photocopy'],
   q:['Zalo tư vấn','Hotline gọi ngay','Đặt lịch sửa'],
   a:'<b>Báo giá Máy in:</b><br><br>• <b>Phun màu Inkjet:</b> Canon E410, Epson L3110 → <b>1.5–3.5 triệu</b><br>• <b>Laser đen trắng:</b> Canon LBP2900+, HP M107a → <b>2.8–5.5 triệu</b><br>• <b>Đa năng 3-in-1 (Print+Scan+Copy):</b> Epson L5290, HP M130fw → <b>4–12 triệu</b><br><br><i>Epson EcoTank tiết kiệm mực nhất cho văn phòng vừa và nhỏ!</i>'},

  /* PHU KIEN: TAI NGHE */
  {k:['tai nghe','headset','headphone','tai phone','nghe nhạc','mic gaming','gaming headset'],
   q:['Loa','Chuột','Zalo tư vấn'],
   a:'<b>Báo giá Tai nghe / Headset:</b><br><br>• <b>Phổ thông:</b> Logitech H111, A4Tech → <b>150K–400K</b><br>• <b>Tầm trung:</b> Logitech H390, HyperX Cloud Stinger → <b>400K–1 triệu</b><br>• <b>Gaming cao cấp:</b> HyperX Cloud II, SteelSeries Arctis → <b>1–2.5 triệu</b><br><br><i>Logitech H390 USB – cân bằng giá/chất lượng xuất sắc nhất!</i>'},

  /* PHU KIEN: WEBCAM */
  {k:['webcam','camera máy tính','camera học online','zoom camera','web cam'],
   q:['Tai nghe','Màn hình','Zalo tư vấn'],
   a:'<b>Báo giá Webcam:</b><br><br>• <b>720p:</b> Logitech C170, A4Tech → <b>250K–500K</b><br>• <b>1080p autofocus:</b> Logitech C920, A4Tech PK-940H → <b>700K–1.5 triệu</b><br><br><i>Webcam 1080p Logitech C920 – chuẩn vàng cho học online và họp Zoom!</i>'},

  /* PHU KIEN: UPS */
  {k:['ups','lưu điện','bộ lưu điện','nguồn dự phòng','ổn áp','mất điện pc'],
   q:['Lắp đặt PC','Zalo tư vấn','Giá dịch vụ'],
   a:'<b>Báo giá Bộ lưu điện UPS:</b><br><br>• <b>600VA (PC văn phòng):</b> APC BX600CI → <b>600K–1 triệu</b><br>• <b>1000VA (PC đa năng):</b> APC BX1000CI → <b>1–1.8 triệu</b><br>• <b>2000VA (Gaming/Workstation):</b> CyberPower → <b>2–3 triệu</b><br><br><i>UPS bảo vệ PC khỏi mất điện đột ngột và sụt áp — nên có cho mọi hệ thống!</i>'},

  /* PHU KIEN TONG QUAT */
  {k:['phụ kiện','mua phụ kiện','phụ kiện máy tính','giá phụ kiện','accessory'],
   q:['Chuột','Bàn phím','Màn hình','Máy in'],
   a:'<b>Phụ kiện máy tính tại Tran Hoa Computer:</b><br><br>Chuột: <b>80K – 2 triệu</b><br>Bàn phím: <b>80K – 5 triệu</b><br>Màn hình: <b>800K – 20 triệu</b><br>Loa: <b>80K – 4 triệu</b><br>Lót chuột: <b>30K – 600K</b><br>Máy in: <b>1.5 – 12 triệu</b><br>Tai nghe: <b>150K – 2.5 triệu</b><br>Webcam: <b>250K – 1.5 triệu</b><br>UPS: <b>600K – 3 triệu</b><br><br>Xem chi tiết tab <b>Phụ kiện</b> trên bảng giá hoặc hỏi mình cụ thể từng loại nhé!'},



  /* LAPTOP VĂN PHÒNG */
  {k:['laptop văn phòng','laptop học','laptop sinh viên','laptop học sinh','laptop học tập','laptop rẻ','laptop dưới 15','laptop dưới 20','laptop tầm trung'],
   q:['Laptop văn phòng','Laptop gaming','iPad','MacBook','Zalo tư vấn'],
   a:'💼 <b>Laptop Văn phòng:</b><br>• <b>Phổ thông (8–12 triệu):</b> ASUS VivoBook, Acer Aspire 3, HP 240 G9 — i3/Ryzen 3, 8GB RAM<br>• <b>Tầm trung (12–18 triệu):</b> Dell Inspiron, Lenovo IdeaPad 5 — i5-13th, 16GB<br>• <b>Doanh nhân (18–35 triệu):</b> Dell XPS 13, ThinkPad X1, ASUS ZenBook — nhôm nhẹ, 14" OLED<br><br><i>Cho mình biết ngân sách và nhu cầu để tư vấn chính xác nhé!</i>'},

  /* LAPTOP GAMING */
  {k:['laptop gaming','laptop chơi game','laptop game','laptop gtx','laptop rtx','laptop rtx 4060','laptop rtx 3050','asus tuf','acer nitro','lenovo legion','msi gaming'],
   q:['Laptop văn phòng','Laptop gaming','MacBook Pro','Zalo tư vấn'],
   a:'🎮 <b>Laptop Gaming:</b><br>• <b>Nhập môn (15–20 triệu):</b> ASUS TUF F15, Acer Nitro 5 — RTX 3050, 144Hz<br>• <b>Tầm trung (20–30 triệu):</b> MSI Katana, Lenovo Legion 5 — RTX 4060, 165Hz<br>• <b>Cao cấp (35–60 triệu):</b> ASUS ROG Strix, Legion Pro 7 — RTX 4070/4080, QHD 240Hz<br><br><i>Ngân sách bao nhiêu? Mình chọn máy tối ưu cho bạn!</i>'},

  /* LAPTOP ĐỒ HỌA */
  {k:['laptop đồ họa','laptop thiết kế','laptop photoshop','laptop autocad','laptop video','laptop editing','macbook pro đồ họa'],
   q:['MacBook Pro','Laptop gaming','Zalo tư vấn'],
   a:'🎨 <b>Laptop Đồ họa / Video Editing:</b><br>• <b>Laptop (28–55 triệu):</b> ASUS ProArt StudioBook, MSI Creator M16, Dell XPS 15 — RTX 4060/4070, màn hình 2K OLED 100% sRGB<br>• <b>MacBook Pro 14" M3 (43–75 triệu):</b> Chip M3 Pro mạnh nhất phân khúc, màn XDR 120Hz<br>• <b>MacBook Pro 16" M3 Max (62–130 triệu):</b> Đỉnh cao cho studio chuyên nghiệp<br><br><i>Liên hệ để được tư vấn theo phần mềm đang dùng!</i>'},

  /* iPAD */
  {k:['ipad','ipad pro','ipad air','ipad mini','apple pencil','magic keyboard ipad','ipad học','ipad vẽ','giá ipad','mua ipad','ipad bao nhiêu','ipad giá bao nhiêu'],
   q:['iPad Air','iPad Pro','MacBook Air','Zalo tư vấn'],
   a:'📱 <b>Dòng iPad (2024):</b><br>• <b>iPad Gen 10:</b> A14 Bionic, 10.9", 64/256GB → <b>9–14 triệu</b><br>• <b>iPad mini Gen 7:</b> A17 Pro, 8.3", nhỏ gọn → <b>14–20 triệu</b><br>• <b>iPad Air M2:</b> M2, 11"/13", cho học & công việc → <b>17–28 triệu</b><br>• <b>iPad Pro M4:</b> OLED siêu mỏng, chuyên nghiệp → <b>27–65 triệu</b><br><br><i>Mua kèm Apple Pencil Pro, Magic Keyboard tư vấn trực tiếp nhé!</i>'},

  /* MacBook */
  {k:['macbook','macbook air','macbook pro','apple silicon','chip m1','chip m2','chip m3','mac os','macos','apple laptop'],
   q:['MacBook Air','MacBook Pro','iPad','Zalo tư vấn'],
   a:'🍎 <b>Dòng MacBook (2024):</b><br>• <b>MacBook Air 13" M3:</b> Nhẹ 1.24kg, pin 18h → <b>27–42 triệu</b><br>• <b>MacBook Air 15" M3:</b> Màn 15.3", lý tưởng văn phòng → <b>32–52 triệu</b><br>• <b>MacBook Pro 14" M3/M3 Pro:</b> 120Hz XDR, HDMI+SD card → <b>43–75 triệu</b><br>• <b>MacBook Pro 16" M3 Max:</b> Đỉnh cao sáng tạo nội dung → <b>62–130 triệu</b><br><br><i>Tất cả hàng chính hãng VN/A, bảo hành Apple chính thức!</i>'},

  /* LAPTOP/IPAD TỔNG QUÁT */
  {k:['laptop ipad macbook','laptop/ipad','mua laptop','mua macbook','mua ipad','tư vấn laptop','tư vấn macbook','tư vấn apple'],
   q:['Laptop văn phòng','Laptop gaming','iPad','MacBook','Phụ kiện'],
   a:'📌 <b>Tư vấn Laptop / iPad / MacBook:</b><br><br>• Văn phòng / học: 8–35 triệu<br>• Gaming: 15–60 triệu<br>• Đồ họa / sáng tạo: 28–130 triệu<br>• iPad: 9–65 triệu<br>• MacBook Air/Pro: 27–130 triệu<br><br>Xem bảng giá chi tiết ở tab <b>Laptop/iPad/MacBook</b> hoặc cho mình biết ngân sách + nhu cầu để tư vấn ngay!'},
 {k:['lắp pc','ráp pc','build pc','tư vấn pc','lắp máy tính','ráp máy','cấu hình pc','lắp bộ pc','lắp máy','tư vấn cấu hình','xây dựng pc'],
  a:'🖥️ <b>Tư vấn cấu hình PC trọn bộ</b> (gồm màn hình, chuột, bàn phím, loa):<br>Bạn cần PC cho mục đích gì?',
  q:['PC cơ bản (~8tr)','PC văn phòng (~15tr)','PC Gaming (~25–45tr)','PC đồ họa (~35–60tr)']},

 {k:['pc cơ bản','pc thường','pc bình thường','máy cơ bản','pc giá rẻ','pc rẻ','lắp pc rẻ','8 triệu','7 triệu','6 triệu'],
  a:'💻 <b>PC Cơ Bản — Trọn Bộ</b> (~7–10 triệu):<br><br>🖥️ <b>Cấu hình máy:</b><br>• CPU: Intel Core i3-12100 hoặc Ryzen 3 4100<br>• RAM: 8GB DDR4<br>• SSD: 256GB SATA<br>• Mainboard: H610 hoặc A520<br>• Case + PSU 450W: 500k–700k<br>• HĐH Windows bản quyền: 300k–500k<br><br>🎁 <b>Phụ kiện tiêu chuẩn:</b><br>• Màn hình 21" FHD (1080p): 2.0–3.0tr<br>• Chuột + Bàn phím văn phòng: 200k–350k<br>• (Không cần loa — dùng loa màn hình hoặc tai nghe)<br><br>💰 <b>Tổng ước tính: 7–10 triệu</b><br><small>Phù hợp lướt web, làm văn bản, học online, giải trí nhẹ</small>',
  q:['PC văn phòng (~15tr)','PC Gaming (~25–45tr)','Liên hệ tư vấn','Đặt lịch lắp đặt']},

 {k:['pc văn phòng','pc công việc','máy văn phòng','lắp pc văn phòng','làm việc','excel','word','kế toán','quản lý','văn phòng'],
  a:'💼 <b>PC Văn Phòng — Trọn Bộ</b> (~12–18 triệu):<br><br>🖥️ <b>Cấu hình máy:</b><br>• CPU: Intel Core i5-12400 hoặc i5-13400<br>• RAM: 16GB DDR4<br>• SSD: 512GB NVMe<br>• Mainboard: B660 hoặc B760<br>• Case + PSU 550W: 700k–1.0tr<br>• HĐH Windows bản quyền: 500k<br><br>🎁 <b>Phụ kiện tiêu chuẩn:</b><br>• Màn hình 24" FHD IPS (1080p): 3.0–4.5tr<br>• Chuột + Bàn phím văn phòng (Logitech/Dell): 300k–600k<br>• Loa mini 2.0 (Edifier R980T nếu cần): 700k–1.2tr<br><br>💰 <b>Tổng ước tính: 12–18 triệu</b><br><small>Phù hợp kế toán, thiết kế nhẹ, đồ họa cơ bản, văn phòng chuyên nghiệp</small>',
  q:['PC cơ bản (~8tr)','PC Gaming (~25–45tr)','Liên hệ tư vấn','Đặt lịch lắp đặt']},

 {k:['pc gaming','pc chơi game','máy gaming','game thủ','lắp pc gaming','chơi game','valorant','liên minh','fps','rtx','gtx'],
  a:'🎮 <b>PC Gaming — Trọn Bộ</b> (~22–45 triệu):<br><br>🖥️ <b>Cấu hình máy (RTX 4060):</b><br>• CPU: Intel Core i5-13600K hoặc Ryzen 5 7600X<br>• GPU: RTX 4060 Ti (8GB) hoặc RX 7700 XT<br>• RAM: 32GB DDR5 (2 x 16GB)<br>• SSD: 1TB NVMe PCIe 4.0<br>• Mainboard: B760 / X670<br>• Case + PSU 750W 80+ Gold: 1.8–2.5tr<br>• HĐH Windows: 500k<br><br>🎁 <b>Phụ kiện Gaming tiêu chuẩn:</b><br>• Màn hình 27" 165Hz QHD (2K): 4.5–7.0tr<br>• Chuột gaming (Logitech G502/Razer): 600k–1.2tr<br>• Bàn phím cơ gaming (Keychron/HyperX): 700k–1.5tr<br>• Loa gaming 2.1 hoặc Headset: 500k–1.5tr<br><br>💰 <b>Tổng ước tính: 22–35 triệu (RTX 4060)</b><br>💰 <b>Nâng cấp RTX 4070 Ti: 35–45 triệu</b><br><small>Chiến mượt tất cả game hiện tại ở Ultra settings, 2K 144fps+</small>',
  q:['PC đồ họa (~35–60tr)','PC văn phòng (~15tr)','Liên hệ tư vấn','Đặt lịch lắp đặt']},

 {k:['pc đồ họa','pc thiết kế','máy đồ họa','thiết kế đồ họa','render','3d','photoshop','premiere','after effects','cinema 4d','blender','dao'],
  a:'🎨 <b>PC Đồ Họa / Render — Trọn Bộ</b> (~35–65 triệu):<br><br>🖥️ <b>Cấu hình máy:</b><br>• CPU: Intel Core i9-13900K hoặc Ryzen 9 7950X<br>• GPU: RTX 4080 16GB hoặc RTX 4070 Super<br>• RAM: 64GB DDR5 (4 x 16GB)<br>• SSD: 2TB NVMe PCIe 5.0 + 2TB HDD lưu trữ<br>• Mainboard: Z790 hoặc X670E<br>• Case + PSU 850W 80+ Platinum: 2.5–4.0tr<br>• HĐH Windows Pro: 500k<br><br>🎁 <b>Phụ kiện chuyên nghiệp:</b><br>• Màn hình 27" 4K IPS hiệu chỉnh màu (Dell P2723QE): 8.0–15tr<br>• Chuột thiết kế + Bàn phím (Wacom, Logitech MX): 500k–2.0tr<br>• Loa studio 2.1 (Edifier S3000 Pro): 1.5–3.0tr<br><br>💰 <b>Tổng ước tính: 35–65 triệu</b><br><small>Render nhanh, màu chuẩn cho print / video production chuyên nghiệp</small>',
  q:['PC Gaming (~25–45tr)','PC văn phòng (~15tr)','Liên hệ tư vấn','Đặt lịch lắp đặt']},

 {k:['phụ kiện pc','màn hình','chuột bàn phím','loa','tai nghe','phụ kiện tiêu chuẩn','accessory','standard accessories','kèm phụ kiện'],
  a:'🎁 <b>Phụ kiện tiêu chuẩn khi lắp PC:</b><br>• Màn hình: FHD 21–24" (2–4.5tr) | 2K 27" 144Hz (4.5–8tr) | 4K 27" (8–15tr)<br>• Chuột: Văn phòng (200–400k) | Gaming (600k–2tr)<br>• Bàn phím: Màng (150–300k) | Giả cơ (300–500k) | Cơ gaming (700k–2.5tr)<br>• Loa: Mini 2.0 (300–800k) | 2.1 Subwoofer (800k–4tr)<br>• Tai nghe gaming: 200k–1.5tr<br>• Lót chuột XL: 80–400k<br><br>Cho mình biết ngân sách + mục đích dùng PC để tư vấn chính xác nhé!',
  q:['PC cơ bản (~8tr)','PC văn phòng (~15tr)','PC Gaming (~25–45tr)','PC đồ họa (~35–60tr)']},

 /* ══════════════════════════════════════════════
    THÔNG TIN BỔ SUNG — TĂNG CHẤT LƯỢNG TƯ VẤN
    ══════════════════════════════════════════════ */

 /* QUY TRÌNH MANG MÁY ĐẾN */
 {k:['mang máy đến','quy trình','cần chuẩn bị gì','trước khi mang máy','mang gì theo','chuẩn bị trước'],
  a:'📋 <b>Quy trình mang máy đến sửa:</b><br><br><b>Bước 1 — Đặt lịch (khuyến nghị):</b><br>Đặt qua form hoặc gọi 0963.284.044 để ưu tiên phục vụ<br><br><b>Bước 2 — Mang theo:</b><br>• Máy tính (laptop/máy bàn)<br>• Adapter/sạc (nếu có)<br>• Nói rõ triệu chứng lỗi khi gặp kỹ thuật viên<br><br><b>Bước 3 — Kiểm tra & báo giá:</b><br>Kỹ thuật viên kiểm tra <b>miễn phí</b>, báo lỗi + giá cụ thể<br><br><b>Bước 4 — Sửa chữa:</b><br>Đồng ý giá → sửa ngay. Không đồng ý → mang máy về, không tính phí<br><br>✅ <i>Minh bạch từ đầu đến cuối!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Hotline gọi ngay','Địa chỉ']},

 /* KHÔNG CÓ LỊCH HẸN */
 {k:['không có lịch','vào thẳng','đến không hẹn','không đặt lịch trước','có thể đến luôn không','đi ngay được không'],
  a:'✅ <b>Không cần hẹn trước vẫn đến được!</b><br><br>Tuy nhiên, đặt lịch trước sẽ giúp:<br>• Kỹ thuật viên chuyên môn phù hợp đón đầu<br>• Không phải chờ đợi lâu vào giờ cao điểm<br>• Ưu tiên phục vụ ngay khi đến<br><br>📞 Gọi <b>0963.284.044</b> hoặc nhắn Zalo trước ~15 phút là ổn!',
  q:['Đặt lịch sửa','Địa chỉ','Hotline gọi ngay']},

 /* PRIVACY / BẢO MẬT DỮ LIỆU */
 {k:['bảo mật dữ liệu','dữ liệu cá nhân','ảnh riêng tư','file cá nhân','có xem dữ liệu không','có đọc file không','privacy'],
  a:'🔒 <b>Cam kết bảo mật tuyệt đối:</b><br><br>• Kỹ thuật viên <b>KHÔNG</b> đọc, sao chép hay chia sẻ dữ liệu cá nhân<br>• Chỉ truy cập đúng phần cần sửa<br>• Khách hàng có thể ở cạnh theo dõi toàn bộ quá trình<br>• File ảnh, tài liệu cá nhân không bị chạm đến<br><br>💡 <i>Nếu lo ngại, hãy backup dữ liệu quan trọng trước khi mang đến — mình cũng sẽ nhắc bạn!</i>',
  q:['Kiểm tra miễn phí','Đặt lịch sửa','Liên hệ ngay']},

 /* THANH TOÁN */
 {k:['thanh toán','trả tiền','chuyển khoản','tiền mặt','momo','zalopay','banking','qr','ví điện tử','trả sau','trả góp'],
  a:'💳 <b>Hình thức thanh toán tại Tran Hoa Computer:</b><br><br>• 💵 Tiền mặt tại cửa hàng<br>• 🏦 Chuyển khoản ngân hàng (Vietcombank, Agribank, MB Bank...)<br>• 📱 MoMo, ZaloPay, VietQR<br><br>✅ <b>Thanh toán SAU khi sửa xong và hài lòng</b><br>❌ Không thu phí trước khi sửa<br>❌ Không phát sinh chi phí ngoài báo giá',
  q:['Giá dịch vụ','Đặt lịch sửa','Liên hệ ngay']},

 /* HỖ TRỢ TỪ XA — HƯỚNG DẪN CHI TIẾT */
 {k:['cách hỗ trợ từ xa','hướng dẫn từ xa','ultraviewer tải','teamviewer tải','làm thế nào từ xa','kết nối từ xa','remote thế nào'],
  a:'🌐 <b>Hỗ trợ từ xa — 3 bước đơn giản:</b><br><br><b>Bước 1:</b> Tải phần mềm <b>UltraViewer</b> (miễn phí, nhẹ):<br>→ <a href="https://ultraviewer.net" target="_blank" style="color:#2563eb;font-weight:700;">ultraviewer.net</a><br><br><b>Bước 2:</b> Mở UltraViewer → ghi lại <b>ID</b> và <b>Password</b><br><br><b>Bước 3:</b> Nhắn ID + Password qua <b>Zalo 0963.284.044</b> hoặc gọi trực tiếp<br><br>⚡ Kỹ thuật viên kết nối và xử lý ngay — không cần mang máy đi!<br>🎁 <b>Hoàn toàn miễn phí!</b>',
  q:['Zalo tư vấn','Hotline gọi ngay','Đặt lịch sửa']},

 /* VỆ SINH MÁY */
 {k:['vệ sinh máy','vệ sinh laptop','vệ sinh pc','dọn bụi','bao lâu vệ sinh','tần suất vệ sinh','bảo dưỡng máy'],
  a:'🧹 <b>Dịch vụ vệ sinh & bảo dưỡng:</b><br><br>• <b>Vệ sinh tổng thể laptop/PC:</b> <b>150K</b> — Xong trong 30–45 phút<br>• <b>Vệ sinh + thay keo tản nhiệt:</b> <b>200K–350K</b><br>• <b>Tần suất khuyến nghị:</b> 6 tháng/lần<br><br>✅ Sau vệ sinh máy mát hơn, ổn định hơn, kéo dài tuổi thọ<br>✅ Làm tại chỗ — lấy máy ngay trong ngày<br><br><i>Máy đang nóng bất thường? Đặt lịch vệ sinh ngay!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Hotline gọi ngay']},

 /* GIÁ NÂNG CẤP */
 {k:['nâng cấp máy','nâng cấp laptop','thêm ram','thêm ssd','nâng cấp ssd','nâng cấp ram','máy cũ nâng cấp','làm mới máy cũ'],
  a:'⬆️ <b>Dịch vụ nâng cấp máy tính:</b><br><br>🔵 <b>Nâng cấp RAM:</b><br>• RAM 8GB DDR4: <b>250K–350K</b> (công + RAM)<br>• RAM 16GB DDR4: <b>400K–600K</b><br><br>🔵 <b>Nâng cấp SSD:</b><br>• SSD 256GB SATA: <b>400K–550K</b> (công + SSD)<br>• SSD 512GB NVMe: <b>600K–900K</b><br>• SSD 1TB NVMe: <b>900K–1.4tr</b><br><br>🔵 <b>Combo SSD + RAM (tiết kiệm nhất):</b> <b>600K–1.2tr</b><br><br>✅ Nâng cấp SSD = máy nhanh gấp <b>5–10 lần</b><br>✅ Thêm RAM = hết đơ khi đa nhiệm<br><br><i>Đặt lịch để kỹ thuật viên tư vấn cụ thể cho máy của bạn!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Hotline gọi ngay']},

 /* SỬA LAPTOP GIÁ THEO HÃNG */
 {k:['giá sửa asus','giá sửa dell','giá sửa hp','giá sửa lenovo','giá sửa acer','giá sửa toshiba','sửa laptop hãng nào','phí sửa theo hãng'],
  a:'🔧 <b>Giá sửa laptop theo dòng máy:</b><br><br>• <b>Laptop phổ thông</b> (Asus, Acer, HP phổ thông): Theo bảng giá chuẩn<br>• <b>Laptop văn phòng cao cấp</b> (Dell XPS, Lenovo ThinkPad, HP EliteBook): Phụ tùng đặc biệt, báo giá sau kiểm tra<br>• <b>MacBook:</b> Linh kiện Apple cần đặt trước, thời gian 2–5 ngày<br><br>💡 <i>Mang đến kiểm tra miễn phí — kỹ thuật viên xem máy rồi báo giá chính xác nhất!</i><br><br>📞 Gọi <b>0963.284.044</b> để hỏi nhanh về model máy của bạn!',
  q:['Kiểm tra miễn phí','Đặt lịch sửa','Zalo tư vấn']},

 /* ĐỊA CHỈ CHI TIẾT */
 {k:['địa chỉ chính xác','đường đi','hướng dẫn đường','cách đi','phú thịnh ở đâu','đại từ thái nguyên','tìm cửa hàng'],
  a:'📍 <b>Địa chỉ cửa hàng:</b><br><br><b>Xóm 6, Phú Thịnh, Đại Từ, Thái Nguyên</b><br><br>🗺️ Xem bản đồ tại cuối trang web (Google Maps tích hợp sẵn)<br><br>📞 Gọi <b>0963.284.044</b> để được hướng dẫn đường đi chi tiết từ vị trí của bạn<br><br>⏰ Giờ mở cửa: <b>07:00 – 22:00 mỗi ngày</b>',
  q:['Hotline gọi ngay','Đặt lịch sửa','Zalo tư vấn']},

 /* LIÊN HỆ TỔNG HỢP */
 {k:['cách liên hệ','liên hệ thế nào','kênh liên hệ','nhắn tin','gửi tin nhắn','tư vấn','hỏi thêm'],
  a:'📬 <b>Kênh liên hệ Tran Hoa Computer:</b><br><br>📞 <b>Gọi điện:</b> <a href="tel:0963284044" style="color:#16a34a;font-weight:700;">0963.284.044</a><br>💬 <b>Zalo:</b> Nhắn tin/gọi Zalo số trên<br>🤖 <b>Chatbot này:</b> Hỏi ngay — phản hồi tức thì 24/7<br>📋 <b>Đặt lịch online:</b> Form đặt lịch ngay trên trang<br><br>⚡ <i>Phản hồi nhanh nhất qua Zalo và Gọi điện!</i>',
  q:['Hotline gọi ngay','Zalo tư vấn','Đặt lịch sửa']},

 /* KHÔNG BIẾT LỖI GÌ */
 {k:['không biết lỗi gì','không rõ vấn đề','mô tả lỗi','không hiểu máy bị gì','máy có vấn đề','máy lạ','máy hành','máy có dấu hiệu'],
  a:'🔍 <b>Không cần biết chính xác lỗi gì — cứ mang đến!</b><br><br>Kỹ thuật viên sẽ:<br>• Chạy đầy đủ diagnostic tool<br>• Kiểm tra phần cứng (RAM, SSD, nhiệt độ, nguồn)<br>• Kiểm tra phần mềm (Windows, driver, virus)<br>• Báo cáo chính xác: <i>lỗi gì, sửa thế nào, giá bao nhiêu</i><br><br>✅ <b>Hoàn toàn miễn phí — không ép sửa!</b><br><br>Hoặc mô tả sơ qua triệu chứng cho mình (VD: "màn hình tối", "máy không bật"), mình tư vấn sơ bộ ngay!',
  q:['Kiểm tra miễn phí','Đặt lịch sửa','Hỗ trợ từ xa','Hotline gọi ngay']},

 /* ══════════════════════════════════════════════
    NÂNG CẤP CHATBOT v2 — CÁC CHỦ ĐỀ CÒN THIẾU
    ══════════════════════════════════════════════ */

 /* LỖI LOA / ÂM THANH */
 {k:['loa','âm thanh','không có tiếng','không nghe','mất tiếng','tiếng kêu','loa hỏng','speaker','audio','sound','tiếng rè','tiếng bị rè','micro','microphone','không ghi âm','loa laptop','loa pc'],
  a:'🔊 <b>Lỗi loa / âm thanh laptop & PC:</b><br><br>• <b>Không có tiếng:</b> Kiểm tra volume — thử ấn Fn+F10/F12<br>• <b>Driver âm thanh lỗi:</b> Hỗ trợ từ xa cài lại — miễn phí 🎁<br>• <b>Tiếng rè, lạo xạo:</b> Loa bị hỏng → thay mới<br>• <b>Micro không ghi âm:</b> Cài lại driver hoặc thay micro<br><br>💰 Thay loa laptop: <b>200K–450K</b> tùy model<br><br><i>Hầu hết lỗi tiếng sửa được từ xa, không cần mang máy!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Hotline gọi ngay']},

 /* WEBCAM / CAMERA */
 {k:['webcam','camera','không nhận camera','camera hỏng','cam laptop','facetime','video call','zoom không thấy','meet camera','camera bị tối','camera nhiễu'],
  a:'📷 <b>Lỗi webcam / camera laptop:</b><br><br>• <b>Không nhận webcam:</b> Thường do driver — hỗ trợ từ xa miễn phí 🎁<br>• <b>Hình bị tối/nhiễu:</b> Có thể lỗi cáp cam hoặc module cam<br>• <b>Bị chặn quyền:</b> Kiểm tra Privacy Settings → Camera<br>• <b>Thay webcam mới:</b> <b>200K–400K</b><br><br><i>90% lỗi webcam xử lý được từ xa không cần mang máy!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Zalo tư vấn']},

 /* BLUETOOTH */
 {k:['bluetooth','kết nối bluetooth','không nhận bluetooth','chuột bluetooth','loa bluetooth','tai nghe bluetooth','bluetooth lỗi','bt không kết nối','ghép đôi bluetooth'],
  a:'📡 <b>Lỗi Bluetooth:</b><br><br>• <b>Không thấy thiết bị:</b> Tắt/bật Bluetooth → Scan lại<br>• <b>Kết nối rồi lại mất:</b> Quên thiết bị → ghép đôi lại<br>• <b>Driver Bluetooth lỗi:</b> Cài lại qua Device Manager<br>• <b>Card Bluetooth hỏng:</b> Thay mới <b>150K–300K</b><br><br>🎁 Hỗ trợ từ xa miễn phí cho lỗi driver!',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Liên hệ ngay']},

 /* USB / CỔNG KẾT NỐI */
 {k:['usb','cổng usb','usb không nhận','cắm usb không nhận','cổng hỏng','jack usb','cổng sạc','jack cắm','type-c','hdmi','cổng hdmi','không nhận usb','cắm chuột không nhận','cổng type c'],
  a:'🔌 <b>Lỗi cổng kết nối:</b><br><br>• <b>USB không nhận:</b> Thử port khác → cài lại USB driver (từ xa miễn phí)<br>• <b>Cổng sạc lỏng/hỏng:</b> Thay cổng sạc <b>150K–400K</b><br>• <b>HDMI/Type-C không ra hình/sạc:</b> Kiểm tra driver hoặc hàn lại cổng<br>• <b>Cổng vật lý lỏng:</b> Hàn lại <b>100K–300K</b><br><br><i>Kiểm tra miễn phí — báo giá trước khi sửa!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Hotline gọi ngay']},

 /* ĐỔ NƯỚC VÀO MÁY */
 {k:['đổ nước','ngấm nước','bị ướt','nước vào máy','tràn nước','đổ nước vào laptop','bị dính nước','máy bị thấm','ướt máy','uống nước đổ'],
  a:'💦 <b>⚠️ MÁY BỊ ĐỔ NƯỚC — XỬ LÝ NGAY:</b><br><br>1. ⚡ <b>TẮT NGAY lập tức</b> — đừng chờ!<br>2. 🔌 Rút sạc/nguồn ngay khỏi ổ điện<br>3. 🙃 Lật ngược máy để nước chảy ra ngoài<br>4. 🚫 <b>KHÔNG BẬT LẠI</b> → dễ chập mạch!<br>5. 📞 Mang đến cửa hàng <b>sớm nhất có thể</b><br><br>💰 Vệ sinh nước + kiểm tra mạch: <b>200K–600K</b><br>⏰ <i>Xử lý trong 2–6 giờ đầu → tỉ lệ cứu thành công cao hơn nhiều!</i>',
  q:['Hotline gọi ngay','Địa chỉ','Đặt lịch sửa']},

 /* TOUCHPAD */
 {k:['touchpad','bàn di chuột','cảm ứng chuột','trackpad','chuột cảm ứng','touchpad hỏng','không di chuột được','touchpad không hoạt động','con trỏ không di chuyển'],
  a:'🖱️ <b>Lỗi Touchpad / bàn di chuột:</b><br><br>• <b>Bị tắt nhầm:</b> Thử ấn <b>Fn + F9/F7</b> (tùy hãng laptop)<br>• <b>Bị khoá trong Settings:</b> Kiểm tra Device Settings<br>• <b>Driver lỗi:</b> Hỗ trợ từ xa cài lại — miễn phí 🎁<br>• <b>Touchpad vật lý hỏng:</b> Thay mới <b>200K–500K</b><br><br><i>Cắm chuột USB dùng tạm trong khi chờ sửa nhé!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Liên hệ ngay']},

 /* VÂN TAY / FACE ID */
 {k:['vân tay','fingerprint','cảm biến vân tay','không nhận vân tay','đăng nhập vân tay','face id','nhận diện khuôn mặt','windows hello','login bằng vân tay'],
  a:'👆 <b>Lỗi cảm biến vân tay / Face ID:</b><br><br>• <b>Không nhận:</b> Xóa & đăng ký lại trong <i>Settings → Sign-in options</i><br>• <b>Driver lỗi:</b> Cài lại driver — hỗ trợ từ xa miễn phí 🎁<br>• <b>Cảm biến hỏng vật lý:</b> Thay mới <b>300K–800K</b> tùy model<br><br><i>Thử hỗ trợ từ xa trước — nhiều trường hợp không cần mang máy!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Zalo tư vấn']},

 /* BẢN LỀ / VỎ LAPTOP */
 {k:['bản lề','vỏ laptop','thay vỏ','nắp máy','bản lề gãy','bản lề vỡ','bản lề lỏng','vỏ nứt','case laptop','khung laptop','nắp lưng'],
  a:'🔩 <b>Sửa bản lề / vỏ laptop:</b><br><br>• <b>Bản lề gãy/lỏng:</b> <b>200K–500K</b>/bên<br>• <b>Thay nắp lưng màn hình:</b> <b>400K–1.2tr</b><br>• <b>Thay vỏ đế máy:</b> <b>500K–1.5tr</b><br>• Đặt linh kiện 1–3 ngày, lắp trong 1–2 giờ<br><br>💡 <i>Gửi ảnh qua Zalo để được báo giá nhanh hơn!</i>',
  q:['Zalo tư vấn','Đặt lịch sửa','Kiểm tra miễn phí']},

 /* QUẠT */
 {k:['quạt hỏng','thay quạt','quạt laptop','quạt pc','quạt kêu to','quạt không quay','fan hỏng','quạt cpu','quạt kêu','tiếng quạt'],
  a:'🌀 <b>Lỗi quạt tản nhiệt:</b><br><br>• <b>Quạt kêu ồn:</b> Bụi kẹt → vệ sinh <b>150K</b><br>• <b>Quạt không quay:</b> Lỗi quạt → thay mới<br>• Thay quạt laptop: <b>200K–450K</b><br>• Thay quạt PC/CPU: <b>150K–350K</b><br><br>⚠️ <i>Quạt hỏng → máy quá nhiệt → chết chip! Xử lý sớm!</i>',
  q:['Đặt lịch sửa','Giá dịch vụ','Hotline gọi ngay']},

 /* MAINBOARD / CHIP */
 {k:['mainboard','main board','bo mạch','lỗi main','sửa main','bảng mạch','chip lỗi','ic hỏng','không post','post lỗi','màn hình không lên khi bật','bật không khởi động được vào windows'],
  a:'🔬 <b>Sửa Mainboard / Chip điện tử:</b><br><br>• Chẩn đoán lỗi mainboard: <b>Miễn phí</b><br>• Sửa IC nguồn, FET nguồn: <b>200K–600K</b><br>• Nạp ROM / Pass BIOS: <b>200K–500K</b><br>• Thay chip cầu nam/bắc, BGA: <b>400K–1.5tr</b><br>• Không POST (không boot được): <b>300K–1tr</b><br><br>⚠️ <i>Cần mang máy trực tiếp — chẩn đoán miễn phí trước khi sửa!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Hotline gọi ngay']},

 /* ƯU ĐÃI / KHUYẾN MÃI */
 {k:['ưu đãi','khuyến mãi','giảm giá','sale','khuyến mại','coupon','voucher','giá tốt','rẻ nhất','deal','offer','combo','gói'],
  a:'🎁 <b>Ưu đãi tại Tran Hoa Computer:</b><br><br>🔵 <b>Miễn phí cố định:</b><br>• Hỗ trợ từ xa <b>MIỄN PHÍ TRỌN ĐỜI</b> 🎁<br>• Kiểm tra, chẩn đoán máy <b>MIỄN PHÍ</b><br>• Báo giá trước — không phát sinh chi phí ẩn<br><br>🟢 <b>Combo tiết kiệm:</b><br>• Cài Windows + Vệ sinh máy: <b>Giảm 50K</b><br>• Nâng cấp SSD + RAM cùng lúc: <b>Giảm 100–200K</b><br>• Giới thiệu bạn bè đến: Nhận <b>50K voucher</b><br><br>📞 Hỏi thêm ưu đãi đang chạy qua hotline nhé!',
  q:['Đặt lịch sửa','Giá dịch vụ','Hotline gọi ngay']},

 /* TƯ VẤN MUA LAPTOP MỚI */
 {k:['tư vấn mua laptop','mua laptop','chọn laptop','laptop nào tốt','laptop dưới','laptop tầm','laptop sinh viên','laptop học sinh','laptop công việc','laptop văn phòng','laptop mới nào','nên mua laptop gì'],
  a:'💻 <b>Tư vấn chọn laptop theo nhu cầu:</b><br><br>📚 <b>Học sinh/Sinh viên (8–15tr):</b><br>• Asus Vivobook / Acer Aspire / HP 15s<br>• RAM 8GB, SSD 512GB, pin 6–8 tiếng<br><br>💼 <b>Văn phòng (12–20tr):</b><br>• Dell Inspiron / Lenovo IdeaPad / HP Pavilion<br>• RAM 16GB, màn hình Full HD IPS<br><br>🎮 <b>Gaming (18–40tr):</b><br>• Asus ROG/TUF / MSI / Acer Nitro<br>• GPU RTX, màn hình 144Hz+<br><br>🍎 <b>MacBook (25–70tr):</b><br>• Air M2/M3: thiết kế nhẹ, văn phòng<br>• Pro M3/M4: đồ họa, video chuyên nghiệp<br><br>📞 Nhắn Zalo kèm ngân sách để được tư vấn cụ thể!',
  q:['Zalo tư vấn','Hotline gọi ngay','MacBook Air','Bảo hành']},

 /* MÁY TÍNH BẢNG / TABLET */
 {k:['máy tính bảng','tablet','samsung tab','galaxy tab','android tablet','thay màn tablet','pin tablet','sửa ipad','sửa tablet','lỗi ipad','thay màn ipad','thay pin ipad','ipad hỏng','ipad lỗi','ipad không lên'],
  a:'📱 <b>Dịch vụ sửa máy tính bảng:</b><br><br>• Thay màn hình tablet: <b>400K–2tr</b> tùy hãng<br>• Thay pin tablet: <b>200K–600K</b><br>• Lỗi phần mềm, cài ROM: <b>100K–300K</b><br>• Cổng sạc hỏng: <b>150K–400K</b><br><br><i>Mang đến kiểm tra miễn phí — báo giá trước khi sửa!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Liên hệ ngay']},

 /* ĐIỆN THOẠI */
 {k:['điện thoại','phone','sửa điện thoại','iphone hỏng','samsung hỏng','oppo','xiaomi'],
  a:'📱 Hiện tại cửa hàng chuyên về <b>máy tính, laptop, PC, và tablet</b>.<br><br>Rất tiếc chưa có dịch vụ sửa điện thoại.<br><br>Có vấn đề gì về <b>máy tính hoặc laptop</b> không? Mình hỗ trợ ngay!',
  q:['Giá dịch vụ','Đặt lịch sửa','Kiểm tra miễn phí']},

 /* DỊCH VỤ TỔNG QUAN */
 {k:['dịch vụ','shop có gì','cung cấp gì','làm được gì','hỗ trợ gì','phục vụ','danh sách dịch vụ','bạn làm được gì','cửa hàng làm gì'],
  a:'🛠️ <b>Tran Hoa Computer — Đầy đủ dịch vụ:</b><br><br>💻 <b>Sửa chữa:</b> Laptop, PC, màn hình, máy in<br>⚡ <b>Phần cứng:</b> Nguồn, mainboard, chip, màn hình, pin, quạt, bản lề<br>💿 <b>Phần mềm:</b> Windows, Office, diệt virus, cứu dữ liệu<br>🔧 <b>Nâng cấp:</b> SSD, RAM, GPU, nguồn<br>🖥️ <b>Lắp đặt PC:</b> Văn phòng, Gaming, Đồ họa<br>🌐 <b>Từ xa miễn phí:</b> Driver, phần mềm, cấu hình mạng<br>🧹 <b>Bảo dưỡng:</b> Vệ sinh định kỳ chỉ 150K<br><br>✅ Kiểm tra miễn phí | ✅ Báo giá trước | ✅ Bảo hành rõ ràng',
  q:['Giá dịch vụ','Đặt lịch sửa','Kiểm tra miễn phí','Hotline gọi ngay']},

 /* ĐIỀN FORM / THÔNG TIN ĐẶT LỊCH */
 {k:['điền gì','ghi gì','đặt lịch cần gì','form ghi gì','thông tin đặt lịch','cần điền gì vào form','form đặt lịch'],
  a:'📋 <b>Đặt lịch chỉ cần 3 thông tin:</b><br><br>1. <b>Tên bạn</b> — để kỹ thuật viên gọi tên thân thiện 😊<br>2. <b>Số điện thoại</b> — xác nhận lịch trong 15 phút<br>3. <b>Mô tả sự cố ngắn</b> — VD: "máy chậm", "không bật được", "vỡ màn hình"<br><br>📌 Form ngay trên trang này hoặc nhắn Zalo <b>0963.284.044</b>',
  q:['Đặt lịch sửa','Hotline gọi ngay','Địa chỉ']},

 /* THỜI GIAN CHỜ / NHẬN MÁY */
 {k:['bao lâu','mất bao lâu','khi nào xong','chờ bao lâu','nhận máy lúc nào','thời gian sửa','lấy máy khi nào','sửa trong ngày không'],
  a:'⏱️ <b>Thời gian sửa tham khảo:</b><br><br>⚡ <b>Làm ngay trong ngày (30–120 phút):</b><br>• Cài Windows, driver, phần mềm<br>• Vệ sinh máy, thay keo<br>• Thay pin, RAM, SSD<br>• Thay màn hình, bàn phím<br><br>📅 <b>1–3 ngày:</b><br>• Sửa mainboard, chip phức tạp<br>• Đặt linh kiện đặc biệt (bản lề, vỏ, quạt hiếm)<br><br>⏳ <b>1–5 ngày:</b><br>• Cứu dữ liệu ổ cứng hỏng<br><br>✅ <i>Cửa hàng báo thời gian dự kiến ngay khi nhận máy!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Hotline gọi ngay']},

 /* ══ NHÓM CÂU HỎI MỞ RỘNG — LINH HOẠT HƠN ══ */

 /* MÁY KHÔNG BẬT / KHÔNG LÊN NGUỒN */
 {k:['không bật được','không lên','bấm nút nguồn không có gì','máy chết','nguồn không lên','màn đen không lên','không phản hồi','sập nguồn'],
  a:'⚡ <b>Máy không bật / không lên nguồn?</b><br><br>Nguyên nhân phổ biến:<br>• Pin hết hoặc adapter hỏng → thử sạc 15 phút rồi bật lại<br>• Lỗi phần mềm / treo boot → tắt nguồn hoàn toàn 30 giây<br>• IC nguồn, mainboard lỗi → cần kỹ thuật viên chẩn đoán<br><br>💡 <b>Không tự sửa được?</b> Mang máy đến — kiểm tra <b>miễn phí</b>, báo giá trước!',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Hỗ trợ từ xa']},

 /* MÁY BỊ ĐỔ NƯỚC / VÔ NƯỚC */
 {k:['đổ nước','vô nước','ngấm nước','ướt máy','tràn nước','dính nước','máy bị nước'],
  a:'💧 <b>Máy bị nước — xử lý NGAY:</b><br><br>🚨 <b>Làm ngay lập tức:</b><br>1. Tắt máy ngay, rút sạc<br>2. Úp ngược máy, lau khô bên ngoài<br>3. KHÔNG bật lại — sẽ chập mạch!<br>4. Mang đến cửa hàng trong vòng 1–2 tiếng<br><br>✅ <b>Xử lý sớm = tỷ lệ cứu máy cao hơn 80%!</b><br><br>📞 Gọi ngay <b>0963.284.044</b> để được hướng dẫn thêm!',
  q:['Hotline gọi ngay','Đặt lịch sửa','Địa chỉ']},

 /* MÁY LAG / CHẠY CHẬM — CHI TIẾT HƠN */
 {k:['máy chạy chậm','máy ì','khởi động lâu quá','mở app lâu','ram đầy','cpu 100%','ổ cứng đầy','máy nặng'],
  a:'🐌 <b>Máy chậm — nguyên nhân & giải pháp:</b><br><br>🔍 <b>Kiểm tra nhanh:</b><br>• RAM dưới 8GB → nâng cấp RAM <b>350K–600K</b><br>• Ổ HDD cũ → thay SSD tăng tốc gấp 5–10x, từ <b>450K</b><br>• Quá nhiều phần mềm khởi động → tối ưu Windows<br>• Virus, malware → diệt virus chuyên sâu <b>70K</b><br>• Máy bụi, quạt kém → vệ sinh tản nhiệt <b>150K</b><br><br>⚡ <i>Mang đến kiểm tra miễn phí để xác định đúng nguyên nhân!</i>',
  q:['Giá nâng cấp SSD','Giá nâng cấp RAM','Kiểm tra miễn phí','Đặt lịch sửa']},

 /* GIÁ THAY MÀN HÌNH — LAPTOP */
 {k:['giá thay màn hình laptop','thay màn laptop giá','màn hình laptop hỏng','vỡ màn laptop','màn laptop giá bao nhiêu','bể màn laptop'],
  a:'🖥️ <b>Giá thay màn hình laptop:</b><br><br>• Màn 15.6\" FHD (1080p): <b>1.200K – 2.500K</b><br>• Màn 13–14\" FHD: <b>1.500K – 3.000K</b><br>• Màn 2K/4K/OLED cao cấp: <b>2.500K – 6.000K</b><br>• MacBook (Retina): <b>3.000K – 8.000K</b><br><br>✅ <i>Nhập chính hãng, bảo hành 3–6 tháng. Kiểm tra miễn phí trước khi sửa!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Liên hệ ngay']},

 /* MÁY BÁO LỖI / THÔNG BÁO LẠ */
 {k:['máy báo lỗi','thông báo lỗi','hiện chữ lạ','lỗi gì đó','error','not found','boot fail','disk error','ntldr','no bootable'],
  a:'⚠️ <b>Máy báo lỗi / thông báo lạ?</b><br><br>Một số lỗi phổ biến:<br>• <b>"NTLDR missing" / "No bootable device"</b> → lỗi ổ cứng hoặc Windows<br>• <b>"Disk read error"</b> → ổ cứng hỏng, cần cứu dữ liệu gấp<br>• <b>"BSOD / màn hình xanh"</b> → xung đột driver hoặc RAM lỗi<br>• <b>"Your PC ran into a problem"</b> → lỗi Windows, cần cài lại<br><br>📸 <i>Chụp màn hình lỗi và mang đến — chẩn đoán miễn phí!</i>',
  q:['Cứu dữ liệu','Cài lại Windows','Kiểm tra miễn phí','Đặt lịch sửa']},

 /* PIN LAPTOP YẾU / HỎI GIÁ THAY PIN */
 {k:['giá thay pin laptop','pin laptop hỏng','pin chai','pin sạc không đầy','pin tụt nhanh','pin bao nhiêu','thay pin bao nhiêu tiền'],
  a:'🔋 <b>Giá thay pin laptop:</b><br><br>• Laptop phổ thông (Asus, Acer, Lenovo, HP): <b>350K – 800K</b><br>• Dell, MSI, Razer: <b>500K – 1.200K</b><br>• MacBook (dán/rời): <b>800K – 2.000K</b><br><br>✅ Pin chính hãng, bảo hành 6 tháng<br>⏱️ Thay xong trong <b>30–60 phút</b><br><br><i>Kiểm tra pin miễn phí — biết được % sức khỏe pin ngay!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Liên hệ ngay']},

 /* MÁY TÍNH BỊ VIRUS / BẢO MẬT */
 {k:['bị virus','máy bị hack','bị mã độc','bị ransomware','bị khóa máy','file bị mã hóa','máy tự mở','tự bật tắt'],
  a:'🛡️ <b>Máy bị virus / mã độc?</b><br><br>🚨 <b>Dấu hiệu nhận biết:</b><br>• Máy tự mở tắt, CPU/RAM cao bất thường<br>• File bị mã hóa, xuất hiện đuôi lạ (.locked, .encrypt)<br>• Trình duyệt tự chuyển hướng<br>• Mật khẩu bị thay đổi<br><br>🔧 <b>Dịch vụ diệt virus chuyên sâu:</b> <b>70K – 150K</b><br>📦 <i>Có thể hỗ trợ từ xa ngay nếu máy còn lên được!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Hotline gọi ngay']},

 /* SO SÁNH SỬA vs MUA MỚI */
 {k:['nên sửa hay mua mới','đáng sửa không','sửa hay thay','chi phí sửa nhiều không','giá sửa bằng mua mới'],
  a:'🤔 <b>Nên sửa hay mua mới?</b><br><br>✅ <b>Nên sửa khi:</b><br>• Máy còn dưới 5 tuổi, phần cứng ổn<br>• Chi phí sửa dưới 30–40% giá máy mới<br>• Chỉ lỗi nhỏ: pin, màn hình, SSD, phần mềm<br><br>🆕 <b>Nên mua mới khi:</b><br>• Mainboard lỗi nặng, chi phí > 50% giá máy<br>• Máy quá cũ (>6 năm), không đáp ứng nhu cầu<br>• Sửa xong vẫn chậm do cấu hình yếu<br><br>💬 <i>Mang máy đến — kiểm tra miễn phí rồi tư vấn thật lòng!</i>',
  q:['Kiểm tra miễn phí','Tư vấn laptop mua mới','Đặt lịch sửa']},

 /* GIÁ NÂNG CẤP RAM CHI TIẾT */
 {k:['giá nâng cấp ram','nâng ram bao nhiêu','thêm ram giá','8gb lên 16gb','16gb lên 32gb','ram mấy tiền','lên ram giá'],
  a:'💾 <b>Giá nâng cấp RAM laptop:</b><br><br>• 8GB DDR4: <b>250K – 400K</b><br>• 16GB DDR4: <b>450K – 700K</b><br>• 16GB DDR5: <b>550K – 900K</b><br>• 32GB DDR4: <b>800K – 1.300K</b><br>• 32GB DDR5: <b>1.000K – 1.600K</b><br><br>⚠️ <i>Phí công lắp: 50K–100K. Máy hàn RAM (Macbook/một số Asus) không nâng được — mang đến kiểm tra trước!</i>',
  q:['Đặt lịch sửa','Giá nâng cấp SSD','Kiểm tra miễn phí']},

 /* GIÁ NÂNG CẤP SSD CHI TIẾT */
 {k:['giá nâng cấp ssd','thay ssd bao nhiêu','ssd mấy tiền','thêm ssd giá','ssd 256gb giá','ssd 512gb giá','ssd 1tb giá'],
  a:'💿 <b>Giá nâng cấp SSD:</b><br><br>• SSD 256GB SATA: <b>300K – 500K</b><br>• SSD 512GB SATA: <b>450K – 700K</b><br>• SSD 512GB NVMe: <b>500K – 850K</b><br>• SSD 1TB NVMe: <b>800K – 1.400K</b><br>• SSD 2TB NVMe: <b>1.400K – 2.500K</b><br><br>✅ Bao gồm cài Windows, chuyển dữ liệu<br>⚡ <i>Máy nhanh gấp 5–10 lần so với HDD cũ!</i>',
  q:['Đặt lịch sửa','Giá nâng cấp RAM','Kiểm tra miễn phí']},

 /* LIÊN HỆ KHI KHÔNG BIẾT LỖI GÌ */
 {k:['không biết máy bị gì','không hiểu lỗi gì','máy hành xử lạ','máy lạ','không rõ nguyên nhân','mô tả không được','lỗi không biết'],
  a:'🔍 <b>Không rõ máy đang bị lỗi gì — không sao!</b><br><br>Đó là việc của kỹ thuật viên 😊<br><br>📋 <b>Bạn chỉ cần mô tả triệu chứng:</b><br>• Máy làm gì lạ? (tắt đột ngột, chạy chậm, kêu tiếng lạ...)<br>• Xảy ra khi nào? (lúc cắm sạc, mở app nặng, lúc nào cũng vậy?)<br><br>✅ Kỹ thuật viên sẽ <b>kiểm tra miễn phí</b> và giải thích rõ trước khi sửa!',
  q:['Đặt lịch sửa','Hotline gọi ngay','Kiểm tra miễn phí']},

 /* CÀI WINDOWS / DRIVER */
 {k:['cài windows','cài lại win','cài lại hệ điều hành','cài driver','mất driver','driver wifi','cài win 10','cài win 11','format máy'],
  a:'💿 <b>Cài Windows / Driver:</b><br><br>• Cài Windows 10/11 PC: <b>100K – 120K</b><br>• Cài Windows Laptop: <b>100K – 150K</b><br>• Cài driver đầy đủ: <b>kèm theo</b><br>• Cài Office, phần mềm kèm: <b>+50K</b><br><br>⏱️ Thực hiện trong <b>45–90 phút</b><br>🌐 <i>Hỗ trợ từ xa nếu máy còn lên Windows được!</i>',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Hotline gọi ngay']},

 /* TÌNH HUỐNG KHẨN CẤP */
 {k:['cần sửa gấp','khẩn cấp','gấp lắm','đang cần gấp','cần máy ngay','hôm nay có làm không','cuối tuần làm không','chiều nay được không'],
  a:'🚀 <b>Cần sửa gấp — được ngay!</b><br><br>• Gọi hotline <b>0963.284.044</b> báo tình trạng<br>• Ưu tiên phục vụ ngay khi đến<br>• Nhiều dịch vụ hoàn thành trong <b>30–60 phút</b><br><br>🕐 <b>Giờ làm việc: 8:00 – 21:00 hàng ngày</b> (kể cả T7, CN)<br>🌐 <i>Hỗ trợ từ xa ngay nếu không đến được!</i>',
  q:['Hotline gọi ngay','Hỗ trợ từ xa','Địa chỉ']},

 /* HỎI VỀ CẤU HÌNH MÁY */
 {k:['cấu hình máy','thông số máy','spec máy','máy tôi cấu hình gì','xem cấu hình','kiểm tra cấu hình','cpu gì','ram bao nhiêu'],
  a:'🖥️ <b>Kiểm tra cấu hình máy:</b><br><br><b>Cách nhanh (Windows):</b><br>• Nhấn <code>Windows + R</code> → gõ <code>dxdiag</code> → Enter<br>• Hoặc chuột phải <b>This PC</b> → <b>Properties</b><br><br><b>Cách nhanh (Mac):</b><br>• Click <b>🍎</b> góc trái → <b>About This Mac</b><br><br>💬 <i>Chụp màn hình thông số và gửi cho mình để tư vấn nâng cấp phù hợp nhé!</i>',
  q:['Giá nâng cấp RAM','Giá nâng cấp SSD','Zalo tư vấn']},

 /* MÁY KHÔNG KẾT NỐI WIFI */
 {k:['không bắt wifi','wifi không kết nối','không tìm thấy wifi','wifi biến mất','wifi hay bị ngắt','mạng wifi chập chờn','không lên mạng'],
  a:'📶 <b>Wifi không kết nối — xử lý thế nào?</b><br><br>🔧 <b>Thử các bước sau:</b><br>1. Tắt Wifi rồi bật lại → tắt router 30 giây<br>2. Forget network → kết nối lại<br>3. Update driver Wifi (Device Manager)<br>4. Chạy: <code>netsh winsock reset</code><br><br>❌ <b>Nếu vẫn không được:</b><br>• Card Wifi hỏng → thay hoặc hỗ trợ từ xa chẩn đoán<br>• Chi phí: <b>150K – 500K</b> tùy loại card',
  q:['Hỗ trợ từ xa','Đặt lịch sửa','Hotline gọi ngay']},

 /* MÁY KÊU TIẾNG LẠ */
 {k:['máy kêu tiếng lạ','tiếng click','tiếng cạch','ổ cứng kêu','quạt kêu to','tiếng ù ù','máy ồn lạ'],
  a:'🔊 <b>Máy kêu tiếng lạ — cần xử lý sớm!</b><br><br>🚨 <b>Tiếng kêu từ ổ cứng (click/cạch):</b><br>→ Nguy hiểm! Ổ cứng sắp hỏng — backup dữ liệu ngay!<br><br>🌀 <b>Quạt kêu to / ù ù:</b><br>→ Bụi bẩn hoặc quạt hỏng — vệ sinh <b>150K</b> hoặc thay quạt <b>300K–600K</b><br><br>⚡ <b>Tiếng bip khi bật máy:</b><br>→ Lỗi RAM hoặc mainboard — cần kiểm tra ngay',
  q:['Đặt lịch sửa','Cứu dữ liệu','Kiểm tra miễn phí']},

 /* HỎI VỀ CHÍNH SÁCH / UY TÍN */
 {k:['cửa hàng có uy tín không','tin tưởng được không','có lừa đảo không','mang máy có mất không','an toàn không','đánh giá cửa hàng'],
  a:'⭐ <b>Tran Hoa Computer — Cam kết minh bạch:</b><br><br>✅ <b>Kiểm tra miễn phí</b> — không tính phí nếu không sửa<br>✅ <b>Báo giá trước</b> — không phát sinh chi phí ngoài<br>✅ <b>Bảo hành rõ ràng</b> — có phiếu bảo hành đàng hoàng<br>✅ <b>Không đọc dữ liệu cá nhân</b> — khách có thể ngồi xem<br>✅ <b>Linh kiện chính hãng</b> — có tem, có nguồn gốc<br><br>💬 <i>Hàng ngàn khách hàng đã tin tưởng — xem đánh giá thực tế trên trang nhé!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Hotline gọi ngay']},

 /* GIÁ CỨU DỮ LIỆU CHI TIẾT */
 {k:['giá cứu dữ liệu','phục hồi dữ liệu bao nhiêu','cứu file bao nhiêu tiền','mất dữ liệu','format nhầm phục hồi','xóa nhầm lấy lại'],
  a:'💾 <b>Giá dịch vụ cứu dữ liệu:</b><br><br>• Xóa nhầm / Format nhầm (ổ còn tốt): <b>300K – 500K</b><br>• Ổ cứng hỏng logic (nhận nhưng không đọc): <b>500K – 1.500K</b><br>• Ổ cứng hỏng cơ (không nhận, kêu lạ): <b>1.500K – 5.000K</b><br>• SSD hỏng (mất điện đột ngột): <b>800K – 3.000K</b><br><br>⚠️ <i>Tỷ lệ cứu thành công 70–95% tùy mức độ. Kiểm tra miễn phí trước!</i>',
  q:['Đặt lịch sửa','Kiểm tra miễn phí','Hotline gọi ngay']},

 /* HỎI TỔNG QUÁT — GIÁ BÁO NGAY */
 {k:['giá hết bao nhiêu','tổng chi phí','tiền sửa hết bao nhiêu','chi phí khoảng bao nhiêu','phí sửa chữa'],
  a:'💰 <b>Chi phí sửa chữa tại Tran Hoa:</b><br><br>🔧 <b>Phần mềm:</b> 70K – 200K<br>💿 <b>Cài Windows:</b> 100K – 150K<br>🔋 <b>Thay pin:</b> 350K – 2.000K<br>🖥️ <b>Thay màn hình:</b> 1.200K – 8.000K<br>💾 <b>Thay SSD:</b> 300K – 2.500K<br>🧹 <b>Vệ sinh máy:</b> 150K<br>🔌 <b>Sửa mainboard:</b> 400K – 1.600K<br><br>✅ <i>Kiểm tra và báo giá cụ thể MIỄN PHÍ trước khi sửa!</i>',
  q:['Đặt lịch sửa','Xem bảng giá chi tiết','Kiểm tra miễn phí']},

 /* GẶP KỸ THUẬT VIÊN — CHUYỂN TIẾP NGƯỜI THẬT */
 {k:['gap ky thuat vien','ky thuat vien','nhan vien','noi chuyen nguoi that','muon noi chuyen','cho gap','nhan vien tu van','tu van truc tiep','hoi nguoi that','biet nguoi that','noi truc tiep'],
  a:'👨‍🔧 <b>Kết nối với kỹ thuật viên ngay!</b><br><br>📞 <b>Hotline:</b> <a href="tel:0819120401" style="color:#2563eb;font-weight:700">0819.120.401</a><br>💬 <b>Zalo:</b> <a href="https://zalo.me/0819120401" target="_blank" style="color:#2563eb;font-weight:700">Nhắn Zalo ngay</a><br><br>⏰ Giờ làm việc: <b>7:30 – 20:00</b> hàng ngày (kể cả T7, CN)<br><br><i>Kỹ thuật viên sẽ tư vấn miễn phí và xử lý nhanh nhất!</i>',
  q:['Hotline gọi ngay','Zalo tư vấn','Đặt lịch sửa']},

  // ─── KB EXPANSION v17 ───────────────────────────────────

  // Kích hoạt Windows / bản quyền
  {k:['kích hoạt windows','activate windows','windows lậu','bản quyền windows','win bản quyền','crack windows','watermark windows','windows genuine'],
   a:'🔑 <b>Kích hoạt Windows bản quyền tại Tran Hoa Computer:</b><br><br>• <b>Windows 10 Home:</b> 300K–400K (kích hoạt vĩnh viễn)<br>• <b>Windows 11 Home:</b> 350K–450K<br>• <b>Windows 10/11 Pro:</b> 450K–600K<br><br>✅ Bản quyền chính hãng, kích hoạt online, không bao giờ bị thu hồi<br>✅ Kèm cài đặt driver đầy đủ, Windows Update hoạt động bình thường<br><br><i>Tuyệt đối KHÔNG dùng bản crack — dễ nhiễm virus, mất dữ liệu!</i>'},

  // Lỗi màn hình (không thay) — đường sọc, nhấp nháy, tối màn
  {k:['màn hình sọc','màn hình nhấp nháy','màn hình tối','độ sáng màn hình','màn hình chớp','display flicker','màn hình lỗi không vỡ','đường sọc màn hình'],
   a:'🖥️ <b>Lỗi màn hình không do vỡ kính:</b><br><br>• <b>Đường sọc dọc/ngang:</b> Có thể do cáp màn hình lỏng → sửa 200K–400K<br>• <b>Nhấp nháy khi dùng:</b> Thường do card đồ họa hoặc driver → 0đ (cài driver) đến 500K<br>• <b>Màn hình tối đột ngột:</b> IC led backlight hỏng → 300K–600K<br>• <b>Màn hình mờ/xỉn màu:</b> Đèn nền yếu → thay đèn LED 400K–800K<br><br>📌 Kiểm tra miễn phí, báo giá trước khi sửa!'},

  // Bàn phím / Trackpad lỗi
  {k:['bàn phím hỏng','phím không gõ được','phím bị liệt','trackpad không hoạt động','chuột cảm ứng laptop','thay bàn phím','keyboard broken','bàn phím vài phím hỏng'],
   a:'⌨️ <b>Sửa bàn phím & trackpad laptop:</b><br><br><b>Bàn phím:</b><br>• Một vài phím hỏng: Thay phím lẻ 50K–150K/phím<br>• Bàn phím hỏng nhiều phím: Thay cả bàn phím 350K–800K<br>• Bàn phím dính nước: Vệ sinh + sấy khô 150K–300K<br><br><b>Trackpad:</b><br>• Không nhận cử chỉ, click không được: 200K–500K<br>• Trackpad liệt hoàn toàn: Thay mới 350K–700K<br><br><i>Thay bàn phím giữ nguyên bảo hành linh kiện cũ!</i>'},

  // Pin chai/phồng/cạn nhanh
  {k:['pin chai','pin phồng','pin cạn nhanh','pin không sạc','sạc không vào','pin bị phồng','pin hao nhanh','kiểm tra pin','pin 0%','battery health'],
   a:'🔋 <b>Thay pin laptop tại Tran Hoa Computer:</b><br><br>• <b>Pin chai (dưới 50% capacity):</b> Thay mới, sử dụng bình thường lại<br>• <b>Pin phồng:</b> Nguy hiểm — nên thay ngay, không chờ!<br>• <b>Giá thay pin:</b> 350K–1.500K (tùy dòng máy)<br><br>🔧 <b>Dòng máy phổ biến:</b><br>• Asus VivoBook/ZenBook: 450K–800K<br>• Dell Inspiron/Vostro: 500K–900K<br>• HP Pavilion/Envy: 450K–850K<br>• Lenovo IdeaPad/ThinkPad: 400K–1.000K<br>• MacBook Air/Pro M1/M2: 1.200K–2.200K<br><br>✅ Bảo hành pin 6–12 tháng'},

  // Wifi không kết nối / mạng chập chờn
  {k:['wifi không bắt','wifi yếu','không kết nối wifi','wifi bị ngắt','wifi chập chờn','mạng không ổn định','wifi limited','wifi !','không có internet'],
   a:'📶 <b>Xử lý lỗi Wifi / mạng:</b><br><br><b>Tự thử trước:</b><br>• Restart máy và router<br>• Forget network rồi kết nối lại<br>• Cài lại driver wifi: Device Manager → Network Adapters<br><br><b>Nếu vẫn lỗi, mang vào tiệm:</b><br>• <b>Cài driver Wifi:</b> MIỄN PHÍ (hỗ trợ từ xa)<br>• <b>Card Wifi hỏng:</b> Thay 200K–500K<br>• <b>Anten Wifi đứt:</b> Hàn/thay 150K–350K<br><br><i>Xử lý từ xa qua UltraViewer miễn phí nếu lỗi phần mềm!</i>'},

  // Máy quá nóng / quạt kêu to
  {k:['máy quá nóng','laptop nóng','quạt kêu to','quạt ồn','cpu nóng','nhiệt độ cao','máy bị nóng','thermal throttle','vệ sinh máy','thay keo tản nhiệt'],
   a:'🌡️ <b>Xử lý laptop quá nóng / quạt ồn:</b><br><br><b>Nguyên nhân chính:</b><br>• Bụi bám quạt & tản nhiệt → tắc luồng khí<br>• Keo tản nhiệt CPU khô → dẫn nhiệt kém<br>• Quạt hỏng → không tản nhiệt được<br><br><b>Giải pháp:</b><br>• 🧹 <b>Vệ sinh bụi toàn bộ:</b> 150K (lấy ngay 20–30 phút)<br>• 🧊 <b>Thay keo tản nhiệt cao cấp (Thermal Grizzly/Kryonaut):</b> +100K<br>• 🔧 <b>Thay quạt mới:</b> 250K–500K<br><br>✅ Sau vệ sinh + thay keo, máy có thể giảm 15–25°C!'},

  // Cứu dữ liệu chi tiết (nâng cao)
  {k:['cứu dữ liệu','khôi phục dữ liệu','ổ cứng chết','ổ cứng hỏng','file bị xóa','format nhầm','mất dữ liệu','data recovery','ổ cứng không nhận','bad sector'],
   a:'💾 <b>Cứu dữ liệu tại Tran Hoa Computer:</b><br><br><b>Các trường hợp cứu được:</b><br>✅ Xóa nhầm file (Recycle Bin đã xóa)<br>✅ Format ổ cứng nhầm<br>✅ Virus mã hóa tệp (một số loại)<br>✅ Phân vùng bị xóa<br>✅ Ổ cứng không nhận, click-click (cơ học nhẹ)<br><br><b>Bảng giá cứu dữ liệu:</b><br>• Xóa file / format đơn giản: <b>200K–500K</b><br>• Phân vùng hỏng: <b>300K–700K</b><br>• Ổ cứng lỗi cơ học nhẹ: <b>800K–2.000K</b><br><br>⚡ <b>Cam kết: Không cứu được → Không thu phí!</b><br>🔒 Bảo mật dữ liệu tuyệt đối — không sao chép, không chia sẻ'},

  // Cài driver / driver không nhận thiết bị
  {k:['cài driver','driver không nhận','driver lỗi','driver âm thanh','driver màn hình','driver mạng','device unknown','thiết bị không nhận','cài lại driver'],
   a:'⚙️ <b>Cài driver & xử lý thiết bị không nhận:</b><br><br><b>Hỗ trợ từ xa MIỄN PHÍ:</b><br>• Driver âm thanh (no sound)<br>• Driver mạng / Wifi<br>• Driver màn hình / card đồ họa<br>• Máy in, máy quét, webcam<br><br><b>Cách kết nối hỗ trợ từ xa:</b><br>1️⃣ Tải UltraViewer: ultraviewer.net<br>2️⃣ Gửi ID + Password qua Zalo: <a href="https://zalo.me/0963284044" style="color:#2563eb;">0963.284.044</a><br>3️⃣ Kỹ thuật viên kết nối và cài trong 5–15 phút<br><br><i>Tất cả miễn phí, không cần mang máy!</i>'},

  // Màn hình xanh chết chóc BSOD
  {k:['màn hình xanh','blue screen','bsod','critical process died','system service exception','màn hình xanh lỗi','windows lỗi xanh','ntoskrnl'],
   a:'🔵 <b>Xử lý màn hình xanh (BSOD):</b><br><br><b>Tự kiểm tra trước:</b><br>• Ghi lại mã lỗi (VD: CRITICAL_PROCESS_DIED)<br>• Thử Safe Mode (F8 khi khởi động)<br>• Cập nhật Windows & driver<br><br><b>Nguyên nhân phổ biến:</b><br>• RAM lỏng / lỗi → Test bằng MemTest86<br>• Driver xung đột (đặc biệt driver đồ họa)<br>• Ổ cứng bad sector<br>• Windows bị hỏng hệ thống<br><br><b>Mang vào tiệm chẩn đoán miễn phí!</b><br>Sửa từ: <b>0đ</b> (cài lại driver/Windows) đến <b>500K+</b> (thay RAM/SSD)'},

  // Mua laptop tư vấn chi tiết theo nhu cầu
  {k:['tư vấn mua laptop','nên mua laptop nào','laptop sinh viên','laptop văn phòng','laptop đồ họa','laptop lập trình','laptop gaming','mua laptop nào tốt','laptop tầm giá'],
   a:'💻 <b>Tư vấn mua laptop theo nhu cầu:</b><br><br>🎓 <b>Sinh viên / Văn phòng (5–12 triệu):</b><br>• Asus VivoBook 15 (i5-1235U, 8GB, 512GB): ~10tr<br>• Dell Inspiron 15 (i5, 8GB): ~11tr<br>• HP 15s (i5 Gen 12, SSD 512GB): ~10.5tr<br><br>🎨 <b>Đồ họa / Video (15–25 triệu):</b><br>• ASUS ProArt Studiobook / ZenBook Pro: 20–28tr<br>• MacBook Pro M3 14": 42tr (hiệu năng cao nhất)<br><br>🎮 <b>Gaming (15–35 triệu):</b><br>• Asus ROG / TUF, Acer Nitro 5, Lenovo Legion<br>• RTX 4060 trở lên cho game AAA<br><br>📌 Nhắn nhu cầu + ngân sách cụ thể để mình tư vấn máy phù hợp nhất!',
   qr:['Sinh viên ~10tr','Đồ họa ~20tr','Gaming ~20tr','MacBook Air M3']},

  // So sánh sửa máy cũ vs mua máy mới
  {k:['có nên sửa không','sửa hay mua mới','đáng sửa không','bỏ tiền sửa hay mua','máy cũ có nên sửa'],
   a:'⚖️ <b>Khi nào nên sửa, khi nào nên mua mới?</b><br><br><b>✅ Nên SỬA khi:</b><br>• Chi phí sửa < 30–40% giá máy mới tương đương<br>• Máy dưới 4 tuổi, cấu hình vẫn đủ dùng<br>• Lỗi đơn giản: pin, màn hình, bàn phím<br>• Còn dữ liệu quan trọng chưa backup<br><br><b>❌ Nên MUA MỚI khi:</b><br>• Máy trên 6–7 tuổi, CPU/RAM lỗi thời<br>• Mainboard hỏng + chi phí > 50% máy mới<br>• Máy đã sửa nhiều lần, hay hỏng vặt<br><br>📞 Mang máy vào — chẩn đoán miễn phí, báo giá thật — bạn quyết định!'},

  // Dịch vụ lắp ráp PC theo yêu cầu
  {k:['lắp pc','ráp máy tính','build pc','cấu hình pc','lắp ráp pc','tư vấn build','pc theo yêu cầu','cấu hình theo nhu cầu'],
   a:'🖥️ <b>Lắp ráp PC theo yêu cầu tại Tran Hoa Computer:</b><br><br><b>Gói phổ biến:</b><br>💼 <b>PC Văn phòng</b> (7–10 triệu): i3-12100 / Ryzen 3, 8GB RAM, SSD 256GB<br>🎮 <b>PC Gaming</b> (12–25 triệu): i5-13400F / Ryzen 5 7600X, RTX 4060/4070, 16GB DDR5<br>🎨 <b>PC Đồ họa</b> (18–40 triệu): i7/Ryzen 7, RTX 4070 Ti, 32GB RAM, NVMe 1TB<br><br><b>Quy trình:</b><br>1️⃣ Nêu nhu cầu + ngân sách<br>2️⃣ Nhận báo giá chi tiết từng linh kiện<br>3️⃣ Lắp ráp, chạy test 24h, bàn giao<br><br>✅ Bảo hành linh kiện 12 tháng • Tư vấn miễn phí',
   qr:['PC Văn phòng 8tr','PC Gaming 15tr','PC Đồ họa 25tr']}


];

/* ── QUICK REPLY ACTIONS ── */
var QRA={
  'Giá dịch vụ':       function(){uS('Giá dịch vụ?');rp('giá');},
  'Giá sửa laptop':    function(){uS('Giá sửa laptop?');rp('laptop');},
  'Giá cài Windows':   function(){uS('Giá cài Windows?');rp('win');},
  'Giá cứu dữ liệu':  function(){uS('Giá cứu dữ liệu?');rp('dữ liệu');},
  'Giá nâng cấp SSD':  function(){uS('Giá nâng cấp SSD?');rp('ssd');},
  'Giá nâng cấp RAM':  function(){uS('Giá nâng cấp RAM?');rp('ram');},
  'Giá thay pin':      function(){uS('Giá thay pin?');rp('pin');},
  'Đặt lịch sửa':     function(){uS('Đặt lịch sửa máy');rp('đặt lịch');},
  'Đặt lịch':         function(){uS('Đặt lịch');rp('đặt lịch');},
  'Liên hệ ngay':     function(){uS('Liên hệ cửa hàng?');rp('hotline');},
  'Liên hệ':          function(){uS('Liên hệ?');rp('hotline');},
  'Hotline gọi ngay': function(){uS('Hotline là gì?');rp('hotline');},
  'Gặp kỹ thuật viên': function(){uS('Gặp kỹ thuật viên');rp('gap ky thuat vien');},
  'Báo giá sửa chữa':  function(){uS('Báo giá sửa chữa?');rp('giá hết bao nhiêu');},
  'Cài Win/phần mềm':  function(){uS('Cài Win/phần mềm?');rp('cài win');},
  'Zalo tư vấn':      function(){uS('Nhắn Zalo?');rp('zalo');},
  'Hỗ trợ từ xa':     function(){uS('Hỗ trợ từ xa?');rp('từ xa');},
  'Bảo hành':         function(){uS('Bảo hành?');rp('bảo hành');},
  'Laptop văn phòng':    function(){uS('Laptop văn phòng?');rp('laptop văn phòng');},
  'Laptop gaming':       function(){uS('Laptop gaming?');rp('laptop gaming');},
  'MacBook Air':         function(){uS('Giá MacBook Air?');rp('macbook air');},
  'MacBook Pro':         function(){uS('Giá MacBook Pro?');rp('macbook pro');},
  'iPad Air':            function(){uS('Giá iPad Air?');rp('ipad');},
  'iPad Pro':            function(){uS('Giá iPad Pro?');rp('ipad');},

  'Chuột':              function(){uS('Giá chuột?');rp('chuột');},
  'Bàn phím':           function(){uS('Giá bàn phím?');rp('bàn phím');},
  'Màn hình':           function(){uS('Giá màn hình?');rp('màn hình');},
  'Máy in':             function(){uS('Giá máy in?');rp('máy in');},
  'Tai nghe':           function(){uS('Giá tai nghe?');rp('tai nghe');},
  'Phụ kiện':           function(){uS('Giá phụ kiện?');rp('phụ kiện');},

  'Ráp PC Gaming':    function(){uS('Ráp PC Gaming');rp('gaming');},
  'Tư vấn cấu hình':  function(){uS('Tư vấn cấu hình');rp('gaming');},
  'Địa chỉ':          function(){uS('Địa chỉ cửa hàng?');rp('địa chỉ');},
  'Địa chỉ cửa hàng': function(){uS('Địa chỉ?');rp('địa chỉ');},
  'Giờ làm việc':     function(){uS('Giờ mở cửa?');rp('giờ mở cửa');},
  'Dịch vụ của shop': function(){uS('Shop có dịch vụ gì?');rp('dịch vụ');},
  'Kiểm tra miễn phí':function(){uS('Kiểm tra miễn phí?');rp('miễn phí');},
  'Thanh toán':        function(){uS('Hình thức thanh toán?');rp('thanh toán');},
  'Ưu đãi hiện tại':  function(){uS('Có ưu đãi gì không?');rp('khuyến mãi');},
  'Tư vấn mua laptop': function(){uS('Tư vấn mua laptop');rp('mua laptop');},
  'Cứu dữ liệu':      function(){uS('Cứu dữ liệu?');rp('dữ liệu');},
  'Giá thay màn hình': function(){uS('Giá thay màn hình laptop?');rp('màn hình');},
  'Sửa khẩn cấp':     function(){uS('Cần sửa gấp');rp('khẩn');},
  'Giá mainboard':    function(){uS('Sửa mainboard bao nhiêu?');rp('mainboard');},

  'Giá sửa phần cứng':  function(){uS('Giá sửa phần cứng?');rp('giá sửa phần cứng');},
  'Giá cài phần mềm':   function(){uS('Giá cài phần mềm?');rp('giá cài phần mềm');},
  'Lắp đặt PC':         function(){uS('Giá lắp đặt PC?');rp('giá lắp đặt pc');},
  'Ưu đãi hiện tại':   function(){uS('Có ưu đãi gì không?');rp('ưu đãi hiện tại');},
  'Vào nhóm Zalo':      function(){uS('Vào nhóm Zalo?');rp('vào nhóm zalo');},
  'Tư vấn cấu hình':    function(){uS('Tư vấn cấu hình PC');rp('giá lắp đặt pc');},
  'Máy không lên nguồn':function(){uS('Máy không lên nguồn');rp('máy không lên');},
  'Máy chạy chậm':      function(){uS('Máy chạy chậm');rp('máy chạy chậm');},
  'Màn hình lỗi':       function(){uS('Màn hình có vấn đề');rp('màn hình đen');},
  'Kiểm tra miễn phí':  function(){uS('Kiểm tra miễn phí?');rp('miễn phí');},

  'Laptop văn phòng':    function(){uS('Laptop văn phòng?');rp('laptop văn phòng');},
  'Laptop gaming':       function(){uS('Laptop gaming?');rp('laptop gaming');},
  'MacBook Air':         function(){uS('Giá MacBook Air?');rp('macbook air');},
  'MacBook Pro':         function(){uS('Giá MacBook Pro?');rp('macbook pro');},
  'iPad Air':            function(){uS('Giá iPad Air?');rp('ipad');},
  'iPad Pro':            function(){uS('Giá iPad Pro?');rp('ipad');},

  'Laptop/iPad/MacBook': function(){uS('Laptop/iPad/MacBook');rp('laptop ipad macbook');},
  'MacBook':             function(){uS('Giá MacBook?');rp('macbook');},
  'iPad':                function(){uS('Giá iPad?');rp('ipad');},
  'Laptop gaming':       function(){uS('Laptop gaming?');rp('laptop gaming');},
  'Laptop văn phòng':    function(){uS('Laptop văn phòng?');rp('laptop văn phòng');},

  'Chuột':              function(){uS('Giá chuột?');rp('chuột');},
  'Bàn phím':           function(){uS('Giá bàn phím?');rp('bàn phím');},
  'Màn hình':           function(){uS('Giá màn hình?');rp('màn hình');},
  'Máy in':             function(){uS('Giá máy in?');rp('máy in');},
  'Tai nghe':           function(){uS('Giá tai nghe?');rp('tai nghe');},
  'Phụ kiện':           function(){uS('Giá phụ kiện?');rp('phụ kiện');},

  'Ráp PC Gaming':      function(){uS('Ráp PC Gaming?');rp('ráp pc gaming');},
  'Lắp đặt PC văn phòng':function(){uS('Lắp PC văn phòng?');rp('pc văn phòng');},
  'Tư vấn ngân sách':   function(){_cbCtx.budgetExpected=true;uS('Tư vấn theo ngân sách');ty_then('💬 Cho mình biết ngân sách của bạn (ví dụ: <b>10 triệu</b>, <b>15tr</b>, <b>25 triệu</b>...).<br>Mình tư vấn cấu hình tối ưu ngay!', []);},
  'Màn hình lỗi':       function(){uS('Màn hình có vấn đề');rp('màn hình đen');},
  'Bảo hành':           function(){uS('Chính sách bảo hành?');rp('bảo hành');},
  'Địa chỉ':            function(){uS('Địa chỉ cửa hàng?');rp('địa chỉ');},

  'Cứu dữ liệu':      function(){uS('Cứu dữ liệu?');rp('dữ liệu')},
  'Lỗi loa/tiếng':    function(){uS('Loa laptop không có tiếng');rp('loa');},
  'Lỗi webcam':       function(){uS('Webcam không hoạt động');rp('webcam');},
  'Máy bị đổ nước':   function(){uS('Đổ nước vào máy tính');rp('đổ nước');},
  'Lỗi touchpad':     function(){uS('Touchpad không hoạt động');rp('touchpad');},
  'Lỗi bluetooth':    function(){uS('Bluetooth không kết nối');rp('bluetooth');},
  'USB không nhận':   function(){uS('Cổng USB không nhận thiết bị');rp('usb');},
  'Thay bản lề':      function(){uS('Sửa bản lề laptop');rp('bản lề');},
  'Thay quạt':        function(){uS('Quạt máy tính hỏng');rp('quạt hỏng');},
  'Sửa mainboard':    function(){uS('Sửa mainboard laptop');rp('mainboard');},
  'Ưu đãi hiện tại':  function(){uS('Có ưu đãi khuyến mãi gì?');rp('ưu đãi');},
  'Tư vấn mua laptop':function(){uS('Tư vấn chọn mua laptop mới');rp('tư vấn mua laptop');},
  'Thời gian sửa':    function(){uS('Sửa mất bao lâu?');rp('bao lâu');},
  'Dịch vụ của shop': function(){uS('Shop có dịch vụ gì?');rp('dịch vụ');},

  'PC cơ bản (~8tr)': function(){uS('PC cơ bản (~8tr)');rp('pc cơ bản');},
  'PC văn phòng (~15tr)': function(){uS('PC văn phòng (~15tr)');rp('pc văn phòng');},
  'PC Gaming (~25–45tr)': function(){uS('PC Gaming (~25–45tr)');rp('pc gaming');},
  'PC đồ họa (~35–60tr)': function(){uS('PC đồ họa (~35–60tr)');rp('pc đồ họa');},
  'Đặt lịch lắp đặt': function(){uS('Đặt lịch lắp đặt');rp('đặt lịch');},
  'Liên hệ tư vấn': function(){uS('Liên hệ tư vấn');rp('tư vấn trực tiếp');},

  /* Extended actions */
  'Giá thay màn hình':     function(){uS('Giá thay màn hình laptop?');rp('giá thay màn hình laptop');},
  'Giá thay màn laptop':   function(){uS('Giá thay màn hình laptop?');rp('giá thay màn hình laptop');},
  'Giá pin laptop':        function(){uS('Giá thay pin laptop?');rp('giá thay pin laptop');},
  'Giá nâng cấp SSD':      function(){uS('Giá nâng cấp SSD?');rp('giá nâng cấp ssd');},
  'Giá nâng cấp RAM':      function(){uS('Giá nâng cấp RAM?');rp('giá nâng cấp ram');},
  'Giá cứu dữ liệu':       function(){uS('Giá cứu dữ liệu?');rp('giá cứu dữ liệu');},
  'Cài lại Windows':       function(){uS('Cài lại Windows?');rp('cài windows');},
  'Máy bị virus':          function(){uS('Máy bị virus?');rp('bị virus');},
  'Nên sửa hay mua mới':   function(){uS('Nên sửa hay mua mới?');rp('nên sửa hay mua mới');},
  'Tư vấn laptop mua mới': function(){uS('Tư vấn laptop mua mới?');rp('mua laptop');},
  'Xem bảng giá chi tiết': function(){uS('Xem bảng giá chi tiết?');rp('giá sửa phần cứng');},
  'Chat Zalo':             function(){uS('Nhắn Zalo?');rp('zalo');},
};

var offT=[
  '😄 Câu hỏi này ngoài chuyên môn máy tính của mình rồi 😅<br>Nhưng về <b>máy tính & công nghệ</b> thì mình biết hết! Bạn có thắc mắc gì về thiết bị không?',
  '🤖 Ồ, mình chỉ giỏi về máy tính thôi, không phải mọi thứ 😄<br>Có vấn đề gì với laptop hay PC không? Mình sẵn sàng hỗ trợ!',
  '🤔 Haha, câu này hơi ngoài vùng phủ sóng của mình! Mình chuyên về <b>sửa chữa & tư vấn máy tính</b>.<br>Bạn cần hỗ trợ gì về thiết bị không?',
];
var offIdx=0;

function uS(t){addMsg(t,'user',[]);}
function bS(t,q){addMsg(t,'bot',q||[]);}

function addMsg(t,role,qrs){
  var w=document.createElement('div');
  w.className='cb-m '+(role==='user'?'user':'bot');
  var b=document.createElement('div');
  b.className='bub'; b.innerHTML=t;
  w.appendChild(b);
  // feedback buttons for bot messages (below bubble)
  if (role === 'bot') {
    var fbRow = document.createElement('div');
    fbRow.className = 'cb-fb';
    fbRow.innerHTML = '<span class="cb-fb-label">Hữu ích không?</span>'
      + '<button class="cb-fb-btn" onclick="cbFeedback(this,1)" title="Có, hữu ích">👍</button>'
      + '<button class="cb-fb-btn" onclick="cbFeedback(this,0)" title="Chưa hữu ích">👎</button>';
    w.appendChild(fbRow);
  }
  msgs.appendChild(w);
  msgs.scrollTop=msgs.scrollHeight;
  setQR(qrs);
  /* save to session history */
  _chatHistory.push({role:(role==='user'?'user':'bot'), html:t});
  _saveChatHistory();
}

function setQR(list){
  qrDiv.innerHTML='';
  (list||[]).slice(0,8).forEach(function(lbl){
    var btn=document.createElement('button');
    btn.className='cb-qb'; btn.textContent=lbl;
    btn.onclick=function(){if(QRA[lbl])QRA[lbl]();};
    qrDiv.appendChild(btn);
  });
}

function _cbSetBusy(busy){
  botIsTyping=busy;
  var inp=document.getElementById('cbInput');
  var sendBtn=document.getElementById('cbSend');
  if(inp) inp.disabled=busy;
  if(sendBtn) sendBtn.disabled=busy;
  qrDiv.querySelectorAll('.cb-qb').forEach(function(b){b.disabled=busy;});
}

function ty_then(a,q){
  _cbSetBusy(true);
  var tw=document.createElement('div');
  tw.className='cb-m bot typing-indicator';
  tw.innerHTML='<div class="bub"><div class="cb-ty"><span>.</span><span>.</span><span>.</span></div></div>';
  msgs.appendChild(tw); msgs.scrollTop=msgs.scrollHeight; setQR([]);
  setTimeout(function(){
    if(tw.parentNode) tw.parentNode.removeChild(tw);
    bS(a,q);
    _cbSetBusy(false);
  },800);
}


/* ═══════════════════════════════════════════════════════════
   SMART CHATBOT ENGINE v5
   - Scored multi-keyword matching
   - Budget/number detection → PC config recommender
   - Conversational context memory
   - FAQ-aware responses from all page content
═══════════════════════════════════════════════════════════ */

/* ── CONTEXT STATE ── */
var _cbCtx = { budgetExpected: false, lastTopic: null };

/* ── BUDGET PARSER ── */
function _parseBudget(txt) {
  /* handle "10 triệu", "10tr", "10m", "15.5 triệu", "~20tr", "khoảng 25" */
  var clean = txt.replace(/[~≈khoảng]/gi,'').trim();
  var m = clean.match(/(\d+(?:[.,]\d+)?)\s*(triệu|tr\b|m\b)/i);
  if (m) {
    return parseFloat(m[1].replace(',','.')) * 1e6;
  }
  /* bare number like "10" or "15" likely means triệu in PC context */
  if (_cbCtx.budgetExpected) {
    var m2 = clean.match(/^(\d+(?:[.,]\d+)?)$/);
    if (m2) {
      var n = parseFloat(m2[1].replace(',','.'));
      if (n >= 3 && n <= 200) return n * 1e6;
    }
  }
  /* explicit large number */
  var m3 = clean.match(/(\d{7,})/);
  if (m3) return parseInt(m3[1]);
  return 0;
}

/* ── BUDGET RECOMMENDER ── */
function _budgetRecommend(budget) {
  _cbCtx.budgetExpected = false;
  var tr = Math.round(budget / 1e6);
  var ans, q;
  if (tr < 5) {
    ans = '💡 Ngân sách <b>' + tr + ' triệu</b> hơi hạn chế cho PC mới.<br>Mình có thể tư vấn:<br>• PC tân trang linh kiện cũ chất lượng (3–4 triệu)<br>• Nâng cấp máy cũ đang có: thêm SSD, RAM (~300K–600K)<br>Bạn muốn tư vấn hướng nào?';
    q = ['Nâng cấp SSD','Nâng cấp RAM','Liên hệ tư vấn'];
  } else if (tr <= 8) {
    ans = '🏢 Ngân sách <b>~' + tr + ' triệu</b> — Phù hợp <b>PC Văn phòng cơ bản</b>:<br><br>• <b>Cấu hình gợi ý:</b> Intel i3-12100F / 8GB RAM / SSD 256GB<br>• Chạy tốt: Word, Excel, web, Zoom, YouTube<br>• Ước tính: <b>~6–7 triệu</b> (bao gồm lắp, cài Win + phần mềm)<br><br><i>Liên hệ để được báo giá chính xác nhé!</i>';
    q = ['Đặt lịch sửa','Hotline gọi ngay','Lắp đặt PC'];
  } else if (tr <= 12) {
    ans = '🏢 Ngân sách <b>~' + tr + ' triệu</b> — Phù hợp <b>PC Văn phòng trung bình</b>:<br><br>• <b>Cấu hình gợi ý:</b> Intel i5-12400 / 16GB RAM / SSD 512GB<br>• Chạy mượt: đa nhiệm, kế toán, thiết kế nhẹ<br>• Ước tính: <b>~9–11 triệu</b><br><br><i>Ghé trực tiếp hoặc nhắn Zalo để báo giá chi tiết!</i>';
    q = ['Đặt lịch sửa','Zalo tư vấn','Lắp đặt PC'];
  } else if (tr <= 15) {
    ans = '🏢 Ngân sách <b>~' + tr + ' triệu</b> — Phù hợp <b>PC Văn phòng cao cấp</b> hoặc <b>Gaming nhập môn</b>:<br><br>🖥️ <b>Văn phòng cao cấp:</b> i5-13400 / 16GB / 1TB NVMe → ~13 triệu<br>🎮 <b>Gaming nhập môn:</b> Ryzen 5 5600 + GTX 1650 → ~15 triệu<br><br>Bạn dùng để làm việc hay chơi game?';
    q = ['Ráp PC Gaming','Lắp đặt PC văn phòng','Zalo tư vấn'];
  } else if (tr <= 22) {
    ans = '🎮 Ngân sách <b>~' + tr + ' triệu</b> — Lý tưởng cho <b>PC Gaming tầm trung</b>:<br><br>• <b>Cấu hình gợi ý:</b> AMD Ryzen 5 7600 + RTX 4060<br>• RAM 16GB DDR5 / SSD NVMe 512GB<br>• Chơi tốt: Valorant, GTA V, Elden Ring, Cyberpunk (medium–high)<br>• Ước tính: <b>~20–22 triệu</b><br><br><i>Linh kiện chính hãng 100%, ráp & test trước khi giao!</i>';
    q = ['Đặt lịch sửa','Zalo tư vấn','Ưu đãi hiện tại'];
  } else if (tr <= 35) {
    ans = '🎮 Ngân sách <b>~' + tr + ' triệu</b> — Xây <b>PC Gaming cao cấp</b>:<br><br>• <b>Cấu hình gợi ý:</b> Intel i7-13700F + RTX 4070<br>• RAM 32GB DDR5 / SSD NVMe 1TB<br>• Chơi cực mượt 1440p, stream game, render video<br>• Ước tính: <b>~28–32 triệu</b><br><br><i>Bảo hành linh kiện đầy đủ, lắp đặt chuyên nghiệp!</i>';
    q = ['Zalo tư vấn','Hotline gọi ngay','Đặt lịch sửa'];
  } else {
    ans = '🚀 Ngân sách <b>~' + tr + ' triệu</b> — Đủ cho <b>PC Workstation / Gaming đỉnh</b>:<br><br>• i9-13900K / Ryzen 9 7950X + RTX 4080/4090<br>• RAM 64GB / SSD NVMe 2TB<br>• Màn hình 165Hz+ 1440p hoặc 4K<br><br>Mình cần tư vấn chi tiết để tối ưu cấu hình trong tầm giá nhé! Liên hệ ngay:';
    q = ['Hotline gọi ngay','Zalo tư vấn','Đặt lịch sửa'];
  }
  ty_then(ans, q);
}


/* ── VIETNAMESE NORMALIZE (remove diacritics, lowercase) ── */
function normalizeStr(s) {
  if (!s) return '';
  var map = {
    'à':'a','á':'a','ạ':'a','ả':'a','ã':'a','â':'a','ầ':'a','ấ':'a','ậ':'a','ẩ':'a','ẫ':'a',
    'ă':'a','ằ':'a','ắ':'a','ặ':'a','ẳ':'a','ẵ':'a','À':'a','Á':'a','Ạ':'a','Ả':'a','Ã':'a',
    'Â':'a','Ầ':'a','Ấ':'a','Ậ':'a','Ẩ':'a','Ẫ':'a','Ă':'a','Ằ':'a','Ắ':'a','Ặ':'a','Ẳ':'a','Ẵ':'a',
    'è':'e','é':'e','ẹ':'e','ẻ':'e','ẽ':'e','ê':'e','ề':'e','ế':'e','ệ':'e','ể':'e','ễ':'e',
    'È':'e','É':'e','Ẹ':'e','Ẻ':'e','Ẽ':'e','Ê':'e','Ề':'e','Ế':'e','Ệ':'e','Ể':'e','Ễ':'e',
    'ì':'i','í':'i','ị':'i','ỉ':'i','ĩ':'i','Ì':'i','Í':'i','Ị':'i','Ỉ':'i','Ĩ':'i',
    'ò':'o','ó':'o','ọ':'o','ỏ':'o','õ':'o','ô':'o','ồ':'o','ố':'o','ộ':'o','ổ':'o','ỗ':'o',
    'ơ':'o','ờ':'o','ớ':'o','ợ':'o','ở':'o','ỡ':'o',
    'Ò':'o','Ó':'o','Ọ':'o','Ỏ':'o','Õ':'o','Ô':'o','Ồ':'o','Ố':'o','Ộ':'o','Ổ':'o','Ỗ':'o',
    'Ơ':'o','Ờ':'o','Ớ':'o','Ợ':'o','Ở':'o','Ỡ':'o',
    'ù':'u','ú':'u','ụ':'u','ủ':'u','ũ':'u','ư':'u','ừ':'u','ứ':'u','ự':'u','ử':'u','ữ':'u',
    'Ù':'u','Ú':'u','Ụ':'u','Ủ':'u','Ũ':'u','Ư':'u','Ừ':'u','Ứ':'u','Ự':'u','Ử':'u','Ữ':'u',
    'ỳ':'y','ý':'y','ỵ':'y','ỷ':'y','ỹ':'y','Ỳ':'y','Ý':'y','Ỵ':'y','Ỷ':'y','Ỹ':'y',
    'đ':'d','Đ':'d'
  };
  return s.toLowerCase().split('').map(function(c){ return map[c]||c; }).join('').trim();
}

/* ── SCORING ENGINE ── */
function rp(txt) {
  if (botIsTyping) return; /* drop input while bot is responding */
  var low = normalizeStr(txt);
  if (!low) return;

  /* 1. Budget check — explicit number or context-aware */
  var budget = _parseBudget(low);
  if (budget > 0 && (_cbCtx.budgetExpected || /\d/.test(low))) {
    return _budgetRecommend(budget);
  }

  /* 2. Scored keyword matching */
  var best = null, bestScore = 0;
  for (var i = 0; i < KB.length; i++) {
    var score = 0;
    var keys = KB[i].k;
    for (var j = 0; j < keys.length; j++) {
      if (low.indexOf(normalizeStr(keys[j])) > -1) {
        score += keys[j].length >= 6 ? 4 : keys[j].length >= 4 ? 2 : 1;
      }
    }
    if (score > bestScore) { bestScore = score; best = KB[i]; }
  }
  if (best && bestScore > 0) {
    /* Set budget context if bot is about to ask for budget */
    if (best.a && (best.a.indexOf('ngân sách') > -1 || best.a.indexOf('budget') > -1)) {
      _cbCtx.budgetExpected = true;
    } else {
      _cbCtx.budgetExpected = false;
    }
    ty_then(best.a, best.q);
    return;
  }

  /* 3. Tech-word fallback */
  var tech = ['máy','cpu','gpu','ram','ssd','hdd','cài','lỗi','sửa','win','driver','lắp','ráp','build','cấu hình',
              'bios','usb','vga','card','chip','main','modem','game','lag','fps',
              'file','disk','boot','crash','screen','display','laptop','pc ',
              'màn','pin','bàn phím','cổng','wifi','mạng','lan','bluetooth',
              'nguồn','ổ cứng','tốc độ','nhiệt','quạt',
              'loa','âm thanh','tiếng','webcam','camera','touchpad','trackpad',
              'bản lề','vỏ máy','cổng sạc','type-c','hdmi','vân tay','fingerprint',
              'micro','sạc','adapter','ổ đĩa','dvd','nước','ướt','ngấm',
              'mainboard','ic','hàn','rom','bios','post','không khởi','không bật'];
  var isTech = tech.some(function(w){ return low.indexOf(w) > -1; });
  if (isTech) {
    ty_then('🤔 Câu hỏi này mình chưa có câu trả lời chi tiết.<br>Nhưng kỹ thuật viên sẽ giải đáp ngay!<br>👇 Liên hệ trực tiếp nhé:',
      ['Hotline gọi ngay','Zalo tư vấn','Đặt lịch sửa','Gặp kỹ thuật viên']);
    return;
  }

  /* 4. Off-topic */
  _cbCtx.budgetExpected = false;
  ty_then(offT[offIdx % offT.length], ['Giá dịch vụ','Đặt lịch sửa','Dịch vụ của shop']);
  offIdx++;
}



window.cbSend=function(){
  if(botIsTyping) return;
  var inp=document.getElementById('cbInput');
  var t=(inp.value||'').trim();
  if(!t) return;
  inp.value='';
  uS(t); rp(t);
};

window.cbToggle=function(){
  _open=!_open;
  var panel=document.getElementById('chatbotPanel');
  var badge=document.querySelector('#chatbotToggle .cb-badge');
  panel.classList.toggle('cb-open',_open);
  if(badge) badge.style.display=_open?'none':'flex';
  if(_open && !_greeted){
    _greeted=true;
    var _prev2=_loadChatHistory();
    if(_prev2.length>0){_chatHistory=_prev2;var _cbM=document.getElementById('cbMsgs');_prev2.forEach(function(m){var w=document.createElement('div');w.className='cb-m '+m.role;w.innerHTML='<div class="bub">'+m.html+'</div>';if(_cbM)_cbM.appendChild(w);});if(_cbM)_cbM.scrollTop=_cbM.scrollHeight;return;}
    setTimeout(function(){
      var _h=new Date().getHours();
      var _greet=_h<12?'☀️ Chào buổi sáng!':_h<18?'🌤️ Chào buổi chiều!':'🌙 Chào buổi tối!';
      ty_then(_greet+' Mình là trợ lý AI của <b>Tran Hoa Computer</b>. Sẵn sàng hỗ trợ 24/7!<br><br>Bạn đang gặp vấn đề gì? Chọn nhanh bên dưới hoặc nhắn bất kỳ câu hỏi nào! 👇',
        ['Máy chạy chậm','Máy không lên nguồn','Màn hình lỗi','Cài Win/phần mềm','Báo giá sửa chữa','Gặp kỹ thuật viên','Lắp đặt PC','Tư vấn mua laptop']);
    },300);
  }
};

/* ── TYPEWRITER LABEL ── */
(function(){
  var el=document.getElementById('chatLabel');
  if(!el) return;
  var txt='Chat với trợ lý';
  var idx=0, phase='typing', hold=0;
  function tick(){
    if(_open){el.textContent='';setTimeout(tick,500);return;}
    if(phase==='typing'){
      el.textContent=txt.substring(0,idx+1);
      idx++;
      if(idx>=txt.length){phase='holding';hold=0;setTimeout(tick,100);}
      else setTimeout(tick,90);
    } else if(phase==='holding'){
      hold++;
      if(hold>=50) phase='erasing'; /* ~5s at 100ms */
      setTimeout(tick,100);
    } else if(phase==='erasing'){
      if(idx>0){el.textContent=txt.substring(0,idx-1);idx--; setTimeout(tick,40);}
      else {el.textContent='';phase='waiting';setTimeout(tick,2000);} /* 2s gap */
    } else { /* waiting */
      phase='typing';idx=0; setTimeout(tick,50);
    }
  }
  setTimeout(tick,1500);
})();

})();
/* ════════════════════════════════════════════════════════════ */



/* Zalo button ripple */
(function(){
  var btn=document.getElementById('zaloJoinBtn');
  if(!btn) return;
  btn.addEventListener('click',function(e){
    var r=document.createElement('span');
    r.className='zjb-ripple';
    var d=Math.max(btn.offsetWidth,btn.offsetHeight);
    r.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.offsetX-d/2)+'px;top:'+(e.offsetY-d/2)+'px;';
    btn.appendChild(r);
    setTimeout(function(){r.remove();},650);
  });
})();



/* scrollProgressBar handled by merged rAF scroll listener — no duplicate needed */

/* ════ STATS COUNTER ANIMATION ════ */


/* ════ COPY PHONE BUTTON ════ */
window.copyPhone=function(btn){
  navigator.clipboard.writeText('0963284044').then(function(){
    btn.textContent='✓ Đã chép!'; btn.classList.add('copied');
    setTimeout(function(){btn.textContent='📋 Sao chép'; btn.classList.remove('copied');},2000);
  }).catch(function(){
    var ta=document.createElement('textarea');
    ta.value='0963284044'; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    btn.textContent='✓ Đã chép!'; btn.classList.add('copied');
    setTimeout(function(){btn.textContent='📋 Sao chép'; btn.classList.remove('copied');},2000);
  });
};

/* ════ CHATBOT: BOT AVATAR IN MESSAGES ════ */
/* Override addMsg to add avatar for bot messages and timestamps */
(function(){
  var _origInit=false;
  function patchChatbot(){
    if(_origInit) return;
    var cbMsgs=document.getElementById('cbMsgs');
    if(!cbMsgs){setTimeout(patchChatbot,300);return;}
    _origInit=true;
    /* Patch ty_then to inject avatar after the typing animation */
    var _origRemoveChild=cbMsgs.removeChild.bind(cbMsgs);
    /* We use MutationObserver to add avatar/time to new bot bubbles */
    var obs=new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        m.addedNodes.forEach(function(node){
          if(node.nodeType===1 && node.classList.contains('cb-m') && node.classList.contains('bot') && !node.classList.contains('typing-indicator')){
            if(!node.querySelector('.cb-bot-av')){
              var bub=node.querySelector('.bub');
              if(bub && !node.querySelector('.cb-ty')){
                var av=document.createElement('div');
                av.className='cb-bot-av'; av.textContent='🤖';
                var wrap=document.createElement('div');
                wrap.className='bub-wrap';
                var now=new Date();
                var timeStr=(now.getHours()<10?'0':'')+now.getHours()+':'+(now.getMinutes()<10?'0':'')+now.getMinutes();
                var t=document.createElement('div');
                t.className='cb-time'; t.textContent=timeStr;
                wrap.appendChild(bub.cloneNode(true));
                wrap.appendChild(t);
                node.innerHTML='';
                node.appendChild(av);
                node.appendChild(wrap);
              }
            }
          }
          if(node.nodeType===1 && node.classList.contains('cb-m') && node.classList.contains('user')){
            if(!node.querySelector('.cb-time')){
              var bub=node.querySelector('.bub');
              if(bub){
                var now=new Date();
                var timeStr=(now.getHours()<10?'0':'')+now.getHours()+':'+(now.getMinutes()<10?'0':'')+now.getMinutes();
                var wrap=document.createElement('div');
                wrap.className='bub-wrap';
                wrap.appendChild(bub.cloneNode(true));
                var t=document.createElement('div');
                t.className='cb-time'; t.textContent=timeStr;
                wrap.appendChild(t);
                node.innerHTML='';
                node.appendChild(wrap);
                node.style.flexDirection='column';
                node.style.alignItems='flex-end';
              }
            }
          }
        });
      });
    });
    obs.observe(cbMsgs,{childList:true,subtree:false});
  }
  document.addEventListener('DOMContentLoaded',patchChatbot);
  setTimeout(patchChatbot,500);
})();

/* ── CHATBOT FEEDBACK ── */
function cbFeedback(btn, val) {
  var row = btn.parentNode;
  row.innerHTML = val
    ? '<span style="color:#16a34a;font-size:12px;">✓ Cảm ơn phản hồi của bạn! 😊</span>'
    : '<span style="color:#6d28d9;font-size:12px;">Mình sẽ cải thiện câu trả lời này. Bạn có muốn <a href="tel:0963284044" style="color:#2563eb;font-weight:700;">gọi trực tiếp</a> không?</span>';
}
