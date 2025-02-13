import { BlueTickIcon, CloseIcon } from '@/common/components/Icons';
import { Button, Modal, Typography } from 'antd';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface Props {
  type: any;
  isModalOpen: boolean;
  handleClose: () => void;
  handleCompleteTask: (type: any) => Promise<void>;
}

const ModalDoTask: React.FunctionComponent<Props> = ({ type, isModalOpen, handleClose, handleCompleteTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    switch (type) {
      case 'FOLLOW_TWITTER':
        setTitle('Follow Meso Finance Twitter');
        setDescription('Open X (Twitter) and Follow Meso Finance');
        break;
      case 'JOIN_DISCORD':
        setTitle('Join Meso Finance Discord');
        setDescription('Open Discord and Join Meso Finance');
        break;
    }
  }, [type]);

  return (
    <Modal
      className={'modal-customize'}
      centered
      visible={isModalOpen}
      footer={false}
      title={
        <div className={'flex justify-between items-center'}>
          <Typography className={'font-bold text-xl'}>Follow Meso Finance</Typography>
          <div onClick={() => handleClose()} className={'cursor-pointer'}>
            <CloseIcon />
          </div>
        </div>
      }
      onCancel={handleClose}
      width={380}
      closable={false}
    >
      <div className={'flex flex-col items-center'}>
        <div className={'text-2xl text-[#272B50] font-bold'}>{title}</div>
        <div className={'text-base text-[#7B8AB1] mt-2'}>{description}</div>
        {type == 'FOLLOW_TWITTER' ? (
          <div
            className={
              'w-full border-[0.5px] border-[#CFDAE5] rounded-[16px] flex items-center justify-center gap-4 my-6 px-6 py-4'
            }
          >
            <Image className={''} src={require('@/common/assets/images/points/meso-logo.png')} alt={''} />
            <div>
              <div className={'flex items-center text-xl text-[#0F1419] font-bold gap-1'}>
                Meso Finance <BlueTickIcon />
              </div>
              <div className={'text-base text-[#536471]'}>@Meso_Finance</div>
            </div>
          </div>
        ) : (
          <div
            className={
              'w-full border-[0.5px] border-[#CFDAE5] rounded-[16px] flex flex-col items-center justify-center gap-4 mb-6 px-6 py-4'
            }
          >
            <div className={'relative w-fit'}>
              <Image className={''} src={require('@/common/assets/images/points/meso-logo.png')} alt={''} />
              <Image
                className={'absolute bottom-0 right-0 w-[24px] h-[24px]'}
                src={require('@/common/assets/images/points/small-discord-icon.png')}
                alt={''}
              />
            </div>
            <div>
              <div className={'flex items-center text-xl text-[#0F1419] font-bold gap-1'}>Meso Finance</div>
            </div>
          </div>
        )}
        <Button
          onClick={() => {
            if (type == 'FOLLOW_TWITTER') {
              window.open('https://x.com/Meso_Finance', '_blank');
            } else {
              window.open('https://meso.finance/discord', '_blank');
            }
          }}
          style={{
            boxShadow:
              ' 0px 1px 2px 0px rgba(0, 0, 0, 0.03), 0px 1px 6px -1px rgba(0, 0, 0, 0.02), 0px 2px 4px 0px rgba(0, 0, 0, 0.02)',
          }}
          className={'w-full h-[48px] bg-[#2458F6] rounded-[8px] text-white text-base font-medium px-6'}
        >
          {type == 'FOLLOW_TWITTER' ? 'Follow Twitter' : 'Join Discord'}
        </Button>
      </div>
    </Modal>
  );
};

export default ModalDoTask;
