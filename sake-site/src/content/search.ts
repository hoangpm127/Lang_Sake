export type SearchItem = {
  id: string;
  title: string;
  unaccentedTitle: string;
  category: string;
  price?: string;
  image: string;
  url: string;
  keywords: string[];
};

export const SEARCH_INDEX: SearchItem[] = [
  {
    id: "combo-sinh-vien",
    title: "Combo Sinh Viên",
    unaccentedTitle: "combo sinh vien",
    category: "Ẩm thực",
    price: "99.000đ",
    image:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=300&q=80",
    url: "/#menu",
    keywords: ["ăn uống", "giá rẻ", "sinh viên", "combo", "an uong", "gia re"],
  },
  {
    id: "combo-cap-doi",
    title: "Combo Cặp Đôi",
    unaccentedTitle: "combo cap doi",
    category: "Ẩm thực",
    price: "666.000đ",
    image:
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?auto=format&fit=crop&w=300&q=80",
    url: "/#menu",
    keywords: ["lãng mạn", "couple", "hẹn hò", "cap doi", "romantic"],
  },
  {
    id: "combo-gia-dinh",
    title: "Combo Gia Đình",
    unaccentedTitle: "combo gia dinh",
    category: "Ẩm thực",
    price: "999.000đ",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80",
    url: "/#menu",
    keywords: ["gia đình", "group", "ban be", "family", "gia dinh"],
  },
  {
    id: "combo-quoc-te",
    title: "Khách Quốc Tế",
    unaccentedTitle: "khach quoc te",
    category: "Ẩm thực",
    price: "$22",
    image:
      "https://images.unsplash.com/photo-1514361892635-6d2514be2b4c?auto=format&fit=crop&w=300&q=80",
    url: "/#menu",
    keywords: ["international", "khach tay", "quoc te", "beer", "tourist"],
  },
  {
    id: "lau-ga-dong-tao",
    title: "Lẩu Gà Đông Tảo",
    unaccentedTitle: "lau ga dong tao",
    category: "Món ăn",
    price: "$22",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
    url: "/#menu",
    keywords: ["lau ga", "dong tao", "chicken hotpot", "lẩu nóng"],
  },
  {
    id: "set-nuong",
    title: "Set Nướng",
    unaccentedTitle: "set nuong",
    category: "Món ăn",
    price: "189.000đ",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
    url: "/#menu",
    keywords: ["nuong", "bbq", "set nuong", "thit nuong"],
  },
  {
    id: "sake-camping",
    title: "Sake Camping",
    unaccentedTitle: "sake camping",
    category: "Trải nghiệm",
    price: "169.000đ",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80",
    url: "/#sake-pass",
    keywords: ["leu trai", "camping", "glamping", "ban dem", "trai nghiem"],
  },
  {
    id: "cafe-tuy-tam",
    title: "Cafe Tùy Tâm",
    unaccentedTitle: "cafe tuy tam",
    category: "Trải nghiệm",
    price: "Tùy tâm",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80",
    url: "/#sake-pass",
    keywords: ["coffee", "tin tu te", "cafe", "tuy tam", "tra chanh"],
  },
  {
    id: "tarot",
    title: "Xem Bài Tarot",
    unaccentedTitle: "xem bai tarot",
    category: "Trải nghiệm",
    price: "Tùy tâm",
    image:
      "https://images.unsplash.com/photo-1500336624523-d727130c3328?auto=format&fit=crop&w=300&q=80",
    url: "/#dual-vibe",
    keywords: ["tarot", "chiem tinh", "healing", "xem bai"],
  },
  {
    id: "nhac-song-acoustic",
    title: "Nhạc Sống Acoustic",
    unaccentedTitle: "nhac song acoustic",
    category: "Trải nghiệm",
    price: "Miễn phí",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=300&q=80",
    url: "/#sake-pass",
    keywords: ["acoustic", "live band", "nhac song", "pho dem"],
  },
  {
    id: "dat-ban",
    title: "Đặt Bàn",
    unaccentedTitle: "dat ban",
    category: "Dịch vụ",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=300&q=80",
    url: "/#menu",
    keywords: ["booking", "dat ban", "menu", "zalo"],
  },
  {
    id: "lien-he",
    title: "Liên hệ",
    unaccentedTitle: "lien he",
    category: "Thông tin",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=300&q=80",
    url: "/#site-footer",
    keywords: ["contact", "lien he", "map", "dia chi"],
  },
  {
    id: "tram-khoi-nghiep",
    title: "Trạm Khởi Nghiệp",
    unaccentedTitle: "tram khoi nghiep",
    category: "Affiliate",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=300&q=80",
    url: "/affiliate",
    keywords: ["affiliate", "startup", "thu nhap", "doi tac", "khoi nghiep"],
  },
];


