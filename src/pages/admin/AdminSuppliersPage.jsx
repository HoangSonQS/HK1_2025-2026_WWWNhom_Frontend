import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Tag, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, SearchOutlined } from '@ant-design/icons';
import { adminSupplierService } from '../../features/supplier/api/adminSupplierService';
import SupplierModal from './components/SupplierModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const { Search } = Input;
const { Option } = Select;

const AdminSuppliersPage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await adminSupplierService.getAllSuppliers();
      
      // Sắp xếp theo ID tăng dần
      const sortedSuppliers = [...data].sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idA - idB;
      });
      
      setSuppliers(sortedSuppliers);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      if (err.response?.status === 401) {
        message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate(ROUTES.ADMIN_LOGIN, { replace: true });
      } else {
        message.error('Không thể tải danh sách nhà cung cấp');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeactivate = async (supplier) => {
    try {
      await adminSupplierService.deactivateSupplier(supplier.id);
      message.success('Vô hiệu hóa nhà cung cấp thành công');
      loadSuppliers();
    } catch (err) {
      console.error('Error deactivating supplier:', err);
      if (err.response?.status === 401) {
        message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate(ROUTES.ADMIN_LOGIN, { replace: true });
      } else {
        message.error('Không thể vô hiệu hóa nhà cung cấp');
      }
    }
  };

  const handleModalSuccess = (formData) => {
    setIsModalOpen(false);
    loadSuppliers();
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  // Lọc suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (supplier.phone && supplier.phone.includes(searchTerm));
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && supplier.isActive) ||
                         (filterStatus === 'inactive' && !supplier.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '-',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (address) => address || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 150,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            block
          >
            Cập nhật
          </Button>
          {record.isActive && (
            <Popconfirm
              title={`Bạn có chắc chắn muốn vô hiệu hóa nhà cung cấp "${record.name}"?`}
              onConfirm={() => handleDeactivate(record)}
              okText="Vô hiệu hóa"
              cancelText="Hủy"
            >
              <Button
                danger
                icon={<StopOutlined />}
                size="small"
                block
              >
                Vô hiệu hóa
              </Button>
            </Popconfirm>
          )}
        </Space>
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
        <h1 style={{ margin: 0 }}>Quản lý Nhà cung cấp</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleAdd}
        >
          Thêm nhà cung cấp
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} size="middle">
        <Search
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          allowClear
          style={{ width: 400 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined />}
        />
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          style={{ width: 200 }}
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="active">Đang hoạt động</Option>
          <Option value="inactive">Không hoạt động</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredSuppliers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} nhà cung cấp`,
        }}
      />

      <SupplierModal
        isOpen={isModalOpen}
        onClose={handleModalCancel}
        onSubmit={handleModalSuccess}
        supplier={selectedSupplier}
        mode={modalMode}
      />
    </div>
  );
};

export default AdminSuppliersPage;
