import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, message, Spin, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import staffImportStockService from '../../features/importStock/api/staffImportStockService';
import { getBookById } from '../../features/book/api/staffBookService';

const { Title, Text } = Typography;

const BookImportHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyResponse, bookResponse] = await Promise.all([
        staffImportStockService.getImportHistoryByBookId(id),
        getBookById(id)
      ]);
      setHistory(historyResponse.data || historyResponse || []);
      setBook(bookResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        message.warning('Vui lòng đăng nhập để xem lịch sử nhập kho');
      } else {
        message.error('Không thể tải lịch sử nhập kho');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const columns = [
    {
      title: 'Mã phiếu nhập',
      dataIndex: 'importStockId',
      key: 'importStockId',
      width: 120,
      render: (id) => <Tag color="blue">#{id}</Tag>
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdByName',
      key: 'createdByName',
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'importDate',
      key: 'importDate',
      width: 180,
      render: (date) => formatDateTime(date),
      sorter: (a, b) => new Date(a.importDate) - new Date(b.importDate),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right',
      render: (quantity) => (
        <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
          {quantity.toLocaleString('vi-VN')} cuốn
        </Tag>
      ),
    },
    {
      title: 'Giá nhập',
      dataIndex: 'importPrice',
      key: 'importPrice',
      width: 150,
      align: 'right',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (amount) => (
        <Text strong style={{ color: '#ff6b35' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
  ];

  // Tính tổng
  const totalQuantity = history.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = history.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/staff/books')}
        >
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          Lịch sử nhập kho
        </Title>
      </div>

      {book && (
        <Card style={{ marginBottom: 24 }}>
          <Text strong>Sách: </Text>
          <Text>{book.title}</Text>
          {book.author && (
            <>
              <Text strong style={{ marginLeft: 16 }}>Tác giả: </Text>
              <Text>{book.author}</Text>
            </>
          )}
        </Card>
      )}

      <Card>
        <Spin spinning={loading}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Text type="secondary">Chưa có lịch sử nhập kho cho sách này</Text>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={history}
                rowKey="importStockId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} phiếu nhập`,
                }}
              />
              <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Tổng số lượng đã nhập: </Text>
                    <Tag color="green" style={{ fontSize: '16px', padding: '4px 12px' }}>
                      {totalQuantity.toLocaleString('vi-VN')} cuốn
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Tổng giá trị: </Text>
                    <Text strong style={{ fontSize: '18px', color: '#ff6b35' }}>
                      {formatCurrency(totalAmount)}
                    </Text>
                  </div>
                </div>
              </div>
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default BookImportHistoryPage;
