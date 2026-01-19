# Hướng dẫn Test Nhanh - Mobile UI/UX Chat

## File đã thay đổi

### Commit 1: Layout container + scroll vùng chat + sticky input
- `src/app/agent-chat/page.tsx` - Layout container với padding responsive, spacer cho sticky input
- `src/components/chat/MessageInput.tsx` - Sticky bottom trên mobile với safe-area support

### Commit 2: MessageBubble responsive padding và max-width
- `src/components/chat/MessageBubble.tsx` - Max-width responsive, padding responsive, break-words
- `src/components/chat/MarkdownContent.tsx` - Fix overflow cho code blocks, images, links

### Commit 3: MessageInput sticky và safe-area
- `src/components/chat/MessageInput.tsx` - Sticky bottom, backdrop blur, safe-area padding

### Commit 4: QuickReplies slider ngang
- `src/components/chat/QuickReplies.tsx` - Horizontal scroll slider trên mobile, wrap trên desktop
- `src/app/globals.css` - Utility class `.no-scrollbar` để ẩn scrollbar

### Commit 5: Auto-scroll streaming
- `src/app/agent-chat/page.tsx` - Auto-scroll với near-bottom heuristic, throttling, scroll detection

### Commit 6: Fixes overflow và TypingIndicator
- `src/components/chat/TypingIndicator.tsx` - Responsive sizing
- `src/components/chat/MarkdownContent.tsx` - Break-all cho links

---

## Hướng dẫn Test Nhanh (Thiết bị 320–375px)

### 1. Test Layout Container & Padding
1. Mở trang `/agent-chat` trên mobile (DevTools: iPhone SE - 375px hoặc tự resize ≤640px)
2. **Kỳ vọng**:
   - Messages có padding trái/phải (`px-3`) - không dính sát mép
   - Không có thanh cuộn ngang
   - Desktop (≥640px): layout giữ nguyên như cũ

### 2. Test Message Bubble
1. Gửi tin nhắn dài (hoặc AI trả về text dài)
2. **Kỳ vọng**:
   - Bubbles không tràn mép; có padding hợp lý
   - Text tự động wrap, không overflow
   - Max-width: Mobile `85%`, Desktop `70%`
   - Padding: Mobile `px-3 py-2`, Desktop `px-4 py-2.5`

### 3. Test MessageInput Sticky
1. Scroll lên trên
2. Click vào textarea để focus
3. **Kỳ vọng**:
   - Input **sticky ở bottom**, không bị keyboard đẩy lên
   - Có backdrop blur (nền mờ)
   - Có safe-area padding (iOS notch/home indicator)
   - Desktop: input vẫn static như cũ

### 4. Test Quick Replies Slider
1. Ở màn hình welcome hoặc sau message
2. **Kỳ vọng**:
   - **Mobile**: Quick replies hiển thị **một hàng**, có thể **cuộn ngang**
   - Không wrap xuống dòng (không chiếm hết chiều cao)
   - Scrollbar ẩn nhưng vẫn scroll được
   - **Desktop**: wrap bình thường như cũ

### 5. Test Auto-Scroll Streaming
1. Gửi tin nhắn và đợi AI trả lời
2. **Kỳ vọng**:
   - Khi **đang ở gần cuối** (< 200px) → **tự động scroll mượt** theo stream
   - Khi **đang kéo lên** (không ở gần cuối) → **KHÔNG auto-scroll**
   - Khi kéo xuống gần cuối → tự động bật lại auto-scroll
   - Scroll mượt, không giật

### 6. Test Key Bindings (MessageInput)
1. Nhập tin nhắn
2. **Kỳ vọng**:
   - **Enter** → Gửi tin nhắn
   - **Shift+Enter** → Xuống dòng
   - **Ctrl/Cmd+Enter** → Gửi tin nhắn
   - Textarea tự resize (max `40vh` trên mobile, `120px` desktop)

### 7. Test Overflow Prevention
1. Gửi hoặc yêu cầu AI trả về:
   - URL dài: `https://very-long-url-example.com/very/long/path/here`
   - Code block dài
   - Image (nếu có)
2. **Kỳ vọng**:
   - URL **break-all**, không tràn ngang
   - Code blocks có `overflow-x-auto`, scroll ngang nếu cần
   - Images `max-w-full`, không tràn
   - Không có horizontal scroll bar cho toàn bộ page

### 8. Test TypingIndicator
1. Gửi tin nhắn và đợi response đầu tiên
2. **Kỳ vọng**:
   - Indicator hiển thị ngay lập tức
   - Size nhỏ, không đẩy layout
   - Mobile: avatar `8x8`, Desktop: `10x10`
   - Max-width: Mobile `85%`, Desktop `70%`

### 9. Test Safe Area (iOS)
1. Test trên iPhone thật (hoặc iOS Simulator)
2. **Kỳ vọng**:
   - Input có padding bottom đủ cho home indicator
   - Không bị che bởi notch/home indicator
   - Layout không nhảy khi keyboard mở/đóng

### 10. Test Responsive Breakpoints
1. Resize browser từ mobile → tablet → desktop
2. **Kỳ vọng**:
   - Mobile (≤640px): Sticky input, slider QuickReplies, padding `px-3`
   - Tablet (641–1023px): Vẫn mobile behavior
   - Desktop (≥1024px): **Layout giữ nguyên như cũ** (static input, wrap QuickReplies, padding `px-4`)

---

## Checklist Kiểm thử

### iPhone SE/6–8/12 mini (320–375px)
- [ ] Không có thanh cuộn ngang
- [ ] Bubbles không tràn mép; khoảng cách trái/phải hợp lý (`px-3`)
- [ ] Input sticky ở bottom
- [ ] Enter gửi; Shift+Enter xuống dòng
- [ ] Khi assistant stream → auto-scroll mượt (nếu ở gần cuối)
- [ ] Quick Replies hiển thị một hàng trượt ngang, không wrap
- [ ] Long URLs không tràn ngang (break-all)
- [ ] Code blocks có scroll ngang nếu cần
- [ ] Safe-area padding đúng (iOS)

### Android Chrome (320–412px)
- [ ] Hành vi tương tự iPhone
- [ ] Không giật layout khi keyboard mở/đóng

### PC/Desktop (≥1024px)
- [ ] **KHÔNG thay đổi** spacing và layout hiện có
- [ ] Input static (không sticky)
- [ ] Quick Replies wrap bình thường
- [ ] Padding `px-4` như cũ

---

## Lưu ý

- Tất cả thay đổi dùng **responsive Tailwind classes** (`sm:`, `md:`, `lg:`)
- Desktop layout **hoàn toàn giữ nguyên** (chỉ thay đổi trên mobile)
- Auto-scroll **thông minh**: chỉ scroll khi user ở gần bottom (< 200px)
- Quick Replies slider **ẩn scrollbar** nhưng vẫn scroll được
- Sticky input có **backdrop blur** và **safe-area support** cho iOS

---

## Troubleshooting

### Input không sticky?
→ Kiểm tra class `sticky bottom-0` và z-index `z-10` trong `MessageInput.tsx`

### Quick Replies vẫn wrap?
→ Kiểm tra class `flex-wrap` trên mobile đã được override bằng `sm:flex-wrap` chưa

### Auto-scroll không hoạt động?
→ Kiểm tra:
1. `shouldAutoScrollRef.current` có đúng true khi near bottom?
2. `messagesEndRef.current` có được set?
3. `scrollToBottom()` có được gọi trong streaming loop?

### Tràn viền ngang?
→ Kiểm tra:
1. Messages container có `max-w-full`?
2. Links/code có `break-all`?
3. Images có `max-w-full`?
4. Quick Replies wrapper có `-mx-3 px-3` để tránh tràn?

