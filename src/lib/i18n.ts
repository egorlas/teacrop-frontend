// Simple i18n helper - ready for future expansion to English
const translations: Record<string, Record<string, string>> = {
  vi: {
    // Chat
    "chat.welcome": "Chào mừng đến với Tea Support",
    "chat.placeholder": "Nhập tin nhắn...",
    "chat.send": "Gửi",
    "chat.typing": "Đang nhập...",
    "chat.assistant.typing": "Assistant đang soạn tin...",
    
    // Cart
    "cart.title": "Giỏ hàng",
    "cart.empty": "Giỏ hàng trống",
    "cart.add": "Thêm vào giỏ",
    "cart.remove": "Xóa",
    "cart.total": "Tổng tiền",
    "cart.create_order": "Tạo đơn",
    "cart.item_added": "Đã thêm vào giỏ",
    
    // Products
    "product.add_to_cart": "Thêm vào giỏ",
    "product.price": "Giá",
    
    // Order
    "order.summary": "Tóm tắt đơn hàng",
    "order.create": "Tạo đơn",
    "order.items": "Sản phẩm",
    "order.total": "Tổng cộng",
    
    // Settings
    "settings.title": "Cài đặt",
    "settings.name": "Tên hiển thị",
    "settings.phone": "Số điện thoại",
    "settings.remember": "Ghi nhớ sở thích",
    "settings.reset_chat": "Xóa hội thoại",
    "settings.export_chat": "Xuất chat (JSON)",
    "settings.reset_confirm": "Bạn có chắc muốn xóa toàn bộ hội thoại?",
    
    // Common
    "common.copy": "Sao chép",
    "common.copied": "Đã sao chép",
    "common.close": "Đóng",
    "common.save": "Lưu",
    "common.cancel": "Hủy",
    "common.error": "Đã xảy ra lỗi",
  },
};

type Locale = "vi" | "en";

let currentLocale: Locale = "vi";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, fallback?: string): string {
  return translations[currentLocale]?.[key] || fallback || key;
}

// Helper to get all translations for a namespace
export function getTranslations(namespace: string): Record<string, string> {
  const prefix = `${namespace}.`;
  const result: Record<string, string> = {};
  const localeTranslations = translations[currentLocale] || {};
  
  for (const [key, value] of Object.entries(localeTranslations)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = value;
    }
  }
  
  return result;
}

