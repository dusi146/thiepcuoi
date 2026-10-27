# Prompt thiệp cưới online retro

Hãy thiết kế một thiệp cưới online tiếng Việt, ưu tiên điện thoại, mang tinh thần retro của thiệp in và ảnh film thập niên 60–70. Dùng nền giấy ngà có vân rất nhẹ, đỏ gạch làm màu dấu son, xanh olive và nâu mực làm màu phụ, vàng nắng làm điểm sáng. Dùng serif cổ điển cho tên và lời mời, sans dễ đọc cho nội dung, mono nhỏ cho ngày tháng và chú thích.

Trải nghiệm gồm: màn hình phong bì có tem sáp và nút “Chạm để mở thiệp”; bìa mời với tên hai người, ngày cưới và ảnh; một bức thư thân tình; album ảnh chuyện tình có thể vuốt ngang; lịch trình lễ và tiệc với link bản đồ; countdown; dress code; form RSVP; lời cảm ơn và nút quay lại đầu trang.

Tạo chuyển động có chủ đích: phong bì mở một lần, tờ thư trượt lên, ảnh hiện nhẹ khi vào vùng nhìn, parallax rất ít, chuyển cảnh như lật giấy và nút điều khiển album có phản hồi rõ. Không tự bật nhạc. Có nút bỏ qua phần mở thiệp. Hiệu ứng con trỏ chỉ dùng trên máy có chuột. Tôn trọng `prefers-reduced-motion`, không chặn cuộn dọc trên điện thoại.

Ảnh thật của đôi uyên ương là trung tâm cảm xúc; nếu chưa có ảnh thì dùng minh họa vector thanh nhã, không giả ảnh thật. Không nhồi hiệu ứng, không phủ texture nặng, không làm chữ khó đọc. Tối ưu ảnh WebP/AVIF, lazy-load ảnh phía dưới màn hình đầu, dùng transform/opacity cho animation và bảo đảm không tràn ngang ở màn hình 360–430 px.

Thông tin cần thay trong cấu hình: `[TÊN CÔ DÂU]`, `[TÊN CHÚ RỂ]`, `[NGÀY / GIỜ]`, `[ĐỊA ĐIỂM]`, `[LINK BẢN ĐỒ]`, `[HẠN RSVP]`, `[EMAIL NHẬN HỒI ÂM]`, `[ẢNH]` và `[DRESS CODE]`. Không tự bịa dữ liệu. Form chỉ báo gửi thành công khi đã kết nối email hoặc backend thật.
