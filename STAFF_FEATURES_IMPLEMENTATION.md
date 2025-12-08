# Kế hoạch triển khai các tính năng Staff

## 1. Tương tác giữa Warehouse và Seller

### 1.1. Real-time Stock Sync ✅
- Sử dụng CustomEvent `stockUpdated` khi warehouse tạo phiếu nhập
- Seller pages lắng nghe event và refresh data

### 1.2. History Import View cho Seller ✅
- Route: `/staff/books/:id/history`
- Hiển thị lịch sử nhập kho của sách

### 1.3. Stock Request (Seller → Warehouse) ⏳
- Seller tạo yêu cầu nhập thêm sách
- Warehouse xem và phê duyệt

## 2. Chức năng SELLER

### 2.1. Customer Management ⏳
- Danh sách khách hàng
- Chi tiết khách hàng
- Lịch sử mua hàng

### 2.2. Order Return/Refund ⏳
- Xem yêu cầu hoàn trả
- Duyệt/từ chối

### 2.3. Báo cáo nâng cao ⏳
- Doanh thu theo ngày/tháng
- Đơn hàng theo trạng thái
- Sản phẩm bán chạy
- Cảnh báo tồn kho thấp

### 2.4. Promotion Analytics ⏳
- Tỷ lệ sử dụng mã
- Hiệu quả từng mã
- Top khách hàng dùng mã

## 3. Chức năng WAREHOUSE

### 3.1. Inventory Report ⏳
- Tồn kho theo danh mục
- Giá trị tồn kho
- Hàng sắp hết
- Hàng tồn lâu

### 3.2. Stock Checking/Audit ⏳
- Upload Excel kiểm kê
- So sánh và điều chỉnh

### 3.3. Return to Warehouse ⏳
- Tiếp nhận hàng trả
- Kiểm tra và cập nhật

### 3.4. Purchase Order Flow ⏳
- Tạo đơn đặt hàng
- Chuyển thành phiếu nhập


