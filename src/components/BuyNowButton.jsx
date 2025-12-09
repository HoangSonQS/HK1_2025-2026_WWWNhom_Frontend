import React, { useState } from "react";
import { Button, message, Modal } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { addToCart, getCart } from "../features/cart/api/cartService";
import { decodeJWT } from "../utils/jwt";
import { ROUTES, STORAGE_KEYS } from "../utils/constants";
import LoginRequiredModal from "./LoginRequiredModal";

const BuyNowButton = ({
  book,
  quantity = 1,
  size = "middle",
  block = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const [warningModal, setWarningModal] = useState({
    open: false,
    title: "",
    content: "",
    onOk: null,
  });

  const showWarning = (title, content, onOk) => {
    setWarningModal({ open: true, title, content, onOk });
  };

  const handleBuyNow = async (e) => {
    // Ngăn event propagation / prevent default để không trigger onClick/Link của Card
    e.stopPropagation();
    e.preventDefault();

    // Kiểm tra đăng nhập - CHỈ đọc jwtToken, không đọc adminToken
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    const decoded = decodeJWT(token, false); // useAdminToken = false
    if (!decoded) {
      setShowLoginModal(true);
      return;
    }

    // Kiểm tra tồn kho với số lượng hiện có trong giỏ
    try {
      const cartRes = await getCart();
      const existing = cartRes.data?.items?.find((it) => it.bookId === book.id);
      const currentQty = existing?.quantity || 0;
      const desiredQty = currentQty + quantity;

      if (book.quantity <= 0 || desiredQty > book.quantity) {
        const isMaxed = currentQty >= book.quantity;
        const content = isMaxed
          ? `Bạn đã có ${currentQty} cuốn trong giỏ. Tồn kho tối đa cho phép là ${book.quantity} cuốn, không thể thêm nữa. Sẽ giữ nguyên số lượng hiện có và chuyển tới thanh toán.`
          : `Chỉ còn ${book.quantity} cuốn. Bạn đã có ${currentQty} trong giỏ, không thể thêm vượt tồn.`;
        const goCheckout = () => navigate(ROUTES.CHECKOUT);
        showWarning(
          isMaxed ? "Đã đạt số lượng tối đa" : "Không đủ tồn kho",
          content,
          isMaxed ? goCheckout : null
        );
        if (isMaxed) {
          return;
        }
        return;
      }
    } catch (err) {
      // Nếu load giỏ lỗi, vẫn cho phép thử, backend vẫn validation
    }

    setLoading(true);
    try {
      await addToCart(book.id, quantity);
      // Trigger event để cập nhật cart count trong Header
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      // Chuyển sang trang giỏ hàng
      navigate(ROUTES.CART);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể thêm vào giỏ hàng";
      if (errorMessage?.toLowerCase().includes("not enough stock")) {
        showWarning(
          "Không đủ tồn kho",
          error.response?.data?.message || "Số lượng yêu cầu vượt tồn kho hiện có.",
          null
        );
      } else {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="default"
        onClick={handleBuyNow}
        loading={loading}
        size={size}
        block={block}
        disabled={book.quantity === 0}
        style={{
          borderColor: "#ff6b35",
          color: "#ff6b35",
        }}
      >
        {book.quantity === 0 ? "Hết hàng" : "Mua ngay"}
      </Button>
      <Modal
        open={warningModal.open}
        onOk={() => {
          warningModal.onOk?.();
          setWarningModal({ ...warningModal, open: false });
        }}
        onCancel={() => {
          // Nếu có onOk (trường hợp đã đủ số lượng, cần đi checkout), vẫn điều hướng khi đóng/hủy
          warningModal.onOk?.();
          setWarningModal({ ...warningModal, open: false });
        }}
        centered
        okText={warningModal.onOk ? "Tiếp tục" : "Đã hiểu"}
        cancelButtonProps={{ style: warningModal.onOk ? {} : { display: "none" } }}
        title={warningModal.title}
      >
        {warningModal.content}
      </Modal>
      <LoginRequiredModal
        visible={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        title="Yêu cầu đăng nhập"
        content="Bạn cần đăng nhập để mua sách."
      />
    </>
  );
};

export default BuyNowButton;
