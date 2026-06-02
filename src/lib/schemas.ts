import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ').or(z.literal('')),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const travelerSchema = z.object({
  full_name: z.string().min(2, 'Vui lòng nhập họ tên'),
  id_card: z.string().regex(/^\d{9,12}$/, 'Số CCCD phải từ 9-12 chữ số'),
  date_of_birth: z.string().min(1, 'Vui lòng chọn ngày sinh'),
  phone: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
});
