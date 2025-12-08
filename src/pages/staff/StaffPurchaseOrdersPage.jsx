import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Input, message, Space, Select, InputNumber } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { staffPurchaseOrderService } from '../../features/purchaseOrder/api/staffPurchaseOrderService';
import { staffSupplierService } from '../../features/supplier/api/staffSupplierService';
import { getAllBooks } from '../../features/book/api/staffBookService';
import { checkWarehouseStaffRole } from '../../utils/jwt';

const STATUS_COLOR = {
  DRAFT: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
};

const StaffPurchaseOrdersPage = () => {
  const isWarehouse = checkWarehouseStaffRole(true);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [books, setBooks] = useState([]);
  const [formState, setFormState] = useState({ supplierId: null, note: '', items: [] });
  const [processOpen, setProcessOpen] = useState(false);
  const [processType, setProcessType] = useState(null); // approve | reject
  const [selectedId, setSelectedId] = useState(null);
  const [processNote, setProcessNote] = useState('');
  const [processLoading, setProcessLoading] = useState(false);

  useEffect(() => {
    load();
    loadSuppliers();
    loadBooks();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await staffPurchaseOrderService.getAll();
      setData(res || []);
    } catch (err) {
      console.error('Load PO error', err);
      message.error('Không thể tải danh sách PO');
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await staffSupplierService.getAllSuppliers();
      setSuppliers(res || []);
    } catch (err) {
      console.error('Load suppliers error', err);
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

  const addItem = () => {
    setFormState((p) => ({
      ...p,
      items: [...p.items, { id: Date.now(), bookId: null, quantity: 1, importPrice: 0 }],
    }));
  };

  const updateItem = (id, field, value) => {
    setFormState((p) => ({
      ...p,
      items: p.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  };

  const removeItem = (id) => {
    setFormState((p) => ({
      ...p,
      items: p.items.filter((it) => it.id !== id),
    }));
  };

  const handleCreate = async () => {
    if (!formState.supplierId) {
      message.warning('Chọn nhà cung cấp');
      return;
    }
    if (!formState.items.length || formState.items.some((it) => !it.bookId || it.quantity <= 0 || it.importPrice <= 0)) {
      message.warning('Kiểm tra danh sách sách, số lượng >0 và giá nhập >0');
      return;
    }
    try {
      const payload = {
        supplierId: formState.supplierId,
        note: formState.note,
        items: formState.items.map(({ bookId, quantity, importPrice }) => ({
          bookId,
          quantity,
          importPrice,
        })),
      };
      await staffPurchaseOrderService.create(payload);
      message.success('Đã tạo PO (DRAFT)');
      setCreateOpen(false);
      setFormState({ supplierId: null, note: '', items: [] });
      load();
    } catch (err) {
      console.error('Create PO error', err);
      message.error(err.response?.data?.message || 'Tạo PO thất bại');
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
        await staffPurchaseOrderService.approve(selectedId);
        message.success('Đã duyệt, đã tạo phiếu nhập kho');
      } else {
        await staffPurchaseOrderService.reject(selectedId, processNote);
        message.success('Đã từ chối PO');
      }
      setProcessOpen(false);
      load();
    } catch (err) {
      console.error('Process PO error', err);
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setProcessLoading(false);
    }
  };

  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Nhà cung cấp', dataIndex: 'supplierName', key: 'supplierName' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (st) => <Tag color={STATUS_COLOR[st] || 'default'}>{st}</Tag>,
    },
    { title: 'Người tạo', dataIndex: 'createdByName', key: 'createdByName', width: 140 },
    { title: 'Người duyệt', dataIndex: 'approvedByName', key: 'approvedByName', width: 140 },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            disabled={!isWarehouse || record.status !== 'DRAFT'}
            onClick={() => openProcessModal(record.id, 'approve')}
          >
            Duyệt
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            disabled={!isWarehouse || record.status !== 'DRAFT'}
            onClick={() => openProcessModal(record.id, 'reject')}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ], [isWarehouse]);

  return (
    <div>
      <Card
        title="Đơn đặt hàng (PO)"
        extra={
          isWarehouse && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setCreateOpen(true);
              if (!formState.items.length) {
                addItem();
              }
            }}>
              Tạo PO
            </Button>
          )
        }
      >
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(r) => r.id}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                dataSource={(record.items || []).map((it, idx) => ({ ...it, key: idx }))}
                columns={[
                  { title: 'Mã sách', dataIndex: 'bookId', key: 'bookId', width: 90 },
                  { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'right' },
                  { title: 'Giá nhập', dataIndex: 'importPrice', key: 'importPrice', align: 'right' },
                ]}
                pagination={false}
                size="small"
              />
            ),
          }}
        />
      </Card>

      <Modal
        title="Tạo PO"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="Tạo"
        destroyOnClose
        width={700}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <div>Nhà cung cấp</div>
            <Select
              showSearch
              placeholder="Chọn nhà cung cấp"
              style={{ width: '100%', marginTop: 4 }}
              optionFilterProp="children"
              value={formState.supplierId}
              onChange={(val) => setFormState((p) => ({ ...p, supplierId: val }))}
            >
              {suppliers.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <div>Ghi chú</div>
            <Input.TextArea
              rows={3}
              value={formState.note}
              onChange={(e) => setFormState((p) => ({ ...p, note: e.target.value }))}
              placeholder="Ghi chú cho PO"
              style={{ marginTop: 4 }}
            />
          </div>

          <div>
            <div style={{ marginBottom: 8 }}>
              <Space>
                <span>Danh sách sách</span>
                <Button onClick={addItem} type="dashed" size="small" icon={<PlusOutlined />}>
                  Thêm dòng
                </Button>
              </Space>
            </div>
            {(formState.items || []).map((it) => (
              <Space key={it.id} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                <Select
                  showSearch
                  placeholder="Sách"
                  style={{ width: 240 }}
                  value={it.bookId}
                  optionFilterProp="children"
                  onChange={(val) => updateItem(it.id, 'bookId', val)}
                >
                  {books.map((b) => (
                    <Select.Option key={b.id} value={b.id}>
                      {b.title}
                    </Select.Option>
                  ))}
                </Select>
                <InputNumber
                  min={1}
                  placeholder="SL"
                  value={it.quantity}
                  onChange={(val) => updateItem(it.id, 'quantity', val || 1)}
                />
                <InputNumber
                  min={0}
                  placeholder="Giá nhập"
                  value={it.importPrice}
                  formatter={(v) => {
                    if (v === undefined || v === null) return '';
                    const digits = `${v}`.replace(/\D/g, '');
                    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }}
                  parser={(v) => {
                    const digits = (v || '').replace(/\D/g, '');
                    return digits ? Number(digits) : 0;
                  }}
                  onChange={(val) => updateItem(it.id, 'importPrice', val || 0)}
                />
                <Button danger size="small" onClick={() => removeItem(it.id)}>
                  Xóa
                </Button>
              </Space>
            ))}
          </div>
        </Space>
      </Modal>

      <Modal
        title={processType === 'approve' ? 'Duyệt PO' : 'Từ chối PO'}
        open={processOpen}
        onCancel={() => setProcessOpen(false)}
        onOk={handleProcess}
        okText={processType === 'approve' ? 'Duyệt' : 'Từ chối'}
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

export default StaffPurchaseOrdersPage;

