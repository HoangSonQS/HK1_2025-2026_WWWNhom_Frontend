import React, { useEffect } from 'react';
import { Modal, Form, Input, Checkbox, Button, message } from 'antd';
import { adminSupplierService } from '../../../features/supplier/api/adminSupplierService';
import { staffSupplierService } from '../../../features/supplier/api/staffSupplierService';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

const { TextArea } = Input;

const SupplierModal = ({ isOpen, onClose, onSubmit, supplier, mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith('/staff');
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && supplier) {
        // Load dữ liệu supplier vào form
        form.setFieldsValue({
          name: supplier.name || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          isActive: supplier.isActive !== undefined ? supplier.isActive : true
        });
      } else {
        // Reset form cho mode thêm mới
        form.resetFields();
      }
    }
  }, [isOpen, supplier, mode, form, isEditMode]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const service = isStaffRoute ? staffSupplierService : adminSupplierService;
      const formData = {
        name: values.name,
        email: values.email || '',
        phone: values.phone || '',
        address: values.address || '',
        isActive: values.isActive !== undefined ? values.isActive : true
      };

      if (isEditMode) {
        await service.updateSupplier(supplier.id, formData);
        message.success('Cập nhật nhà cung cấp thành công!');
      } else {
        await service.createSupplier(formData);
        message.success('Thêm nhà cung cấp thành công!');
      }

      form.resetFields();
      onSubmit(formData);
    } catch (err) {
      console.error('Error submitting supplier:', err);
      if (err.response?.status === 401) {
        message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate(isStaffRoute ? ROUTES.STAFF_LOGIN : ROUTES.ADMIN_LOGIN, { replace: true });
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
    onClose();
  };

  return (
    <Modal
      title={isEditMode ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        name="supplierForm"
        onFinish={handleSubmit}
        layout="vertical"
        autoComplete="off"
        initialValues={{
          isActive: true
        }}
      >
        <Form.Item
          name="name"
          label="Tên nhà cung cấp"
          rules={[
            { required: true, message: 'Vui lòng nhập tên nhà cung cấp!' },
            { min: 2, message: 'Tên nhà cung cấp phải có ít nhất 2 ký tự!' }
          ]}
        >
          <Input
            size="large"
            placeholder="Nhập tên nhà cung cấp"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input
            size="large"
            placeholder="Nhập email"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' }
          ]}
        >
          <Input
            size="large"
            placeholder="Nhập số điện thoại"
          />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <TextArea
            rows={3}
            placeholder="Nhập địa chỉ"
          />
        </Form.Item>

        {isEditMode && (
          <Form.Item
            name="isActive"
            valuePropName="checked"
          >
            <Checkbox>Đang hoạt động</Checkbox>
          </Form.Item>
        )}

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
              {loading ? (isEditMode ? 'Đang cập nhật...' : 'Đang thêm...') : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SupplierModal;
