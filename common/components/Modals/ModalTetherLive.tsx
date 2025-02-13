import { CloseIcon } from '@/common/components/Icons';
import { Button, Modal } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

interface Props {
  isModalOpen: boolean;
  handleClose: () => void;
}

export const ModalTetherLive: React.FunctionComponent<Props> = ({ isModalOpen, handleClose }) => {
  const router = useRouter();
  const gotoRedeem = () => {
    router.push('/convert');
    handleClose();
  };

  return (
    <Modal
      centered
      onCancel={() => {
        handleClose();
      }}
      closable={false}
      open={isModalOpen}
      footer={false}
      width={420}
    >
      <div onClick={handleClose} className={'cursor-pointer absolute top-3 right-3'}>
        <CloseIcon />
      </div>
      <div className={'px-5 pt-5 pb-8'}>
        <div className={'flex justify-center'}>
          <Image className={'w-[200px] h-auto'} src={require('@/common/assets/images/USDC-convert.png')} alt={''} />
        </div>
        <div className={'text-center mt-3'}>
          <h1 className={'text-[#101828] font-semibold text-xl'}>USDC is live on Meso Finance!</h1>
          <p className={'text-[#475467] mt-2'}>Convert your zUSDC to USDC instantly at a 1:1 rate with Zero Fees.</p>
        </div>
        <div className={'flex justify-center mt-5'}>
          <Button onClick={gotoRedeem} className={'border-0 bg-[#7F56D9] text-[#fff] rounded-full'}>
            Start now
          </Button>
        </div>
      </div>
    </Modal>
  );
};
