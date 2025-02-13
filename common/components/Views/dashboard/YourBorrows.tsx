import { CircleInfo, CircleInfoBlue } from '@/common/components/Icons';
import ModalEnableEMode from '@/common/components/Modals/ModalEnableEMode';
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets';
import { AssetRowItem } from '@/common/components/Views/asset/AssetRowItem';
import { BorrowingPowerProgress } from '@/common/components/Views/dashboard/BorrowingPowerProgress';
import { AssetRowType } from '@/common/components/Views/dashboard/YourSupplies';
import { useAssets } from '@/common/hooks/assets/useAssets';
import { useDashboard } from '@/common/hooks/dashboard/useDashboard';
import { useModal } from '@/common/hooks/useModal';
import useUser from '@/common/hooks/useUser';
import { formatNumberBalance, paginate } from '@/utils';
import { Card, Col, Pagination, PaginationProps, Popover, Row, Switch, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

interface Props {
  setAssetSelected: (value: PoolAsset) => void;
  setMode: (value: ManageAssetMode | AssetRowType) => void;
}

export enum EMODE_NAME {
  APT = 'APT',
  USD = 'USD',
}

export const YourBorrows: React.FunctionComponent<Props> = ({ setAssetSelected, setMode }) => {
  const { assetDebts } = useAssets();
  const [totalBorrow, setTotalBorrow] = useState(0);
  const [totalBorrowApr, setTotalBorrowApr] = useState(0);
  const { userEMode } = useUser();
  const { borrowPower } = useDashboard();
  const { show, setShow, toggle } = useModal();
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    let totalBr = 0;
    let totalApr = 0;
    let balance = 0;
    for (const item of assetDebts) {
      totalBr += item.debtAmount * item?.token?.price;
      totalApr += (item.borrowApy + -item.incentiveBorrowApy) * (item.debtAmount * item?.token?.price);
      balance += item.walletBalance * item?.token?.price;
    }
    setTotalBorrowApr(totalApr / totalBr);
    setTotalBorrow(totalBr);
  }, [assetDebts]);

  const handleClick = () => {
    setShow(true);
  };

  const onChange: PaginationProps['onChange'] = (page) => {
    setCurrent(page);
  };

  const assets = useMemo(() => paginate(assetDebts, current, 10), [assetDebts, current]);

  const emodeName = useMemo(() => {
    if (userEMode.includes('aptos')) {
      return EMODE_NAME.APT;
    }
    if (userEMode.includes('USD')) {
      return EMODE_NAME.USD;
    }
  }, [userEMode]);

  return (
    <Col xs={24} xl={12}>
      <Card className={' h-full rounded-[8px]'}>
        <div className={'flex flex-col h-auto sm:h-full'}>
          <div className={'p-4'}>
            <Typography className={'text-[#090909] font-medium text-lg'}>Your Borrows</Typography>
            <Row gutter={[16, 16]} className={'mt-2'}>
              <Col xs={24} xl={9}>
                <BorrowingPowerProgress borrowPower={Number(borrowPower)} width={4} height={20} />
              </Col>
              <Col xs={8} xl={6}>
                <Typography className={'text-[#5D6B98] font-medium'}>Borrowed</Typography>
                <div className={'text-[#404968] font-semibold text-sm sm:text-base mt-1'}>
                  ${formatNumberBalance(totalBorrow, 2)}
                </div>
              </Col>
              <Col xs={8} xl={5}>
                <Typography className={'text-[#5D6B98] font-medium'}>APR</Typography>
                <div className={'text-[#404968] font-semibold text-sm sm:text-base mt-1'}>
                  {formatNumberBalance(totalBorrowApr, 2)}%
                </div>
              </Col>
              <Col xs={8} xl={4}>
                <div className={'flex items-center gap-1'}>
                  <Typography className={'text-[#5D6B98] font-medium'}>E - Mode</Typography>
                  <Popover
                    content={
                      <div className={'p-3 sm:p-4 max-w-[250px] sm:max-w-[330px]'}>
                        <div className={'flex gap-2'}>
                          <div>
                            <CircleInfoBlue />
                          </div>
                          <div>
                            <Typography className={'text-[#2458F6] font-bold'}>Efficiency Mode</Typography>
                            <p className={'text-[#2458F6] mt-2'}>
                              Efficiency Mode maximizes your LTV on selected assets by up to 93%
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <div className={'cursor-pointer'}>
                      <CircleInfo />
                    </div>
                  </Popover>
                </div>
                <div className={'flex items-center gap-1 mt-1'}>
                  <Switch onClick={handleClick} checked={userEMode !== ''} className={` ${emodeName}`} />
                  {emodeName && (
                    <span className={'text-[#5D6B98] font-medium'}>
                      {emodeName === EMODE_NAME.USD ? 'Stable' : 'APT'}
                    </span>
                  )}
                </div>
              </Col>
            </Row>
          </div>
          <Row
            className={
              'justify-between items-start bg-[#F9F9FB] hidden sm:flex px-4 py-3 border-b border-t border-[#DCDFEA]'
            }
          >
            <Col xs={24} xl={6} className={'items-center text-[#62758A] font-medium'}>
              <Typography className={'px-4'}>Assets</Typography>
            </Col>
            <Col xl={6} className={'min-w-[100px] text-end flex-1 text-[#62758A] font-medium'}>
              <Typography className={'px-4'}>Debt</Typography>
            </Col>
            <Col xl={6} className={'min-w-[100px] text-end flex-1 text-[#62758A] font-medium'}>
              <Typography className={'px-4'}>APR</Typography>
            </Col>
            <Col xs={24} xl={6} className={'flex items-center gap-2'}></Col>
          </Row>
          {assets.total > 0 && (
            <div className={'flex flex-col'}>
              {assets.items.map((item, index) => {
                return (
                  <AssetRowItem
                    assetAmountLabel={'Debt'}
                    assetMode={AssetRowType.REPAY}
                    key={index}
                    item={item}
                    assetAmount={item.debtAmount}
                    setMode={setMode}
                    setAssetSelected={setAssetSelected}
                  />
                );
              })}
            </div>
          )}
          {assets.total > 10 && (
            <div className={'flex justify-end pb-5'}>
              <Pagination
                size={'default'}
                className={'mt-5'}
                current={current}
                onChange={onChange}
                total={assets.total}
                showSizeChanger={false}
              />
            </div>
          )}
          {assetDebts.length === 0 && <div className={'p-4 text-[#62758A]'}>No Borrow</div>}
        </div>
      </Card>
      {show && <ModalEnableEMode isModalOpen={show} handleClose={toggle} />}
    </Col>
  );
};
