import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Input, message, Space, Select, InputNumber } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { staffWarehouseReturnService } from '../../features/warehouseReturn/api/staffWarehouseReturnService';
import { getAllBooks } from '../../features/book/api/staffBookService';
import { checkSellerStaffRole, checkWarehouseStaffRole } from '../../utils/jwt';

const STATUS_COLORS = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
};

const StaffWarehouseReturnsPage = () => {
  const isSeller = checkSellerStaffRole(true);
  const isWarehouse = checkWarehouseStaffRole(true);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [formState, setFormState] = useState({ bookId: null, quantity: 1, note: '' });
  const [processOpen, setProcessOpen] = useState(false);
  const [processType, setProcessType] = useState(null); // approve | reject
  const [selectedId, setSelectedId] = useState(null);
  const [processNote, setProcessNote] = useState('');
  const [processLoading, setProcessLoading] = useState(false);

  useEffect(() => {
    load();
    if (isSeller) loadBooks();
  }, [isSeller]);

  const load = async () => {
    setLoading(true);
    try {
      const res = isWarehouse ? await staffWarehouseReturnService.getAll() : await staffWarehouseReturnService.getMy();
      setData(res || []);
    } catch (err) {
      console.error('Load warehouse returns error', err);
      message.error('Không thể tải yêu cầu trả về kho');
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const res = await getAllBooks();
      setBooks(res.data || res || []);
    } catch (err) {
      console.error('Load books error', err);
    }
  };

  const handleCreate = async () => {
    if (!formState.bookId || formState.quantity <= 0) {
      message.warning('Chọn sách và số lượng > 0');
      return;
    }
    try {
      await staffWarehouseReturnService.create(formState);
      message.success('Đã gửi yêu cầu trả về kho');
      setCreateOpen(false);
      setFormState({ bookId: null, quantity: 1, note: '' });
      load();
    } catch (err) {
      console.error('Create warehouse return error', err);
      message.error(err.response?.data?.message || 'Gửi yêu cầu thất bại');
    }
  };

  const openProcessModal = (id, type) => {
    setSelectedId(id);
    setProcessType(type);
    setProcessNote('');
    setProcessOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedId || !processType) {
      setProcessOpen(false);
      return;
    }
    setProcessLoading(true);
    try {
      if (processType === 'approve') {
        await staffWarehouseReturnService.approve(selectedId, { responseNote: processNote });
        message.success('Đã phê duyệt, hàng đã nhập kho');
      } else {
        await staffWarehouseReturnService.reject(selectedId, { responseNote: processNote });
        message.success('Đã từ chối yêu cầu');
      }
      setProcessOpen(false);
      load();
    } catch (err) {
      console.error('Process warehouse return error', err);
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setProcessLoading(false);
    }
  };

  const columns = useMemo(() => {
    const cols = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
      { title: 'Sách', dataIndex: 'bookTitle', key: 'bookTitle' },
      { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 120, align: 'right' },
      { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (st) => <Tag color={STATUS_COLORS[st] || 'default'}>{st}</Tag>,
      },
      { title: 'Người tạo', dataIndex: 'createdByName', key: 'createdByName', width: 140 },
      { title: 'Người xử lý', dataIndex: 'processedByName', key: 'processedByName', width: 140 },
    ];
    if (isWarehouse) {
      cols.push({
        title: 'Thao tác',
        key: 'actions',
        width: 170,
        render: (_, record) => (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              disabled={record.status !== 'PENDING'}
              onClick={() => openProcessModal(record.id, 'approve')}
            >
              Duyệt
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              disabled={record.status !== 'PENDING'}
              onClick={() => openProcessModal(record.id, 'reject')}
            >
              Từ chối
            </Button>
          </Space>
        ),
      });
    }
    return cols;
  }, [isWarehouse]);

  return (
    <div>
      <Card
        title="Yêu cầu trả hàng về kho"
        extra={
          isSeller && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Tạo yêu cầu
            </Button>
          )
        }
      >
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(r) => r.id}
          loading={loading}
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title="Tạo yêu cầu trả về kho"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="Gửi yêu cầu"
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <span>Sách</span>
            <Select
              showSearch
              style={{ width: '100%', marginTop: 4 }}
              placeholder="Chọn sách"
              optionFilterProp="children"
              value={formState.bookId}
              onChange={(val) => setFormState((p) => ({ ...p, bookId: val }))}
            >
              {books.map((b) => (
                <Select.Option key={b.id} value={b.id}>
                  {b.title}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <span>Số lượng</span>
            <InputNumber
              min={1}
              style={{ width: '100%', marginTop: 4 }}
              value={formState.quantity}
              onChange={(val) => setFormState((p) => ({ ...p, quantity: val || 1 }))}
            />
          </div>
          <div>
            <span>Ghi chú</span>
            <Input.TextArea
              rows={3}
              style={{ marginTop: 4 }}
              value={formState.note}
              onChange={(e) => setFormState((p) => ({ ...p, note: e.target.value }))}
              placeholder="Lý do trả hàng..."
            />
          </div>
        </Space>
      </Modal>

      <Modal
        title={processType === 'approve' ? 'Phê duyệt nhận hàng' : 'Từ chối yêu cầu'}
        open={processOpen}
        onCancel={() => setProcessOpen(false)}
        onOk={handleProcess}
        okText={processType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        cancelText="Hủy"
        confirmLoading={processLoading}
        destroyOnClose
      >
        <Input.TextArea
          rows={4}
          placeholder="Ghi chú (tùy chọn)"
          value={processNote}
          onChange={(e) => setProcessNote(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default StaffWarehouseReturnsPage;

