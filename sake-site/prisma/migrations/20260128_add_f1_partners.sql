-- Update F1 hiện tại thành Nguyễn Văn Quyết
UPDATE User 
SET name = 'Nguyễn Văn Quyết'
WHERE email = 'partner1@company.com' AND role = 'F1_PARTNER';

-- Thêm F1 Partner mới
INSERT INTO User (
  id,
  email,
  phone,
  password,
  name,
  role,
  referralCode,
  commissionRate,
  totalCommission,
  isActive,
  createdAt,
  updatedAt
) VALUES (
  'f1_partner_002',
  'partner2@company.com',
  '0987654321',
  '$2a$10$rQ8Z5kxVJ5kGZXq4qQ4Q4uZxK3kJ3kJ3kJ3kJ3kJ3kJ3kJ3kJ3kJ',  -- password: partner123
  'Trần Thị Hương',
  'F1_PARTNER',
  'PARTNER002',
  10.0,
  0.0,
  1,
  datetime('now'),
  datetime('now')
);
