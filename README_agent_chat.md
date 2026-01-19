# AI Agent Chat - Hướng dẫn sử dụng

Trang chat AI Agent với tích hợp OpenAI Responses API, hỗ trợ streaming và function calling (tools).

## Tính năng

- ✅ Chat interface giống Messenger với streaming response
- ✅ OpenAI Responses API với streaming token-by-token
- ✅ Function calling (tools): `get_time`, `search_docs`
- ✅ Rate limiting và validation
- ✅ Responsive, mobile-first design

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

**Lưu ý**: Project đã có sẵn các dependencies cần thiết. Nếu cần cài thêm OpenAI SDK (tùy chọn), chạy:

```bash
npm install openai
```

Tuy nhiên, trong implementation hiện tại, chúng ta sử dụng native `fetch` API thay vì SDK để tối ưu cho Edge runtime.

### 2. Cấu hình environment variables

Tạo file `.env.local` từ template:

```bash
cp .env.local.example .env.local
```

Hoặc tạo thủ công file `.env.local` với nội dung:

```env
# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-api-key-here

# OpenAI Model (default: gpt-4o-mini)
# Compatible with Responses API (streaming support)
OPENAI_MODEL=gpt-4o-mini

# AI System Prompt
# Customize the agent's behavior and instructions
AI_SYSTEM_PROMPT=You are a helpful AI Agent. Answer concisely and step-by-step when needed. Do not fabricate information. When using tools, execute them and provide natural responses based on the results.
```

### 3. Chạy development server

```bash
npm run dev
```

Truy cập: http://localhost:3000/agent-chat

## Kiểm thử

### Test 1: Câu hỏi thông thường

Gửi tin nhắn: `Xin chào, bạn là ai?`

**Kỳ vọng**: Assistant trả lời với streaming từng token, giới thiệu về AI Agent.

### Test 2: Tool calling - get_time

Gửi tin nhắn: `Bây giờ là mấy giờ?`

**Kỳ vọng**: 
- Agent gọi tool `get_time`
- Server thực thi và trả thời gian ISO + formatted (Việt Nam)
- Agent tạo câu trả lời tự nhiên có chèn thời gian

### Test 3: Tool calling - search_docs

Gửi tin nhắn: `Tìm 3 gợi ý tài liệu học Next.js`

**Kỳ vọng**:
- Agent gọi tool `search_docs` với query "Next.js", limit 3
- Server trả danh sách mock results
- Agent tạo câu trả lời với danh sách tài liệu được format đẹp

## Cấu trúc code

```
src/
├── app/
│   ├── agent-chat/
│   │   └── page.tsx          # Chat page với streaming logic
│   └── api/
│       └── agent-chat/
│           └── route.ts       # API route với OpenAI streaming + tools
├── components/
│   ├── chat/
│   │   ├── ChatLayout.tsx     # Layout 2 cột (conversations + chat)
│   │   ├── MessageBubble.tsx  # Bubble tin nhắn (user/assistant)
│   │   ├── MessageInput.tsx   # Input với Enter/Ctrl+Enter gửi
│   │   └── TypingIndicator.tsx # 3 chấm nhấp nháy
│   └── ui/                     # shadcn/ui components
├── lib/
│   └── ai.ts                   # Helper OpenAI config, validation
└── types/
    └── chat.ts                  # Types: Message, MessageRole, ToolCall
```

## API Route Details

### Endpoint: `POST /api/agent-chat`

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Câu hỏi của bạn" }
  ]
}
```

**Response:**
- Stream text/plain với chunks được encode
- Format: Plain text chunks
- Headers: `Content-Type: text/plain; charset=utf-8`, `Cache-Control: no-cache`

**Flow với Tool Calling:**

1. Client gửi messages → API route
2. API gọi OpenAI với tools definition
3. Nếu model trả `tool_calls`:
   - Server thu thập tool call (id, name, arguments)
   - Thực thi tool (get_time/search_docs)
   - Gọi lại OpenAI API với tool result
   - Stream câu trả lời cuối cùng về client
4. Nếu không có tool call: stream text trực tiếp

## Security

- ✅ **API Key không bao giờ lộ ra client** - chỉ dùng ở server (API route)
- ✅ **Input validation**: Max length 4000 chars, strip control chars
- ✅ **Rate limiting**: In-memory (20 requests/minute/IP)
- ✅ **Basic prompt injection detection**: Log warnings cho suspicious patterns

## Tools

### `get_time`

Trả thời gian hiện tại (ISO + formatted Việt Nam).

**Parameters**: Không có

**Returns:**
```json
{
  "datetime": "2024-01-15T10:30:00.000Z",
  "formatted": "15 tháng 1, 2024, 17:30:00",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

### `search_docs`

Mock search documentation (trả kết quả mẫu).

**Parameters:**
- `query` (string, required): Search query
- `limit` (number, optional): Max results (default: 3)

**Returns:**
```json
{
  "query": "Next.js",
  "results": [
    {
      "title": "...",
      "url": "...",
      "snippet": "...",
      "relevance": 0.95
    }
  ],
  "total": 3
}
```

## Tài liệu tham khảo

- [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Streaming Responses in Next.js](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)

## Troubleshooting

### Lỗi: "OPENAI_API_KEY is not set"

→ Tạo file `.env.local` với `OPENAI_API_KEY=sk-...`

### Lỗi: "Rate limit exceeded"

→ Đợi 1 phút hoặc tăng `RATE_LIMIT_MAX` trong `route.ts`

### Streaming không hoạt động

→ Kiểm tra:
- Model có hỗ trợ streaming không (`gpt-4o-mini`, `gpt-4`, etc.)
- Browser console có lỗi không
- Network tab xem response có stream không

### Tool calling không hoạt động

→ Kiểm tra:
- Model có hỗ trợ function calling không
- Tool definition đúng format chưa
- Server logs có lỗi không

## Notes

- Tool calling với streaming phức tạp hơn: cần thu thập đầy đủ tool call trước khi thực thi, sau đó gọi lại API với tool result.
- Trong production, nên dùng database để lưu conversation history.
- Rate limiting hiện dùng in-memory - nên dùng Redis cho production.
- Error handling có thể cải thiện thêm với retry logic.

