import { CloseIcon } from '@/common/components/Icons';
import { ManageAssetMode, ModalManageAssets } from '@/common/components/Modals/ModalManageAssets';
import { MAX_BPS, MESO_ADDRESS } from '@/common/consts';
import { AssetsContext } from '@/common/context';
import { useAssets } from '@/common/hooks/assets/useAssets';
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback';
import useContract from '@/common/hooks/useContract';
import useUser from '@/common/hooks/useUser';
import appActions from '@/modules/app/actions';
import { formatNumberBalance } from '@/utils';
import { emodeWarming } from '@/utils/warning';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, Modal, Row, Select, Skeleton, Typography } from 'antd';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  isModalOpen: boolean;
  handleClose: () => void;
}

export enum EMODE_NAME {
  APT = 'APT correlated',
  STABLE = 'Stable correlated',
}

export const ModalEnableEMode: React.FunctionComponent<Props> = ({ isModalOpen, handleClose }) => {
  const { refetchAllAssetData, allAssetsData } = useContext(AssetsContext);
  const { userEMode, refetchUserEmode } = useUser();
  const { assetDebts, assetDeposits } = useAssets();
  const transactionCallback = useTransactionCallback();
  const [modeKey, setModeKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [assetsCanRepay, setAssetsCanRepay] = useState<PoolAsset[]>([]);
  const [assetRepaySelected, setAssetRepaySelected] = useState<PoolAsset | null>(null);
  const { view } = useContract();
  const app = useSelector((state: any) => state.app);
  const dispatch = useDispatch();

  const handleChange = (value: EMODE_NAME) => {
    console.log(`selected ${value}`);
    setModeKey(value);
  };

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

  const options = useMemo(() => {
    return emodeKeys.map((key: string) => ({
      value: key,
      label: (
        <div className={'py-3'}>{key.includes('0x1::aptos_coin::AptosCoin') ? EMODE_NAME.APT : EMODE_NAME.STABLE}</div>
      ),
    }));
  }, [emodeKeys]);

  //handle warning when enable or disable E-Mode
  const warning = useMemo(() => {
    if (!modeKey) return '';
    if (assetDebts.length === 0) return '';
    if (assetDeposits.length === 0) return '';

    if (!userEMode) {
      const assetNotAvailable = assetDebts.find((x) => x.emodeId !== modeKey);
      if (assetNotAvailable) {
        setAssetsCanRepay(assetDebts.filter((x) => x.emodeId !== modeKey));
        return emodeWarming.Enable;
      }
    } else {
      let totalSupply = 0;
      let totalDebt = 0;
      let totalBorrowDisabledEmodeAvailable = 0;

      for (const asset of assetDeposits) {
        totalSupply += asset.amountDeposit * asset.token.price;
        totalBorrowDisabledEmodeAvailable += asset.amountDeposit * asset.token.price * (asset.normaBps / MAX_BPS);
      }
      for (const asset of assetDebts) {
        totalDebt += asset.debtAmount * asset.token.price;
      }
      if (totalDebt > totalBorrowDisabledEmodeAvailable) {
        setAssetsCanRepay(assetDebts);
        return emodeWarming.Disable;
      }
    }
    return '';
  }, [emodeKeys, assetDebts, modeKey, assetDeposits]);

  const handleEnable = async () => {
    try {
      transactionCallback({
        payload: {
          function: `${MESO_ADDRESS}::meso::enable_emode`,
          typeArguments: [],
          functionArguments: [modeKey.toString()],
        },
        onSuccess(hash: string) {
          console.log('hash', hash);
          setTimeout(() => {
            refetchUserEmode();
            refetchAllAssetData();
          }, 1000);
        },
        setLoading,
      });
    } catch (e) {
      console.log('e', e);
    }
  };

  const handleDisable = async () => {
    try {
      transactionCallback({
        payload: {
          function: `${MESO_ADDRESS}::meso::disable_emode`,
          typeArguments: [],
          functionArguments: [],
        },
        onSuccess(hash: string) {
          setTimeout(() => {
            refetchUserEmode();
            refetchAllAssetData();
          }, 1000);
        },
        setLoading,
      });
    } catch (e) {
      console.log('e', e);
    }
  };

  const renderEmodeForm = () => (
    <div className={'px-5 pb-5'}>
      <div>
        {!warning && (
          <div className="bg-[#EDF1FF] bg-opacity-20 p-4 rounded-[12px] flex items-center gap-4">
            <div>
              <i className="fa-solid fa-circle-info text-[#2458F6]"></i>
            </div>
            <p className="text-[#7F56D9]">
              When activating E-Mode, solely assets falling under the specific categories are allowed to borrow.
            </p>
          </div>
        )}
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
            {!warning && (
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
            )}
          </>
        )}
        {userEMode && emodeKeys[0] === userEMode && (
          <div className={'mt-2 text-lg text-[#1A2A3B] font-semibold'}>{EMODE_NAME.APT}</div>
        )}
        {userEMode && emodeKeys[1] === userEMode && (
          <div className={'mt-2 text-lg text-[#1A2A3B] font-semibold'}>{EMODE_NAME.STABLE}</div>
        )}
      </div>
      {warning && (
        <div>
          <div className={'bg-[#ff83061a] bg-opacity-20 p-4 mt-5 rounded flex items-start gap-2'}>
            <div>
              <i className="fa-solid fa-circle-info text-base text-[#FF8306]"></i>
            </div>
            <p className={'text-[#FF8306] font-semibold'}>{warning}</p>
          </div>
          <Typography className={'text-[#62758A] mt-5'}>
            Repay the asset to {userEMode ? 'disable' : 'enable'} E-Mode
          </Typography>
          <div className={'border border-[#ECF0FE] mt-3 rounded-[8px]'}>
            <Row className={'bg-[#F9F9FB] rounded-tl-[8px] rounded-tr-[8px]  border border-[#ECF0FE] py-2 px-4'}>
              <Col span={7}>Asset</Col>
              <Col span={6}>Debt</Col>
              <Col span={6}>Min. Repay</Col>
              <Col span={5}></Col>
            </Row>
            <div className={'max-h-[200px] overflow-y-auto'}>
              {assetsCanRepay.map((item, index) => {
                let totalSupply = 0;
                const assetsDepositMode = assetDeposits.filter((x) => x.emodeId === userEMode);
                for (const asset of assetsDepositMode) {
                  totalSupply += asset.amountDeposit * asset.token.price;
                }
                const totalCanRepay = totalSupply - totalSupply * (item.normaBps / MAX_BPS);
                const mintRepay = userEMode ? totalCanRepay : item.debtAmount;
                return (
                  <Row key={index} className={'py-2 px-4'}>
                    <Col className={'flex items-center'} span={7}>
                      <div className={'flex items-center gap-2'}>
                        <img
                          className={'w-[25px]'}
                          src={`https://image.meso.finance/${item.token.symbol.toLowerCase()}.png`}
                          alt=""
                        />
                        <Typography className={'text-[#1A2A3B] font-semibold'}>{item.token.symbol}</Typography>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div>
                        <div className={'text-[#1A2A3B] font-semibold'}>{formatNumberBalance(item.debtAmount, 2)}</div>
                        <div className={'text-[#98A3C9] text-xs'}>
                          ${formatNumberBalance(item.debtAmount * item.token.price, 2)}
                        </div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div>
                        <div className={'text-[#1A2A3B] font-semibold'}>
                          {formatNumberBalance(userEMode ? mintRepay / item.token.price : mintRepay, 2)}
                        </div>
                        <div className={'text-[#98A3C9] text-xs'}>
                          ${formatNumberBalance(userEMode ? mintRepay : mintRepay * item.token.price, 2)}
                        </div>
                      </div>
                    </Col>
                    <Col span={5}>
                      <Button
                        onClick={() => {
                          setAssetRepaySelected(item);
                          dispatch(appActions.SET_MANAGE_ASSETS(true));
                        }}
                        className={
                          'w-full flex justify-center items-center border-[#7F56D9] gap-2 rounded-full text-[#7F56D9] font-semibold'
                        }
                      >
                        Repay
                        <i className="fa-solid fa-angle-right text-[#7F56D9] mt-1"></i>
                      </Button>
                    </Col>
                  </Row>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {!userEMode && (
        <Button
          loading={loading}
          disabled={loading || warning !== ''}
          onClick={handleEnable}
          className={'bg-[#7F56D9] w-full rounded-full h-11 disabled:bg-[#ccc] text-[#fff] border-0 font-semibold mt-8'}
        >
          Enable E-Mode
        </Button>
      )}
      {userEMode && (
        <Button
          onClick={handleDisable}
          loading={loading}
          disabled={warning !== '' || loading}
          className={'bg-[#7F56D9] w-full text-[#fff] rounded-full border-0 font-semibold h-11 mt-8'}
        >
          Disable E-Mode
        </Button>
      )}
    </div>
  );

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
      {renderEmodeForm()}
      <ModalManageAssets
        mode={ManageAssetMode.Repay}
        isModalOpen={app.showModalManageAssets}
        handleClose={() => {
          dispatch(appActions.SET_MANAGE_ASSETS(false));
        }}
        asset={assetRepaySelected!}
      />
    </Modal>
  );
};
export default ModalEnableEMode;
