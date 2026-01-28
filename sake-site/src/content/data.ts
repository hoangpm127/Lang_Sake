export type VibeMode = "day" | "night";

export const siteContent = {
  navigation: {
    brand: "Làng Sake",
    logoUrl: "/images/logo-sake.png",
    primaryLinks: [
      { label: "Về Làng Sake", href: "/#hero" },
      { label: "Trải Nghiệm", href: "/#dual-vibe" },
      { label: "Pass 6", href: "/#sake-pass" },
      { label: "Menu", href: "/#menu" },
      { label: "Doanh nghiệp & Sự kiện", href: "/#b2b" },
    ],
    overlayLinks: [
      { label: "Về Làng Sake", href: "/#hero" },
      { label: "Ngày & Đêm", href: "/#dual-vibe" },
      { label: "Câu chuyện", href: "/#story" },
      { label: "Collection", href: "/#collection" },
      { label: "Văn hóa", href: "/#culture" },
      { label: "Pass 6", href: "/#sake-pass" },
      { label: "Menu", href: "/#menu" },
      { label: "Sự kiện", href: "/#b2b" },
      { label: "Khoảnh khắc", href: "/#social-proof" },
    ],
    partnerLink: { label: "Tuyển dụng/Đối tác", href: "/affiliate" },
  },
  bookingCta: {
    label: "Đặt bàn ngay",
    navLabel: "ĐẶT BÀN",
    href: "https://zalo.me/your-zalo-oa",
  },
  hero: {
    day: {
      eyebrow: "",
      headline: "Làng Sake - Sự Thức Tỉnh",
      subheadline: "Bình yên & chữa lành giữa lòng Ocean City.",
      signature: "Since 2024",
      ctaLabel: "Khám phá Hành trình",
      ctaHref: "/#menu",
      mediaType: "image",
      mediaUrl:
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2000&q=80",
      ambient: "Chim hót • Suối chảy",
    },
    night: {
      eyebrow: "",
      headline: "Làng Sake - Sự Thức Tỉnh",
      subheadline: "Sôi động & kết nối cùng đêm lửa trại Ocean City.",
      signature: "Since 2024",
      ctaLabel: "Đặt bàn ngay",
      ctaHref: "/#menu",
      mediaType: "video",
      mediaUrl: "https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4",
      posterUrl:
        "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=2000&q=80",
      ambient: "Nhịp trống • Acoustic phố",
    },
  },
  dualVibe: {
    eyebrow: "The Dual Vibe Switch",
    title: "Ngày & Đêm",
    day: {
      label: "Ban ngày",
      headline: "Bình yên & Chữa lành",
      description:
        "Không gian trong veo cho những cuộc hẹn tái tạo năng lượng.",
      mediaType: "image",
      mediaUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
      ambient: "Chim hót • Suối chảy",
      highlights: [
        {
          title: "Cafe tùy tâm",
          description: "Uống theo cảm xúc, tin vào sự tử tế.",
        },
        {
          title: "Camping ban ngày",
          description: "Lều zen, ánh sáng dịu và gió biển mát.",
        },
        {
          title: "Chữa lành",
          description: "Thiền, thở, reset cảm xúc trong khu vườn xanh.",
        },
      ],
    },
    night: {
      label: "Ban đêm",
      headline: "Sôi động & Kết nối",
      description:
        "Chạm lửa đêm, kéo năng lượng lên cao cùng bạn bè.",
      mediaType: "video",
      mediaUrl: "https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4",
      posterUrl:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
      ambient: "Nhạc sôi động • Tiếng lửa nổ.",
      highlights: [
        {
          title: "Lẩu nướng",
          description: "Bữa tối ấm, thịt nướng và nồi lẩu nóng.",
        },
        {
          title: "Âm nhạc đường phố",
          description: "Band live, acoustic và nhịp phố.",
        },
        {
          title: "Đốt lửa",
          description: "Bonfire nights, kết nối và câu chuyện thật.",
        },
      ],
    },
  },
  sakePass: {
    eyebrow: "Sake Pass 6",
    title: "6 Trải nghiệm cốt lõi",
    description:
      "Mỗi điểm dừng là một lớp cảm xúc: nghệ thuật, dưỡng lành, công nghệ và đêm lửa ấm.",
    hint: "Kéo xuống để khám phá",
    items: [
      {
        title: "Media",
        subtitle: "Check-in & Professional Photography",
        description: "Studio ngoài trời với ánh sáng vàng và bối cảnh Nhật Bản.",
        imageUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Coffee",
        subtitle: "Pay as you feel (Tùy tâm)",
        description: "Trải nghiệm niềm tin: trả theo cảm xúc, thưởng vị thanh sạch.",
        imageUrl:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Camping",
        subtitle: "Glamping & Bonfire Nights",
        description: "Đêm lửa trại, lều sang, câu chuyện thật giữa rừng đèn.",
        imageUrl:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Healing",
        subtitle: "Meditation & Mental Wellness",
        description: "Thiền, thở, reset. Không gian tĩnh để quay về chính mình.",
        imageUrl:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "AI Care",
        subtitle: "SKVI Health Technology",
        description: "Chạm vào sức khỏe thông minh và chỉ số cảm xúc thời gian thực.",
        imageUrl:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Music",
        subtitle: "Live Street Bands & Acoustic Nights",
        description: "Âm nhạc đường phố và acoustic nhẹ nhàng suốt đêm.",
        imageUrl:
          "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  b2b: {
    eyebrow: "Doanh nghiệp & Sự kiện",
    title: "Tài trợ 100% Hạ tầng Sự kiện cho Doanh Nghiệp",
    highlight:
      "Chỉ cần đặt ăn - TÀI TRỢ 100% Sân khấu, Âm thanh, Ánh sáng, Màn hình LED 900 inch.",
    condition: "Áp dụng khi đặt dịch vụ Ẩm thực.",
    primaryCta: {
      label: "Nhận báo giá đoàn",
      href: "mailto:events@langsake.vn",
    },
    secondaryCta: {
      label: "Tải hồ sơ năng lực",
      href: "/assets/ho-so-nang-luc.pdf",
    },
    benefits: [
      {
        title: "Sân khấu",
        description: "Không gian dựng chương trình theo concept riêng.",
        icon: "stage",
      },
      {
        title: "Âm thanh",
        description: "Hệ thống âm thanh đa vùng, phủ khắp sân.",
        icon: "sound",
      },
      {
        title: "Ánh sáng",
        description: "Ánh sáng sân khấu và ambient theo chủ đề.",
        icon: "lighting",
      },
      {
        title: "LED 900 inch",
        description: "Màn hình LED khổng lồ, trình chiếu ấn tượng.",
        icon: "screen",
      },
    ],
  },
  menu: {
    eyebrow: "Visual Menu",
    title: "Ăn bằng mắt trước, chốt bàn nhanh hơn",
    description: "Combo hấp dẫn, phù hợp từng nhóm khách.",
    items: [
      {
        name: "Combo Sinh Viên",
        price: "99.000đ",
        description: "Nhóm bạn trẻ, uống vui và chat rôm rả.",
        tag: "Best for Students",
        imageUrl:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Combo Cặp Đôi",
        price: "666.000đ",
        description: "Bàn tiệc lãng mạn, nến và hoa.",
        tag: "Romantic Set",
        imageUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Combo Gia Đình",
        price: "999.000đ",
        description: "Đại tiệc ấm áp cho gia đình và bạn bè.",
        tag: "Family Gathering",
        imageUrl:
          "https://images.unsplash.com/photo-1527998846294-e5f7a7d0c40a?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Khách Quốc Tế",
        price: "$22",
        description: "Khách Tây nâng ly, thưởng lẩu gà Đông Tảo.",
        tag: "International Night",
        imageUrl:
          "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  socialProof: {
    eyebrow: "Người thật - Việc thật",
    title: "Những khoảnh khắc hạnh phúc rạng ngời",
    description:
      "Không chỉ là điểm đến, mà là nơi tìm lại năng lượng.",
    items: [
      {
        imageUrl: "/images/social-01.jpg",
        quote: "Không chỉ là điểm đến, mà là nơi tìm lại năng lượng.",
        name: "Thuỳ D.",
      },
      {
        imageUrl: "/images/social-02.jpg",
        quote: "Đêm lửa trại làm mình quên hết mệt mỏi cả tuần.",
        name: "Quang N.",
      },
      {
        imageUrl: "/images/social-03.jpg",
        quote: "Check-in quá đẹp, ảnh nào cũng like bùng nổ.",
        name: "Ngọc H.",
      },
      {
        imageUrl: "/images/social-04.jpg",
        quote: "Đi cùng gia đình, ai cũng có góc vui riêng.",
        name: "Trang L.",
      },
      {
        imageUrl: "/images/social-05.jpg",
        quote: "Đồ ăn ngon, không gian chill, vibe rất Nhật.",
        name: "Tùng A.",
      },
      {
        imageUrl: "/images/social-06.jpg",
        quote: "Muốn quay lại vì năng lượng tích cực quá mạnh.",
        name: "Mai P.",
      },
    ],
  },
  vibe: {
    title: "The Vibe",
    eyebrow: "Happy Moments",
    description:
      "Những khoảnh khắc hạnh phúc lan tỏa từ ánh đèn, gió biển và tiếng cười.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
        alt: "Lantern path",
        depth: 30,
      },
      {
        src: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80",
        alt: "Couple walking",
        depth: 45,
      },
      {
        src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
        alt: "Family at night market",
        depth: 35,
      },
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
        alt: "Friends gathering",
        depth: 50,
      },
      {
        src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80",
        alt: "Seaside breeze",
        depth: 28,
      },
      {
        src: "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&w=900&q=80",
        alt: "Bonfire night",
        depth: 40,
      },
      {
        src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=900&q=80",
        alt: "Warm lights",
        depth: 32,
      },
      {
        src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
        alt: "Glamping tents",
        depth: 48,
      },
    ],
  },
  affiliate: {
    eyebrow: "Affiliate Portal",
    title: "Trạm Khởi Nghiệp Sake - Làm là có ăn",
    subtitle: "Không vốn - Không gò bó - Thu nhập thụ động",
    valueProps: ["Không vốn", "Không gò bó", "Thu nhập thụ động"],
    levels: [
      {
        name: "Level 1 - Basic Access",
        perk: "Free food",
        description: "Khởi động nhẹ nhàng, trải nghiệm nền tảng.",
      },
      {
        name: "Level 2 - Pro",
        perk: "Free Accommodation + Laundry",
        description: "Nâng cấp quyền lợi và hỗ trợ vận hành.",
      },
      {
        name: "Level 3 - Master",
        perk: "Team Leader - Passive Income",
        description: "Dẫn đội, nhận thu nhập và quyền lực cộng đồng.",
      },
    ],
    calculator: {
      title: "Bảng tính hoa hồng",
      guestsLabel: "Doanh thu tháng (VNĐ)",
      estimatedVndLabel: "Khoảng thu nhập (VNĐ)",
      min: 0,
      max: 2000000000,
      step: 5000000,
      defaultValue: 400000000,
      minRate: 0.08,
      maxRate: 0.12,
      helper:
        "Hoa hồng 8–12% theo doanh thu tháng. Nhận mỗi khi đạt hoa hồng 10tr đồng, không phụ thuộc vào thời gian.",
    },
    board: {
      title: "Survival Board",
      description: "Lộ trình lên cấp, nâng quyền lợi và thu nhập.",
    },
    form: {
      title: "Affiliate Registration",
      description: "Tạo danh tính affiliate và nhận link giới thiệu riêng.",
      ctaLabel: "Nhận danh định & Link giới thiệu",
      fields: [
        {
          id: "fullName",
          label: "Họ và tên",
          placeholder: "Nhập họ và tên",
          type: "text",
        },
        {
          id: "socialLink",
          label: "TikTok/Social Link",
          placeholder: "https://tiktok.com/@yourname",
          type: "url",
        },
        {
          id: "phone",
          label: "Số điện thoại",
          placeholder: "0123 456 789",
          type: "tel",
        },
      ],
    },
  },
  footer: {
    address: "Ocean Park 2, Văn Giang, Hưng Yên",
    note: "",
    contactTitle: "Liên hệ",
    contactItems: [
      {
        label: "Địa chỉ",
        value: "Ocean Park 2, Văn Giang, Hưng Yên",
      },
      {
        label: "Hotline",
        value: "090 123 4567",
      },
      {
        label: "Email",
        value: "hello@langsake.vn",
      },
    ],
    collabTitle: "Đồng hành cùng Làng Sake",
    collabDescription:
      "Dành cho blogger, travel writer và đối tác du lịch cùng lan toả giá trị văn hoá làng sake.",
    partnerLabel: "Tìm hiểu chương trình hợp tác",
    partnerHref: "/affiliate",
  },
  story: {
    eyebrow: "Our Story",
    title: "Câu chuyện Làng Sake",
    description:
      "Lấy cảm hứng từ những làng nghề ủ rượu thủ công của Nhật Bản, Làng Sake là nơi tinh hoa truyền thống gặp gỡ nhịp sống hiện đại. Chúng tôi nâng niu từng giọt rượu, từng khoảnh khắc thưởng thức.",
    imageUrl:
      "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=1400&q=80",
  },
  collection: {
    eyebrow: "Collection",
    title: "Bộ sưu tập hương vị",
    description:
      "Chọn lựa theo cảm xúc: ngọt dịu, cay nhẹ, hậu trái cây và tầng hương gỗ ấm.",
    items: [
      {
        name: "Junmai Soft",
        note: "Ngọt dịu • Hương gạo",
        description: "Kết cấu mượt, dễ uống, hợp người mới bắt đầu.",
        imageUrl:
          "https://images.unsplash.com/photo-1506807803488-8eafc15323df?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Ginjo Floral",
        note: "Hoa quả • Hậu thơm",
        description: "Cân bằng hương trái cây, hậu vị dài.",
        imageUrl:
          "https://images.unsplash.com/photo-1514361892635-6f07b655a438?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Yuzu Spark",
        note: "Thanh mát • Citrus",
        description: "Vị chua nhẹ và tươi mát, lý tưởng cho ngày hè.",
        imageUrl:
          "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  culture: {
    eyebrow: "Sake Culture",
    title: "Văn hóa thưởng thức",
    description:
      "Sake có thể uống nóng hoặc lạnh. Chọn nhiệt độ phù hợp sẽ giúp tôn trọn hương vị.",
    tips: [
      {
        title: "Uống lạnh",
        description: "Giữ trọn hương hoa quả và hậu vị tinh tế.",
      },
      {
        title: "Uống ấm",
        description: "Làm nổi bật vị gạo và cảm giác ấm áp.",
      },
      {
        title: "Pairing",
        description: "Hợp cùng hải sản, thịt nướng và món Nhật.",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80",
  },
};



