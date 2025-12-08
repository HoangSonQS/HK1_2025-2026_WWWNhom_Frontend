import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Input, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { staffReturnRequestService } from '../../features/returnRequest/api/staffReturnRequestService';

const STATUS_COLOR = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
};

const StaffReturnRequestsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject'
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await staffReturnRequestService.getAll();
      setData(res || []);
    } catch (err) {
      console.error('Error loading return requests', err);
      message.error('Không thể tải yêu cầu hoàn trả');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, id) => {
    console.log(`[ReturnRequest] Open modal ${type}`, { id });
    setModalType(type);
    setSelectedId(id);
    setNote('');
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    if (!selectedId || !modalType) return;
    setModalLoading(true);
    try {
      if (modalType === 'approve') {
        console.log('[ReturnRequest] Approve start', { selectedId, note });
        await staffReturnRequestService.approve(selectedId, { responseNote: note });
        console.log('[ReturnRequest] Approve success', { selectedId });
        message.success('Đã phê duyệt, đơn hàng chuyển RETURNED và hoàn kho');
      } else {
        console.log('[ReturnRequest] Reject start', { selectedId, note });
        await staffReturnRequestService.reject(selectedId, { responseNote: note });
        console.log('[ReturnRequest] Reject success', { selectedId });
        message.success('Đã từ chối yêu cầu');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      console.error('ReturnRequest modal error', err);
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedId(null);
    setModalType(null);
    setNote('');
  };

  const columns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
      { title: 'Mã đơn', dataIndex: 'orderId', key: 'orderId', width: 100 },
      {
        title: 'Tổng tiền đơn',
        dataIndex: 'orderTotal',
        key: 'orderTotal',
        width: 150,
        render: (val) =>
          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0),
      },
      { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (st) => <Tag color={STATUS_COLOR[st] || 'default'}>{st}</Tag>,
      },
      { title: 'Người tạo', dataIndex: 'createdByName', key: 'createdByName', width: 140 },
      { title: 'Người xử lý', dataIndex: 'processedByName', key: 'processedByName', width: 140 },
      {
        title: 'Thao tác',
        key: 'actions',
        width: 170,
        render: (_, record) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              disabled={record.status !== 'PENDING'}
              onClick={() => {
                console.log('[ReturnRequest] Click approve button', record);
                openModal('approve', record.id);
              }}
            >
              Duyệt
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              disabled={record.status !== 'PENDING'}
              onClick={() => {
                console.log('[ReturnRequest] Click reject button', record);
                openModal('reject', record.id);
              }}
            >
              Từ chối
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <Card title="Yêu cầu hoàn/đổi hàng">
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
      <Modal
        title={modalType === 'approve' ? 'Phê duyệt yêu cầu' : 'Từ chối yêu cầu'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={modalType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        cancelText="Hủy"
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Input.TextArea
          rows={4}
          placeholder={modalType === 'approve' ? 'Ghi chú phản hồi (tùy chọn)' : 'Lý do từ chối (tùy chọn)'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Modal>
    </Card>
  );
};

export default StaffReturnRequestsPage;

