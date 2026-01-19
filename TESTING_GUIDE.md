# Hướng dẫn Test Nhanh - Viettea Sales Webapp

## Cài đặt và khởi chạy

```bash
# Cài đặt dependencies (nếu chưa có)
npm install

# Chạy development server
npm run dev
```

Truy cập: http://localhost:3000/agent-chat

## Test nhanh các tính năng

### 1. Test Chat cơ bản
1. Mở trang `/agent-chat`
2. Gửi câu chào: "Xin chào, bạn là ai?"
3. **Kỳ vọng**: Assistant trả lời với streaming text

### 2. Test Quick Replies
1. Ở màn hình welcome hoặc sau tin nhắn, click một quick reply (ví dụ: "Chọn hương vị")
2. **Kỳ vọng**: Tin nhắn được gửi và assistant phản hồi

### 3. Test Message Input
1. Nhập tin nhắn trong textarea
2. Test các phím:
   - **Enter**: Gửi tin nhắn
   - **Shift+Enter**: Xuống dòng
   - **Ctrl/Cmd+Enter**: Gửi tin nhắn
3. **Kỳ vọng**: Hành vi đúng như mô tả

### 4. Test Dark Mode
1. Click nút Theme toggle (🌙/☀️) ở header
2. **Kỳ vọng**: Giao diện chuyển đổi giữa light/dark mode
3. Reload trang → theme được giữ nguyên

### 5. Test Settings Dialog
1. Click nút Settings (⚙️) ở header
2. **Kỳ vọng**: Dialog mở với các fields:
   - Tên hiển thị
   - Số điện thoại (optional)
   - Toggle "Ghi nhớ sở thích"
3. Nhập thông tin và click "Lưu"
4. **Kỳ vọng**: Toast "Đã lưu cài đặt" xuất hiện
5. Test "Xuất chat (JSON)" → **Kỳ vọng**: File JSON được tải về
6. Test "Xóa hội thoại" → **Kỳ vọng**: Confirm dialog, sau đó messages và cart bị xóa

### 6. Test Mini Cart

#### Cách 1: Thêm sản phẩm test qua Settings
1. Click nút Settings (⚙️) ở header
2. Scroll xuống, click button **"Thêm sản phẩm test (cho test)"**
3. **Kỳ vọng**: Toast "Đã thêm 3 sản phẩm test vào giỏ hàng"
4. Đóng Settings dialog
5. Kiểm tra Mini Cart ở right pane (desktop):
   - **Kỳ vọng**: Hiển thị 3 sản phẩm:
     - Trà xanh Thái Nguyên cao cấp (250.000đ, x1)
     - Trà hoa nhài Hà Nội (180.000đ, x2)
     - Trà đen Shan Tuyết (320.000đ, x1)
   - Tổng tiền: 980.000đ

#### Cách 2: Dùng DevTools Console (nếu muốn thủ công)
1. Mở DevTools (F12) → Console tab
2. Copy và paste đoạn code sau:
```javascript
// Lấy store từ window (nếu expose) hoặc dùng cách khác
// Hoặc dùng React DevTools để tìm component useChatStore
```
**Lưu ý**: Cách này phức tạp hơn, nên dùng Cách 1.

#### Test các actions trong Mini Cart
1. Với giỏ hàng đã có sản phẩm:
   - **Tăng số lượng**: Click nút **+** → **Kỳ vọng**: Số lượng tăng, tổng tiền cập nhật
   - **Giảm số lượng**: Click nút **-** → **Kỳ vọng**: Số lượng giảm, tổng tiền cập nhật
   - **Xóa sản phẩm**: Click nút **🗑️** → **Kỳ vọng**: Sản phẩm bị xóa khỏi cart
2. **Tạo đơn**:
   - Click button **"Tạo đơn"**
   - **Kỳ vọng**: 
     - POST `/api/agent/create-order` thành công
     - Toast "Đã tạo đơn hàng thành công!"
     - Nếu có `payment_url` → Mở tab mới + toast info "Bạn có thể kiểm tra thanh toán trong tab mới"
     - Cart được clear sau khi tạo đơn thành công

### 7. Test Product Card (nếu AI suggest)
- **Lưu ý**: Product card chỉ hiển thị nếu AI trả về message với `type: "product_card"` và `meta` chứa product info
- **Để test Product Card**:
  1. AI cần trả về message có cấu trúc đặc biệt (hiện tại chưa có trong system prompt mặc định)
  2. Hoặc bạn có thể test bằng cách thêm message thủ công trong DevTools Console (phức tạp)
  3. **Cách đơn giản hơn**: Dùng button "Thêm sản phẩm test" trong Settings để test Mini Cart
- **Kỳ vọng**: Card hiển thị ảnh, tên, giá, mô tả, nút "Thêm vào giỏ"
- Click "Thêm vào giỏ" → **Kỳ vọng**: Toast "Đã thêm vào giỏ", cart cập nhật

### 8. Test Order Summary (nếu AI suggest)
- **Lưu ý**: Order summary chỉ hiển thị nếu AI trả về message với `type: "order_summary"` và `meta` chứa items + total
- **Kỳ vọng**: Card hiển thị danh sách items, tổng tiền, nút "Tạo đơn"
- Click "Tạo đơn" → **Kỳ vọng**: Tương tự test Mini Cart

### 9. Test PWA
1. Mở DevTools → Application tab
2. Kiểm tra:
   - **Manifest**: `/manifest.webmanifest` được load
   - **Service Worker**: `/sw.js` được đăng ký
3. Test offline:
   - DevTools → Network → Throttling → Offline
   - Reload trang
   - **Kỳ vọng**: Hiển thị offline.html hoặc cached content

### 10. Test Responsive
1. Resize browser hoặc dùng DevTools device mode
2. **Mobile (≤640px)**:
   - Sidebar ẩn
   - Right pane ẩn
   - Header có nút menu (nếu có)
3. **Tablet/Desktop**:
   - Right pane hiển thị (nếu có items trong cart)
   - Layout full

### 11. Test Audio Toggle
1. Click nút toggle nhạc (dạng công tắc) ở navbar
2. **Kỳ vọng**: 
   - Nút chuyển đổi on/off
   - Nhạc phát/dừng
   - Icon đổi giữa Music/MusicOff
3. Reload trang → Nhạc giữ nguyên trạng thái (on/off)

### 12. Test Copy Message
1. Hover vào message của assistant (text type)
2. **Kỳ vọng**: Nút Copy (📋) xuất hiện ở góc trên bên phải
3. Click Copy → **Kỳ vọng**: Toast "Đã sao chép", icon đổi thành ✓

### 13. Test Auto-scroll
1. Scroll lên trên
2. Gửi tin nhắn hoặc nhận message mới
3. **Kỳ vọng**: Auto scroll xuống bottom

### 14. Test Typing Indicator
1. Gửi tin nhắn và đợi response
2. **Kỳ vọng**: Trong lúc stream bắt đầu, hiển thị typing indicator (3 chấm tròn)
3. Khi có content đầu tiên → indicator biến mất, message hiển thị

## Checklist hoàn chỉnh

- [ ] Chat streaming hoạt động
- [ ] Quick replies hoạt động
- [ ] Message input (Enter, Shift+Enter, Ctrl+Enter) hoạt động
- [ ] Theme toggle hoạt động + persist
- [ ] Settings dialog mở/đóng, lưu được thông tin
- [ ] Export chat (JSON) hoạt động
- [ ] Reset chat hoạt động
- [ ] Mini cart hiển thị đúng
- [ ] Thêm vào giỏ hoạt động
- [ ] Tạo đơn hoạt động
- [ ] Product card hiển thị đúng (nếu có)
- [ ] Order summary hiển thị đúng (nếu có)
- [ ] PWA manifest load được
- [ ] Service Worker đăng ký được
- [ ] Offline mode hoạt động
- [ ] Responsive (mobile/tablet/desktop) đúng
- [ ] Audio toggle hoạt động
- [ ] Copy message hoạt động
- [ ] Auto-scroll hoạt động
- [ ] Typing indicator hiển thị đúng

## Lưu ý

- **Product Card & Order Summary**: Hiện tại chỉ hiển thị nếu message có `type` và `meta` tương ứng. Để test đầy đủ, cần:
  1. Cập nhật AI system prompt để AI biết cách suggest products
  2. Hoặc test bằng cách thêm message thủ công với `type: "product_card"` và `meta` tương ứng

- **PWA Icons**: File `icon-192.png` và `icon-512.png` hiện tại là placeholder 1x1px. Cần thay thế bằng icon thật cho production.

- **API Key**: Đảm bảo có `.env.local` với `OPENAI_API_KEY` để chat hoạt động.

