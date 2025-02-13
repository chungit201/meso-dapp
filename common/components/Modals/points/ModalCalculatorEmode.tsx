import { CircleInfo, CloseIcon } from '@/common/components/Icons';
import { EMODE_NAME } from '@/common/components/Modals/ModalEnableEMode';
import { MESO_ADDRESS } from '@/common/consts';
import { AssetsContext } from '@/common/context';
import useContract from '@/common/hooks/useContract';
import { setData } from '@/common/hooks/useLocalStoragre';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal, Select, Skeleton } from 'antd';
import React, { useContext, useEffect, useMemo, useState } from 'react';

interface Props {
  isModalOpen: boolean;
  handleClose: () => void;
  userEMode?: string;
  setUserEMode: (val: string) => void;
}

export const ModalCalculatorEmode: React.FunctionComponent<Props> = ({
  isModalOpen,
  handleClose,
  userEMode = '',
  setUserEMode,
}) => {
  const [modeKey, setModeKey] = useState('');
  const { view } = useContract();
  const { allAssetsData } = useContext(AssetsContext);

  const { data: emodeKeys = [] } = useQuery({
    queryKey: ['emodeKeys', MESO_ADDRESS],
    queryFn: async () => {
      const res = await view({
        function: `${MESO_ADDRESS}::meso::emode_keys`,
        typeArguments: [],
        functionArguments: [],
      });
      return res[0] as string[];
    },
  });

  const options = useMemo(() => {
    return emodeKeys.map((key: string) => ({
      value: key,
      label: (
        <div className={'py-3'}>{key.includes('0x1::aptos_coin::AptosCoin') ? EMODE_NAME.APT : EMODE_NAME.STABLE}</div>
      ),
    }));
  }, [emodeKeys]);

  const { data: assetsModeAvailable = [], isFetching } = useQuery({
    queryKey: ['AssetModeAvailable', modeKey, allAssetsData],
    queryFn: async () => {
      return allAssetsData.filter((x) => x.emodeId === modeKey);
    },
    enabled: !!modeKey,
  });

  useEffect(() => {
    if (emodeKeys.length > 0) {
      setModeKey(emodeKeys[0]);
    }
  }, [emodeKeys]);

  const handleChange = (value: EMODE_NAME) => {
    console.log(`selected ${value}`);
    setModeKey(value);
  };

  const handleEnableEMode = () => {
    setData('emodeCalculator', modeKey);
    setUserEMode(modeKey);
    handleClose();
  };

  const disableEmode = () => {
    setUserEMode('');
    setData('emodeCalculator', '');
  };

  return (
    <Modal
      centered
      onCancel={() => {
        handleClose();
      }}
      closable={false}
      open={isModalOpen}
      title={
        <div className={'flex justify-between items-center'}>
          <div className={'flex items-center text-xl text-[#1A2A3B] gap-3'}>Efficiency mode</div>
          <div onClick={handleClose} className={'cursor-pointer'}>
            <CloseIcon />
          </div>
        </div>
      }
      footer={false}
      width={483}
    >
      <div className={'px-5 pb-5'}>
        <div>
          <div className={'text-[#62758A] mt-4'}>Asset category</div>
          {!userEMode && (
            <>
              <Select
                value={modeKey as any}
                placeholder={'Select category'}
                className={'w-full mt-2 h-12'}
                onChange={handleChange}
                options={options}
              />
              <div className={' mt-5 rounded-[12px]'}>
                <div className={'text-[#62758A] mb-2'}>Available assets</div>
                {!isFetching && (
                  <div className={'flex items-center gap-1'}>
                    {assetsModeAvailable.map((item, index) => (
                      <span
                        key={index}
                        className={'border flex items-center gap-1 px-2 py-[2px] border-[#ECF0FE] rounded-full'}
                      >
                        <div>
                          <img
                            className={'w-[15px] h-auto'}
                            src={`https://image.meso.finance/${item.token?.symbol.toLowerCase()}.png`}
                            alt={''}
                          />
                        </div>
                        <span className={'font-medium'} key={item.token.symbol}>
                          {item.token.symbol}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
                {isFetching && <Skeleton.Button className={'w-full h-[22px]'} />}
              </div>
            </>
          )}
          {userEMode && emodeKeys[0] === userEMode && (
            <div className={'mt-2 text-lg text-[#1A2A3B] font-semibold'}>{EMODE_NAME.APT}</div>
          )}
          {userEMode && emodeKeys[1] === userEMode && (
            <div className={'mt-2 text-lg text-[#1A2A3B] font-semibold'}>{EMODE_NAME.STABLE}</div>
          )}
        </div>

        {!userEMode && (
          <Button
            onClick={handleEnableEMode}
            className={
              'bg-[#7F56D9] rounded-full w-full disabled:bg-[#ccc] text-[#fff] border-0 font-semibold h-10 mt-6'
            }
          >
            Enable E-Mode
          </Button>
        )}
        {userEMode && (
          <Button
            onClick={disableEmode}
            className={'bg-[#7F56D9] rounded-full w-full text-[#fff] border-0 font-semibold h-10 mt-6'}
          >
            Disable E-Mode
          </Button>
        )}
        <div className={'flex gap-2 items-start text-[#667085] mt-4'}>
          <CircleInfo />
          <p>This is just a simulation for calculation purposes and does not affect your loans.</p>
        </div>
      </div>
    </Modal>
  );
};
