import { CloseIcon, SearchIcon } from '@/common/components/Icons';
import { AssetsContext } from '@/common/context';
import { ASSETS_MODE } from '@/pages/calculator';
import { formatNumberBalance } from '@/utils';
import { Input, Modal, Typography } from 'antd';
import Image from 'next/image';
import React, { useContext, useEffect, useMemo, useState } from 'react';

interface Props {
  mode?: ASSETS_MODE;
  isModalOpen: boolean;
  handleClose: () => void;
  setAssets: any;
  assetsSelected?: PoolAsset[];
  userEMode?: string;
}

export const ModalSelectAssets: React.FunctionComponent<Props> = ({
  isModalOpen,
  handleClose,
  setAssets,
  assetsSelected,
  mode = ASSETS_MODE.SUPPLY,
  userEMode = '',
}) => {
  const [pools, setPools] = useState<PoolAsset[]>([]);
  const { allAssetsData } = useContext(AssetsContext);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setPools(allAssetsData);
  }, [allAssetsData]);

  useEffect(() => {
    setSearch('');
  }, [isModalOpen]);

  const filterToken = (value: string) => (item: any) => {
    const array = [item.token.name, item.token.symbol, item.token.address];
    return array.some((item?: string) => item?.toLowerCase().includes(value.trim().toLowerCase()));
  };

  const existingIds = assetsSelected?.map(function (item) {
    return item.poolAddress;
  });

  const filterData = useMemo(() => {
    let data = pools;
    data = data.filter(function (item) {
      return existingIds?.indexOf(item.poolAddress) === -1;
    });
    data = data.filter(filterToken(search));
    if (mode === ASSETS_MODE.BORROW && userEMode) {
      data = data.sort((a, b) => (a.emodeId === userEMode ? -1 : 1));
    }
    return data;
  }, [pools, search, assetsSelected, userEMode, mode]);

  return (
    <Modal
      centered
      onCancel={() => {
        handleClose();
      }}
      open={isModalOpen}
      footer={false}
      closable={false}
      title={false}
      width={400}
    >
      <div className={'p-4'}>
        <div className={'flex items-center justify-between gap-3'}>
          <Typography className={'text-[#191D21] flex gap-1 text-lg font-semibold'}>Select a Assets</Typography>
          <div className={'flex items-center gap-2'}>
            <div onClick={handleClose} className={'cursor-pointer'}>
              <CloseIcon />
            </div>
          </div>
        </div>
        <div className={'mt-4'}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<SearchIcon />}
            placeholder={'Search an assets'}
            className={'h-10 border placeholder:text-[#667085] border-[#D0D5DD] rounded-xl'}
          />
        </div>
        <div className={'mt-6 flex flex-col gap-2 min-h-[400px] max-h-[400px] overflow-y-auto p-1'}>
          {filterData.map((item, index) => {
            return (
              <div
                onClick={() => {
                  setAssets((prevItems: any) => [
                    ...prevItems,
                    { ...item, normaBps: item.token.symbol === 'APE' ? 500 : item.normaBps },
                  ]);
                  handleClose();
                }}
                className={`flex cursor-pointer justify-between items-center ${
                  userEMode &&
                  userEMode !== item.emodeId &&
                  mode === ASSETS_MODE.BORROW &&
                  'opacity-20 pointer-events-none'
                }`}
                key={index}
              >
                <div className={'flex items-center gap-2 py-2'}>
                  <div>
                    <img
                      className={'w-[28px] h-auto'}
                      src={`https://image.meso.finance/${item?.token.symbol.toLowerCase()}.png`}
                      alt={''}
                    />
                  </div>
                  <div>
                    <div className={'text-[#101828] font-medium'}>{item.token.symbol}</div>
                    <div className={'text-[#667085] text-xs'}>{item.token.name}</div>
                  </div>
                </div>
                <span className={'text-[#667085]'}>${formatNumberBalance(item.token.price, 4)}</span>
              </div>
            );
          })}
          {filterData.length === 0 && (
            <div className={'flex items-center justify-center min-h-[400px] max-h-[400px]'}>
              <div className={'text-center  mb-10'}>
                <Image src={require('@/common/assets/images/no-item.png')} alt={''} />
                <div className={'text-[#D0D5DD]'}>No token found</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
