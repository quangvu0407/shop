# 🛒 E-Commerce Platform

Hệ thống thương mại điện tử đầy đủ tính năng được xây dựng với kiến trúc microservices, bao gồm frontend cho khách hàng, admin panel và backend services.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [API Services](#api-services)
- [Tính năng](#tính-năng)

## 🎯 Tổng quan

Đây là một nền tảng thương mại điện tử hoàn chỉnh với:
- **Frontend**: Giao diện người dùng hiện đại với React + Vite
- **Admin Panel**: Quản lý sản phẩm, đơn hàng, khuyến mãi
- **Backend**: Kiến trúc microservices với 7 services độc lập
- **AI Chat**: Tích hợp chatbot AI hỗ trợ khách hàng

## 🏗️ Kiến trúc hệ thống

### Microservices Architecture

```
┌─────────────┐     ┌─────────────┐
│  Frontend   │     │    Admin    │
│  (Port 80)  │     │  (Port 80)  │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └───────┬───────────┘
               │
        ┌──────▼──────┐
        │ API Gateway │
        │ (Port 3000) │
        └──────┬──────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐  ┌──▼───┐  ┌──▼────┐
│ Auth  │  │Product│ │ Order │
│ :3001 │  │ :3002 │ │ :3003 │
└───────┘  └───────┘ └───────┘
    │          │          │
┌───▼───┐  ┌──▼───┐  ┌──▼────┐
│ Cart  │  │ Chat │  │Comment│
│ :3004 │  │ :3005│  │ :3006 │
└───────┘  └──────┘  └───────┘
               │
         ┌─────▼─────┐
         │ Promotion │
         │   :3007   │
         └───────────┘
```

### Services

| Service | Port | Mô tả |
|---------|------|-------|
| **API Gateway** | 3000 | Điều hướng requests đến các services |
| **Auth Service** | 3001 | Xác thực, đăng ký, quản lý người dùng |
| **Product Service** | 3002 | Quản lý sản phẩm, danh mục |
| **Order Service** | 3003 | Xử lý đơn hàng, thanh toán |
| **Cart Service** | 3004 | Quản lý giỏ hàng (Redis cache) |
| **Chat Service** | 3005 | AI chatbot hỗ trợ khách hàng |
| **Comment Service** | 3006 | Đánh giá, bình luận sản phẩm |
| **Promotion Service** | 3007 | Quản lý khuyến mãi, mã giảm giá |
| **Frontend** | 5173 | Giao diện người dùng |
| **Admin** | 5174 | Trang quản trị |

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool
- **TailwindCSS 4** - Styling
- **React Router 7** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **MongoDB** - Database
- **Redis** - Caching (Cart service)
- **JWT** - Authentication
- **Passport.js** - OAuth (Facebook)
- **Stripe** - Payment processing
- **Cloudinary** - Image storage

### AI & ML
- **Anthropic Claude** - AI chatbot
- **Google Gemini** - AI integration
- **OpenAI** - AI services
- **GROQ** - Fast inference

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Web server

## 📦 Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.x
- Docker & Docker Compose
- MongoDB Atlas account (hoặc MongoDB local)
- npm hoặc yarn

### Clone repository

```bash
git clone <repository-url>
cd <project-folder>
```

### Cài đặt dependencies

#### Backend services
```bash
# Auth service
cd backEnd/auth-service
npm install

# Product service
cd ../product-service
npm install

# Order service
cd ../order-service
npm install

# Cart service
cd ../cart-service
npm install

# Chat service
cd ../chat-service
npm install

# Comment service
cd ../comment-service
npm install

# Promotion service
cd ../promotion-service
npm install

# API Gateway
cd ../api-gateway
npm install
```

#### Frontend
```bash
cd frontEnd
npm install
```

#### Admin
```bash
cd admin
npm install
```

## ⚙️ Cấu hình

### Environment Variables

Tạo file `.env` trong mỗi service với các biến sau:

#### Backend Services (.env)
```env
PORT=300X
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=your_admin_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# AI APIs (Chat service only)
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

#### Admin (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 🚀 Chạy ứng dụng

### Development Mode

#### Chạy từng service riêng lẻ

```bash
# Backend services
cd backEnd/auth-service && npm run dev
cd backEnd/product-service && npm run dev
cd backEnd/order-service && npm run dev
cd backEnd/cart-service && npm run dev
cd backEnd/chat-service && npm run dev
cd backEnd/comment-service && npm run dev
cd backEnd/promotion-service && npm run dev
cd backEnd/api-gateway && npm run dev

# Frontend
cd frontEnd && npm run dev

# Admin
cd admin && npm run dev
```

#### Sử dụng Docker Compose

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up
```

### Production Mode

```bash
# Build tất cả services
docker-compose -f docker-compose.prod.yml up --build -d
```

### Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **API Gateway**: http://localhost:3000

## 📡 API Services

### Auth Service (Port 3001)
- `POST /api/user/register` - Đăng ký tài khoản
- `POST /api/user/login` - Đăng nhập
- `GET /api/user/profile` - Lấy thông tin user
- `POST /api/admin/login` - Đăng nhập admin

### Product Service (Port 3002)
- `GET /api/product/list` - Danh sách sản phẩm
- `GET /api/product/:id` - Chi tiết sản phẩm
- `POST /api/product/add` - Thêm sản phẩm (admin)
- `PUT /api/product/:id` - Cập nhật sản phẩm (admin)
- `DELETE /api/product/:id` - Xóa sản phẩm (admin)

### Order Service (Port 3003)
- `POST /api/order/place` - Đặt hàng
- `GET /api/order/user` - Đơn hàng của user
- `GET /api/order/list` - Danh sách đơn hàng (admin)
- `PUT /api/order/status` - Cập nhật trạng thái (admin)

### Cart Service (Port 3004)
- `POST /api/cart/add` - Thêm vào giỏ hàng
- `GET /api/cart` - Lấy giỏ hàng
- `PUT /api/cart/update` - Cập nhật số lượng
- `DELETE /api/cart/remove` - Xóa khỏi giỏ hàng

### Chat Service (Port 3005)
- `POST /api/chat` - Gửi tin nhắn đến AI chatbot
- `GET /api/chat/history` - Lịch sử chat

### Comment Service (Port 3006)
- `POST /api/comment` - Thêm bình luận
- `GET /api/comment/:productId` - Lấy bình luận sản phẩm
- `PUT /api/comment/:id` - Cập nhật bình luận
- `DELETE /api/comment/:id` - Xóa bình luận

### Promotion Service (Port 3007)
- `GET /api/promotion/list` - Danh sách khuyến mãi
- `POST /api/promotion/apply` - Áp dụng mã giảm giá
- `POST /api/promotion/create` - Tạo khuyến mãi (admin)

## ✨ Tính năng

### Khách hàng
- ✅ Đăng ký/Đăng nhập (Email, Facebook OAuth)
- ✅ Xem danh sách sản phẩm với phân trang
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm vào giỏ hàng (Redis cache)
- ✅ Đặt hàng và thanh toán (Stripe)
- ✅ Theo dõi đơn hàng
- ✅ Đánh giá và bình luận sản phẩm
- ✅ Chat với AI bot hỗ trợ
- ✅ Áp dụng mã giảm giá

### Admin
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Quản lý khuyến mãi
- ✅ Upload hình ảnh (Cloudinary)
- ✅ Thống kê doanh thu
- ✅ Quản lý người dùng

### Kỹ thuật
- ✅ Microservices architecture
- ✅ API Gateway pattern
- ✅ JWT authentication
- ✅ Redis caching
- ✅ Image optimization (Cloudinary)
- ✅ Payment integration (Stripe)
- ✅ AI chatbot (Claude, Gemini, OpenAI)
- ✅ Docker containerization
- ✅ RESTful API design

## 📝 Scripts

### Backend
```bash
npm start       # Chạy production
npm run dev     # Chạy development với nodemon
```

### Frontend/Admin
```bash
npm run dev     # Development server
npm run build   # Build production
npm run preview # Preview production build
npm run lint    # Lint code
```

### Docker
```bash
docker-compose up              # Chạy tất cả services
docker-compose down            # Dừng tất cả services
docker-compose logs -f         # Xem logs
docker-compose ps              # Xem trạng thái services
```

## 🔒 Bảo mật

- JWT tokens cho authentication
- Bcrypt cho mã hóa mật khẩu
- CORS configuration
- Environment variables cho sensitive data
- Admin middleware cho protected routes
- Input validation với Joi

## 📄 License

ISC

## 👥 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo pull request hoặc mở issue.

## 📞 Liên hệ

Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ qua email hoặc tạo issue trên repository.
