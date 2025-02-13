import { Computer } from '@/common/components/Icons';
import { PairInfo } from '@/common/components/Views/strategies/PairInfo';
import { ModalLoop } from '@/common/hooks/strategies/ModalLoop';
import { useModal } from '@/common/hooks/useModal';
import appActions from '@/modules/app/actions';
import { formatNumberBalance, nFormatter } from '@/utils';
import { Strategy, StrategyType } from '@/utils/stategies';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button, Card, Col, Row, Typography } from 'antd';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

interface Props {
  strategies: Strategy[];
}

export const StrategiesMobile: React.FunctionComponent<Props> = ({ strategies }) => {
  const [pairSelected, setPairSelected] = useState<Strategy | null>(null);
  const { connected } = useWallet();
  const { show, setShow, toggle } = useModal();

  const dispatch = useDispatch();

  const showModalLoop = (pair: Strategy) => {
    if (!connected) {
      dispatch(appActions.SET_SHOW_CONNECT(true));
      return;
    }
    setPairSelected(pair);
    setShow(true);
  };
  return (
    <Row className={'mt-8 flex md:hidden'} gutter={[16, 16]}>
      {strategies.map((pair, index) => {
        return (
          <Col key={index} xs={24} sm={12}>
            <Card className={'border border-[#E4E7EC] rounded-[16px]'} bordered={false}>
              <div className={'p-5 flex justify-between border-b border-[#E4E7EC]'}>
                <PairInfo pair={pair} />
                <div className={'flex items-center gap-2'}>
                  <div>
                    <div className={'border border-[#B692F6] bg-[#fff] rounded'}>
                      <Computer />
                    </div>
                  </div>
                  <div className={'text-[#039855] font-semibold border-b border-dashed border-[#039855]'}>
                    {formatNumberBalance(pair.maxApr)}%
                  </div>
                </div>
              </div>
              <div className={'p-5'}>
                <div className={'flex justify-between items-center'}>
                  <Typography className={'text-[#667085] font-medium'}>Type</Typography>
                  <div>
                    {pair.type === StrategyType.LSD && (
                      <span className={'bg-[#F9F5FF] py-[4px] px-2 text-xs text-[#6941C6] font-medium rounded-[16px]'}>
                        LSD
                      </span>
                    )}
                    {pair.type === StrategyType.STABLE && (
                      <span className={'bg-[#EFF8FF] py-[4px] px-2 text-xs text-[#175CD3] font-medium rounded-[16px]'}>
                        Stable
                      </span>
                    )}
                  </div>
                </div>
                <div className={'flex justify-between items-center mt-5'}>
                  <Typography className={'text-[#667085] font-medium'}>Liquidity Available</Typography>
                  <div>${nFormatter(pair.totalAvailable)}</div>
                </div>
                <div className={'mt-8'}>
                  {pair.amountDeposited > 0 ? (
                    <Button
                      onClick={() => showModalLoop(pair)}
                      className={
                        'bg-[#F9F5FF] rounded-full w-full text-[#6941C6] min-w-[120px] border-0 font-semibold h-10'
                      }
                    >
                      Detail
                    </Button>
                  ) : (
                    <Button
                      disabled={pair.totalAvailable === 0}
                      onClick={() => showModalLoop(pair)}
                      className={
                        'bg-[#7F56D9] disabled:bg-[#ccc] w-full  rounded-full text-[#fff] min-w-[120px] font-semibold h-10'
                      }
                    >
                      Start
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
      {show && <ModalLoop pair={pairSelected!} isModalOpen={show} handleClose={toggle} />}
    </Row>
  );
};
