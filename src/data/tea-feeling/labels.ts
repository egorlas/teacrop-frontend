import type { TeaFeelingAxisLabels } from "@/types/tea-feeling";

/** Display copy for matrix headers — can be replaced by CMS locale strings later. */
export const TEA_FEELING_LABELS: TeaFeelingAxisLabels = {
  y: {
    vui: "Vui",
    buon: "Buồn",
    mot_minh: "Một mình",
    ban_be: "Bạn bè",
    nhom_hop: "Nhóm họp",
    gia_dinh: "Gia đình",
  },
  x: {
    nong: "Nóng",
    lanh: "Lạnh",
    kho: "Khô",
    am: "Ẩm",
    mua: "Mưa",
    nang: "Nắng",
  },
};
