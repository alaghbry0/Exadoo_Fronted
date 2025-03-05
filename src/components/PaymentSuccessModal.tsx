// components/PaymentSuccessModal.tsx
'use client';
import React from 'react';
import { Button, Modal } from 'flowbite-react'; // أو أي مكتبة تستخدمها لإنشاء Modal

interface PaymentSuccessModalProps {
  inviteLink: string;
  message: string;
  onClose: () => void;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({ inviteLink, message, onClose }) => {
  return (
    <Modal show={true} onClose={onClose}>
      <Modal.Header>تمت معالجة الدفع بنجاح</Modal.Header>
      <Modal.Body>
        <p className="mb-4">{message}</p>
        <Button onClick={() => window.open(inviteLink, '_blank')}>
          انقر هنا للانضمام إلى القناة
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentSuccessModal;
