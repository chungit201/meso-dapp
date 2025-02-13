import { CloseIcon } from '@/common/components/Icons';
import { getData } from '@/common/hooks/useLocalStoragre';
import useUser, { LOGIN_TYPE } from '@/common/hooks/useUser';
import { addPromotionCode } from '@/common/services/points';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Modal, Typography, notification } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  handleClose: () => void;
  isModalOpen: boolean;
}

export const ModalPromationCode: React.FunctionComponent<Props> = ({ isModalOpen, handleClose }) => {
  const [code, setCode] = useState('');
  const isLogin = useSelector((state: any) => state.app.isLogin);
  const { account } = useWallet();
  const accessToken = useMemo(() => getData('accessToken'), [account, isLogin]);
  const { handleLogin, refetchUserInfo } = useUser();

  useEffect(() => {
    setCode('');
  }, [isModalOpen]);

  const { isPending, mutate: add } = useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        const res = await handleLogin(LOGIN_TYPE.PROMOTION);
        if (!res) {
          return;
        }
      }
      return await addPromotionCode(code);
    },
    onSuccess: (res: any) => {
      if (res.status === 201) {
        notification.success({ message: 'Code is applied successfully' });
        refetchUserInfo();
        handleClose();
      } else {
        notification.error({ message: res.data.message || 'Something went wrong.' });
      }
    },
    onError: (error: any) => {
      console.log('error', error);
      notification.error({ message: error?.response?.data?.message || 'Something went wrong.' });
    },
  });

  return (
    <Modal centered onCancel={handleClose} visible={isModalOpen} footer={false} closable={false} width={450}>
      <div className={'p-5'}>
        <div className={'flex justify-between'}>
          <div className={'w-[25px] h-[25px]'}></div>
          <Typography className={'text-[#101828] text-lg font-semibold text-center'}>Enter promotion code</Typography>
          <div onClick={handleClose} className={'cursor-pointer'}>
            <CloseIcon />
          </div>
        </div>
        <div className={'flex justify-center'}>
          <Image className={'w-[250px] h-auto'} src={require('@/common/assets/images/image 11.png')} alt={''} />
        </div>
        <div>
          <div>Promotion Code</div>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={'Enter Promotion Code'}
            className={'border-[#D0D5DD] mt-1 rounded-[8px] h-11'}
          />
        </div>
        <Button
          disabled={isPending || code === ''}
          loading={isPending}
          onClick={() => add()}
          className={'border-0 bg-[#7F56D9] disabled:bg-[#ccc] w-full mt-5 rounded-full h-11 text-[#fff]'}
        >
          Join Invite
        </Button>
        <div className={'text-center mt-3'}>
          <Link
            className={'text-[#475467] font-semibold'}
            target={'_blank'}
            href={'https://open.substack.com/pub/mesofinance/p/point-system-released-earn-double'}
          >
            What is Promotion code?
          </Link>
        </div>
      </div>
    </Modal>
  );
};
