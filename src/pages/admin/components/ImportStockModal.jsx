import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button, InputNumber, Table, message, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminImportStockService } from '../../../features/importStock/api/adminImportStockService';
import { staffImportStockService } from '../../../features/importStock/api/staffImportStockService';
import { adminSupplierService } from '../../../features/supplier/api/adminSupplierService';
import { staffSupplierService } from '../../../features/supplier/api/staffSupplierService';
import { getAllBooks as getAllBooksAdmin } from '../../../features/book/api/adminBookService';
import { getAllBooks as getAllBooksStaff } from '../../../features/book/api/staffBookService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

const { Option } = Select;

const ImportStockModal = ({ isOpen, onClose, onSuccess, isStaffRoute = false }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [books, setBooks] = useState([]);
  const [items, setItems] = useState([{ id: Date.now(), bookId: null, quantity: 1, importPrice: 0 }]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [suppliersData, booksData] = await Promise.all([
        isStaffRoute ? staffSupplierService.getAllSuppliers() : adminSupplierService.getAllSuppliers(),
        isStaffRoute ? getAllBooksStaff() : getAllBooksAdmin()
      ]);
      
      // Lọc suppliers đang hoạt động
      const activeSuppliers = suppliersData.filter(s => s.isActive);
      setSuppliers(activeSuppliers);
      
      // Lấy danh sách sách
      setBooks(booksData.data || booksData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      message.error('Không thể tải dữ liệu');
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), bookId: null, quantity: 1, importPrice: 0 }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) {
      message.warning('Phải có ít nhất một sách trong phiếu nhập');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleSubmit = async (values) => {
    // Validate items
    const invalidItems = items.filter(item => !item.bookId || item.quantity <= 0 || item.importPrice <= 0);
    if (invalidItems.length > 0) {
      message.error('Vui lòng điền đầy đủ thông tin cho tất cả các sách');
      return;
    }

    setLoading(true);
    try {
      const importStockData = {
        supplierId: values.supplierId,
        items: items.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
          importPrice: item.importPrice
        }))
      };

      const service = isStaffRoute ? staffImportStockService : adminImportStockService;
      await service.createImportStock(importStockData);
      message.success('Tạo phiếu nhập kho thành công!');
      
      // Dispatch event để cập nhật stock real-time cho Seller
      const updatedBookIds = importStockData.items.map(item => item.bookId);
      window.dispatchEvent(new CustomEvent('stockUpdated', { 
        detail: { bookIds: updatedBookIds } 
      }));
      
      form.resetFields();
      setItems([{ id: Date.now(), bookId: null, quantity: 1, importPrice: 0 }]);
      onSuccess();
    } catch (err) {
      console.error('Error creating import stock:', err);
      if (err.response?.status === 401) {
        message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate(ROUTES.ADMIN_LOGIN, { replace: true });
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setItems([{ id: Date.now(), bookId: null, quantity: 1, importPrice: 0 }]);
    onClose();
  };

  const columns = [
    {
      title: 'Sách',
      dataIndex: 'bookId',
      key: 'bookId',
      width: '40%',
      render: (bookId, record) => (
        <Select
          showSearch
          placeholder="Chọn sách"
          value={bookId}
          onChange={(value) => handleItemChange(record.id, 'bookId', value)}
          style={{ width: '100%' }}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {books.map(book => (
            <Option key={book.id} value={book.id}>
              {book.title}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '20%',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleItemChange(record.id, 'quantity', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Giá nhập',
      dataIndex: 'importPrice',
      key: 'importPrice',
      width: '25%',
      render: (importPrice, record) => (
        <InputNumber
          min={0}
          value={importPrice}
          onChange={(value) => handleItemChange(record.id, 'importPrice', Number(value) || 0)}
          formatter={(value) => {
            if (value === undefined || value === null) return '';
            const digits = `${value}`.replace(/\D/g, '');
            return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }}
          parser={(value) => {
            const digits = (value || '').replace(/\D/g, '');
            return digits ? Number(digits) : 0;
          }}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: '15%',
      render: (_, record) => (
        <strong>{formatCurrency(record.quantity * record.importPrice)}</strong>
      ),
    },
    {
      title: '',
      key: 'action',
      width: '80px',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
          disabled={items.length === 1}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Tạo phiếu nhập kho"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Form
        form={form}
        name="importStockForm"
        onFinish={handleSubmit}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="supplierId"
          label="Nhà cung cấp"
          rules={[
            { required: true, message: 'Vui lòng chọn nhà cung cấp!' }
          ]}
        >
          <Select
            showSearch
            placeholder="Chọn nhà cung cấp"
            size="large"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {suppliers.map(supplier => (
              <Option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ margin: 0 }}>Danh sách sách nhập</h4>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
            >
              Thêm sách
            </Button>
          </div>
          
          <Table
            columns={columns}
            dataSource={items}
            pagination={false}
            rowKey="id"
            size="small"
          />

          <div style={{ 
            marginTop: 16, 
            textAlign: 'right',
            padding: '12px',
            background: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <Space direction="vertical" align="end">
              <div>
                <strong>Tổng số lượng: </strong>
                {items.reduce((sum, item) => sum + item.quantity, 0)} cuốn
              </div>
              <div style={{ fontSize: 18, color: '#ff6b35' }}>
                <strong>Tổng tiền: {formatCurrency(calculateTotal())}</strong>
              </div>
            </Space>
          </div>
        </div>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo phiếu nhập'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ImportStockModal;

