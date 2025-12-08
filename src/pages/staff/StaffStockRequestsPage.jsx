import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, InputNumber, Select, Input, message } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { staffStockRequestService } from '../../features/stockRequest/api/staffStockRequestService';
import { getAllBooks } from '../../features/book/api/staffBookService';
import { staffSupplierService } from '../../features/supplier/api/staffSupplierService';
import { checkSellerStaffRole, checkWarehouseStaffRole } from '../../utils/jwt';

const STATUS_COLORS = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
};

const StaffStockRequestsPage = () => {
  const [isSeller] = useState(checkSellerStaffRole(true));
  const [isWarehouse] = useState(checkWarehouseStaffRole(true));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [books, setBooks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [formCreate] = Form.useForm();
  const [formApprove] = Form.useForm();

  useEffect(() => {
    loadData();
    if (isSeller) {
      loadBooks();
    }
    if (isWarehouse) {
      loadSuppliers();
    }
  }, [isSeller, isWarehouse]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = isWarehouse
        ? await staffStockRequestService.getAllRequests()
        : await staffStockRequestService.getMyRequests();
      setData(response || []);
    } catch (err) {
      console.error('Error loading stock requests', err);
      message.error('Không thể tải yêu cầu xuất/nhập kho');
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const res = await getAllBooks();
      setBooks(res.data || res || []);
    } catch (err) {
      console.error('Error loading books', err);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await staffSupplierService.getAllSuppliers();
      setSuppliers(res || []);
    } catch (err) {
      console.error('Error loading suppliers', err);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await formCreate.validateFields();
      await staffStockRequestService.createRequest(values);
      message.success('Gửi yêu cầu thành công');
      setCreateOpen(false);
      formCreate.resetFields();
      loadData();
    } catch (err) {
      if (err?.errorFields) return; // validation
      console.error('Error create request', err);
      message.error(err.response?.data?.message || 'Gửi yêu cầu thất bại');
    }
  };

  const handleApprove = async () => {
    try {
      const values = await formApprove.validateFields();
      await staffStockRequestService.approve(currentId, values);
      message.success('Phê duyệt thành công, đã tạo phiếu nhập kho');
      setApproveOpen(false);
      formApprove.resetFields();
      setCurrentId(null);
      loadData();
    } catch (err) {
      if (err?.errorFields) return;
      console.error('Error approve request', err);
      message.error(err.response?.data?.message || 'Phê duyệt thất bại');
    }
  };

  const handleReject = (id) => {
    let noteValue = '';
    Modal.confirm({
      title: 'Từ chối yêu cầu?',
      content: (
        <Input.TextArea
          placeholder="Lý do (tuỳ chọn)"
          onChange={(e) => (noteValue = e.target.value)}
        />
      ),
      okText: 'Từ chối',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await staffStockRequestService.reject(id, { responseNote: noteValue });
          message.success('Đã từ chối yêu cầu');
          loadData();
        } catch (err) {
          console.error('Error reject request', err);
          message.error(err.response?.data?.message || 'Từ chối thất bại');
        }
      },
    });
  };

  const columns = useMemo(() => {
    const cols = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: 'Sách', dataIndex: 'bookTitle', key: 'bookTitle' },
      { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 100 },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status) => <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>,
      },
      { title: 'Người tạo', dataIndex: 'createdByName', key: 'createdByName', width: 140 },
      { title: 'Người xử lý', dataIndex: 'processedByName', key: 'processedByName', width: 140 },
      { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
      { title: 'Phản hồi', dataIndex: 'responseNote', key: 'responseNote' },
    ];

    if (isWarehouse) {
      cols.push({
        title: 'Hành động',
        key: 'actions',
        width: 170,
        render: (_, record) => (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              disabled={record.status !== 'PENDING'}
              onClick={() => {
                setCurrentId(record.id);
                setApproveOpen(true);
                formApprove.resetFields();
              }}
            >
              Duyệt
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              disabled={record.status !== 'PENDING'}
              onClick={() => handleReject(record.id)}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Yêu cầu nhập kho</h1>
        {isSeller && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Tạo yêu cầu
          </Button>
        )}
      </div>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title="Tạo yêu cầu nhập kho"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="Gửi yêu cầu"
        destroyOnClose
      >
        <Form layout="vertical" form={formCreate}>
          <Form.Item
            name="bookId"
            label="Sách"
            rules={[{ required: true, message: 'Chọn sách' }]}
          >
            <Select
              showSearch
              placeholder="Chọn sách"
              optionFilterProp="children"
            >
              {books.map((b) => (
                <Select.Option key={b.id} value={b.id}>
                  {b.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: 'Nhập số lượng' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Phê duyệt yêu cầu"
        open={approveOpen}
        onCancel={() => setApproveOpen(false)}
        onOk={handleApprove}
        okText="Phê duyệt"
        destroyOnClose
      >
        <Form layout="vertical" form={formApprove}>
          <Form.Item
            name="supplierId"
            label="Nhà cung cấp"
            rules={[{ required: true, message: 'Chọn nhà cung cấp' }]}
          >
            <Select
              showSearch
              placeholder="Chọn nhà cung cấp"
              optionFilterProp="children"
            >
              {suppliers.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="importPrice"
            label="Giá nhập"
            rules={[{ required: true, message: 'Nhập giá nhập' }]}
          >
            <InputNumber
              min={0}
              onChange={(value) => {
                const digits = `${value ?? ''}`.replace(/\D/g, '');
                const num = digits ? Number(digits) : 0;
                formApprove.setFieldsValue({ importPrice: num });
              }}
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
          </Form.Item>
          <Form.Item name="responseNote" label="Ghi chú phản hồi">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffStockRequestsPage;

