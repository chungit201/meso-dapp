import { Computer } from '@/common/components/Icons';
import { PairInfo } from '@/common/components/Views/strategies/PairInfo';
import { useDashboard } from '@/common/hooks/dashboard/useDashboard';
import { ModalLoop } from '@/common/hooks/strategies/ModalLoop';
import { useModal } from '@/common/hooks/useModal';
import appActions from '@/modules/app/actions';
import { formatNumberBalance, nFormatter } from '@/utils';
import { Strategy, StrategyType } from '@/utils/stategies';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button, Col, Row } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';

interface Props {
  pair: Strategy;
}

export const StrategiesRowItem: React.FunctionComponent<Props> = ({ pair }) => {
  const { show, setShow, toggle } = useModal();
  const { connected } = useWallet();
  const { netApr } = useDashboard();

  const dispatch = useDispatch();

  const showModalLoop = () => {
    if (!connected) {
      dispatch(appActions.SET_SHOW_CONNECT(true));
      return;
    }
    setShow(true);
  };

  return (
    <>
      <Row>
        <Col className={'p-5 strategies-item'} span={5}>
          <PairInfo pair={pair} />
        </Col>
        <Col className={'flex items-center p-5 strategies-item'} span={2}>
          {pair.type === StrategyType.LSD && (
            <span className={'bg-[#F9F5FF] py-[4px] px-2 text-xs text-[#6941C6] font-medium rounded-[16px]'}>LSD</span>
          )}
          {pair.type === StrategyType.STABLE && (
            <span className={'bg-[#EFF8FF] py-[4px] px-2 text-xs text-[#175CD3] font-medium rounded-[16px]'}>
              Stable
            </span>
          )}
        </Col>
        <Col className={'p-5 strategies-item flex items-center'} span={2}>
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
        </Col>
        <Col className={'flex p-5 strategies-item items-center'} span={3}>
          <div>${nFormatter(pair.totalAvailable)}</div>
        </Col>
        <Col className={'flex p-5 strategies-item items-center'} span={3}>
          {pair.amountDeposited ? (
            <div className={'text-gradient font-semibold'}>{nFormatter(netApr, 4)}%</div>
          ) : (
            <div className={''}>-</div>
          )}
        </Col>

        <Col className={'flex p-5 strategies-item items-center'} span={3}>
          {pair.totalSupplied > 0 ? (
            <div>
              {formatNumberBalance(pair.totalSupplied, 3)} {pair.asset0.token.symbol}
            </div>
          ) : (
            <div className={''}>-</div>
          )}
        </Col>
        <Col className={'flex p-5 strategies-item items-center'} span={3}>
          {pair.totalDebt > 0 ? (
            <div>
              {formatNumberBalance(pair.totalDebt, 3)} {pair.asset1.token.symbol}
            </div>
          ) : (
            <div className={''}>-</div>
          )}
        </Col>
        <Col className={'flex p-5 strategies-item justify-center items-center'} span={3}>
          {pair.amountDeposited ? (
            <Button
              onClick={showModalLoop}
              className={'bg-[#F9F5FF] rounded-full text-[#6941C6] min-w-[120px] border-0 font-semibold h-10'}
            >
              Detail
            </Button>
          ) : (
            <Button
              disabled={pair.totalAvailable === 0}
              onClick={showModalLoop}
              className={'bg-[#7F56D9] disabled:bg-[#ccc] rounded-full text-[#fff] min-w-[120px] font-semibold h-10'}
            >
              Start
            </Button>
          )}
        </Col>
      </Row>
      {show && <ModalLoop pair={pair} isModalOpen={show} handleClose={toggle} />}
    </>
  );
};
