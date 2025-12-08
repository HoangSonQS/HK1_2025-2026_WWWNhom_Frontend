import React, { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Descriptions } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { adminImportStockService } from '../../features/importStock/api/adminImportStockService';
import { staffImportStockService } from '../../features/importStock/api/staffImportStockService';
import ImportStockModal from './components/ImportStockModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const AdminImportStocksPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [importStocks, setImportStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadImportStocks();
  }, []);

  const loadImportStocks = async () => {
    setLoading(true);
    try {
      const isStaffRoute = location.pathname.startsWith('/staff');
      const service = isStaffRoute ? staffImportStockService : adminImportStockService;

      const data = await service.getAllImportStocks();
      
      // Sắp xếp theo ID giảm dần (mới nhất lên đầu)
      const sortedData = [...data].sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idB - idA;
      });
      
      setImportStocks(sortedData);
    } catch (err) {
      console.error('Error fetching import stocks:', err);
      if (err.response?.status === 401) {
        message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        if (location.pathname.startsWith('/staff')) {
          navigate(ROUTES.STAFF_LOGIN, { replace: true });
        } else {
          navigate(ROUTES.ADMIN_LOGIN, { replace: true });
        }
      } else {
        message.error('Không thể tải danh sách phiếu nhập kho');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadImportStocks();
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  // Format ngày giờ
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

  // Tính tổng tiền của phiếu nhập
  const calculateTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0);
  };

  // Tính tổng số lượng sách
  const calculateTotalQuantity = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: 'Mã sách',
        dataIndex: 'bookId',
        key: 'bookId',
        width: 100,
      },
      {
        title: 'Tên sách',
        dataIndex: 'bookTitle',
        key: 'bookTitle',
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 100,
      },
      {
        title: 'Giá nhập',
        dataIndex: 'importPrice',
        key: 'importPrice',
        width: 150,
        render: (price) => formatCurrency(price),
      },
      {
        title: 'Thành tiền',
        key: 'total',
        width: 150,
        render: (_, item) => formatCurrency(item.quantity * item.importPrice),
      },
    ];

    return (
      <div style={{ padding: '0 48px' }}>
        <h4 style={{ marginBottom: 16 }}>Chi tiết phiếu nhập</h4>
        <Table
          columns={columns}
          dataSource={record.items || []}
          pagination={false}
          rowKey="bookId"
          size="small"
        />
        <div style={{ 
          marginTop: 16, 
          textAlign: 'right', 
          fontSize: 16,
          fontWeight: 'bold',
          color: '#ff6b35'
        }}>
          Tổng tiền: {formatCurrency(calculateTotal(record.items))}
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'id',
      key: 'id',
      width: 100,
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
    },
    {
      title: 'Số loại sách',
      key: 'bookTypes',
      width: 120,
      render: (_, record) => (
        <Tag color="blue">{record.items?.length || 0} loại</Tag>
      ),
    },
    {
      title: 'Tổng số lượng',
      key: 'totalQuantity',
      width: 130,
      render: (_, record) => (
        <Tag color="green">{calculateTotalQuantity(record.items)} cuốn</Tag>
      ),
    },
    {
      title: 'Tổng tiền',
      key: 'totalAmount',
      width: 150,
      render: (_, record) => (
        <strong style={{ color: '#ff6b35' }}>
          {formatCurrency(calculateTotal(record.items))}
        </strong>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24 
      }}>
        <h1 style={{ margin: 0 }}>Quản lý Phiếu nhập kho</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleAdd}
        >
          Tạo phiếu nhập
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={importStocks}
        rowKey="id"
        loading={loading}
        expandable={{
          expandedRowRender,
          expandIcon: ({ expanded, onExpand, record }) => (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={e => onExpand(record, e)}
              size="small"
            >
              {expanded ? 'Ẩn' : 'Chi tiết'}
            </Button>
          ),
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} phiếu nhập`,
        }}
      />

      <ImportStockModal
        isOpen={isModalOpen}
        onClose={handleModalCancel}
        onSuccess={handleModalSuccess}
        isStaffRoute={location.pathname.startsWith('/staff')}
      />
    </div>
  );
};

export default AdminImportStocksPage;

