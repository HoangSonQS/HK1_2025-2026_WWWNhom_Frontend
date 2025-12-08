import React, { useState } from 'react';
import { Card, Upload, Table, Tag, message, Space, Button, Alert } from 'antd';
import { UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import { staffStockCheckService } from '../../features/stockCheck/api/staffStockCheckService';
import { checkWarehouseStaffRole } from '../../utils/jwt';

const StaffStockCheckPage = () => {
  const isWarehouse = checkWarehouseStaffRole(true);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { title: 'Mã sách', dataIndex: 'bookId', key: 'bookId', width: 90 },
    { title: 'Tên sách', dataIndex: 'title', key: 'title' },
    { title: 'Tồn hệ thống', dataIndex: 'systemQuantity', key: 'systemQuantity', align: 'right' },
    { title: 'Tồn kiểm kê', dataIndex: 'countedQuantity', key: 'countedQuantity', align: 'right' },
    {
      title: 'Chênh lệch',
      dataIndex: 'difference',
      key: 'difference',
      render: (diff) => (
        <Tag color={diff === 0 ? 'green' : diff > 0 ? 'blue' : 'red'}>
          {diff > 0 ? `+${diff}` : diff}
        </Tag>
      ),
      align: 'center',
    },
  ];

  const uploadProps = {
    accept: '.csv',
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      if (!isWarehouse) {
        message.error('Chức năng chỉ dành cho nhân viên kho');
        onError(new Error('not warehouse'));
        return;
      }
      setLoading(true);
      try {
        const res = await staffStockCheckService.compare(file);
        setData(res || []);
        message.success('Đã so sánh tồn kho');
        onSuccess();
      } catch (err) {
        console.error('Stock check error', err);
        message.error(err.response?.data?.message || 'Tải/đọc file thất bại. Vui lòng dùng CSV: bookId,countedQuantity');
        onError(err);
      } finally {
        setLoading(false);
      }
    },
  };

  if (!isWarehouse) {
    return <Alert type="error" message="Chức năng chỉ dành cho nhân viên kho" showIcon />;
  }

  return (
    <Card
      title="Kiểm kê tồn kho (CSV: bookId,countedQuantity)"
      extra={
        <Space>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Tải file CSV</Button>
          </Upload>
          <Button icon={<ReloadOutlined />} onClick={() => setData([])}>
            Xóa kết quả
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey={(r) => r.bookId}
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />
    </Card>
  );
};

export default StaffStockCheckPage;

