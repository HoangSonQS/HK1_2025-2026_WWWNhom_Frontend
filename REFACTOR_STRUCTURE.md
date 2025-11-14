# Cấu trúc thư mục mới - Feature-based Architecture

## Cấu trúc đã được refactor:

```
src/
├── assets/                # Hình ảnh, icon, font
├── components/            # Component dùng lại
│   ├── common/           # Nút, modal, input... (sẽ thêm sau)
│   └── layout/           # Header, sidebar, footer (sẽ thêm sau)
├── features/             # Mỗi module = 1 folder
│   └── user/             # Module User/Auth
│       ├── api/          # authService.js - Gọi API
│       ├── components/    # Components riêng của user
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── ResetPassword.jsx
│       │   └── ChangePassword.jsx
│       ├── pages/        # UI pages (nếu cần tách)
│       └── hooks/        # Hooks riêng (sẽ thêm sau)
├── pages/                # Trang ở cấp route (sẽ thêm sau)
├── hooks/                # Custom hooks dùng lại (sẽ thêm sau)
├── routes/               # Định nghĩa router
│   └── AppRoutes.jsx
├── services/             # Config axios, interceptor
│   └── apiClient.js
├── store/                # Redux / Zustand / Jotai (nếu có)
├── utils/                # Helper, constants, validation
│   ├── jwt.js           # JWT utilities
│   └── constants.js     # Constants
├── styles/               # Global CSS, theme CSS
│   ├── global.css
│   └── auth.css
├── App.jsx
└── main.jsx
```

## Các thay đổi chính:

1. **services/apiClient.js**: Axios client với interceptors
2. **features/user/api/authService.js**: Tất cả API calls liên quan đến auth
3. **features/user/components/**: Tất cả components auth
4. **routes/AppRoutes.jsx**: Định nghĩa routes
5. **utils/**: JWT utilities và constants
6. **styles/**: CSS files được tổ chức lại

## Lưu ý:

- Các thư mục cũ (Login/, Register/, ForgotPassword/, Profile/) có thể được xóa thủ công
- Tất cả imports đã được cập nhật
- Không có lỗi linter

