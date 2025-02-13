import { CopyIcon, DocsIcon, ShareIcon } from '@/common/components/Icons';
import { StarIcon } from '@/common/components/Icons/points';
import { ModalPromationCode } from '@/common/components/Modals/points/ModalPromationCode';
import { useModal } from '@/common/hooks/useModal';
import useNetworkConfiguration from '@/common/hooks/useNetwork';
import { getTotalParticipants } from '@/common/services/points';
import appActions from '@/modules/app/actions';
import { copyToClipboard, ellipseAddress, formatNumberBalance } from '@/utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Col, Row, Tooltip } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

interface Props {
  userInfo: any;
}

export const PointsInfo: React.FunctionComponent<Props> = ({ userInfo }) => {
  const [copyText, setCopyText] = useState('Copy');

  const { show, setShow, toggle } = useModal();
  const { show: showPromotionCode, setShow: setShowPromotionCode, toggle: togglePromotionCode } = useModal();
  const { connected } = useWallet();
  const { networkCfg } = useNetworkConfiguration();

  const dispatch = useDispatch();

  const { data: totalParticipant } = useQuery({
    queryKey: ['totalParticipant'],
    queryFn: async () => {
      const { data } = await getTotalParticipants();
      return data;
    },
  });

  const scroll = () => {
    const task = document.getElementById('daily-task');
    if (task) {
      task.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const handleCopy = () => {
    setCopyText('Copied!');
    setTimeout(() => {
      setCopyText('Copy');
    }, 1000);
    copyToClipboard(userInfo.referralLink as any);
  };

  return (
    <div className={'sm:rounded-b-[80px] point-info h-full py-10 sm:py-20  px-2 '}>
      <Image
        className={'absolute w-full object-cover object-center h-full top-0 left-0'}
        src={require('@/common/assets/images/image 9.png')}
        alt={''}
      />
      <div className={'container max-w-[1200px] mx-auto px-3'}>
        <Row gutter={[32, 32]}>
          <Col xs={24} xl={12}>
            <h1 className={'text-[#000000] max-w-[350px] text-3xl sm:text-5xl font-semibold leading-[60px]'}>
              Meso Finance Points
            </h1>
            <p className={'mt-3'}>Complete daily tasks and accumulate Meso Finance points</p>
            <Link
              className={'flex mt-4 items-center gap-2 text-[#6941C6] font-medium'}
              target={'_blank'}
              href={'https://open.substack.com/pub/mesofinance/p/point-system-released-earn-double'}
            >
              <DocsIcon />
              View referral rules
            </Link>

            <div className={'flex items-center relative mt-10 gap-5'}>
              <div>
                <div className={'text-[#000000] text-xl font-semibold'}>
                  {userInfo?.rank ? `#${formatNumberBalance(userInfo.rank)}` : '--'}
                </div>
                <div>Your Rank</div>
              </div>
              <div className={'h-[24px] w-[1px]  bg-[#D0D5DD]'}></div>
              <div>
                <div className={'text-[#000000] text-xl font-semibold'}>
                  {formatNumberBalance(userInfo?.pointBalance, 2)}
                </div>
                <div>Your Point</div>
              </div>
              <div className={'h-[24px] w-[1px] bg-[#D0D5DD]'}></div>
              <div>
                <div className={'text-[#000000] text-xl font-semibold'}>{formatNumberBalance(totalParticipant, 0)}</div>
                <div>Total Participants</div>
              </div>
            </div>
          </Col>
          <Col xs={24} xl={12}>
            <Card
              bordered={false}
              className={'relative point-refer w-full border-0 flex flex-col max-w-[860px] p-3 sm:p-6 mx-auto gap-6'}
            >
              <div className={'relative z-20 rounded-[24px]'}>
                <Image
                  className={'w-full h-full absolute rounded-[16px] object-cover object-center'}
                  src={require('@/common/assets/images/Frame 1948755256.png')}
                  alt={''}
                />
                <div className={'flex flex-row relative z-50 gap-3  p-5'}>
                  <div className={'flex-1'}>
                    <div className={'text-xs sm:text-sm'}>You receive</div>
                    <span className={' flex items-center gap-1 rounded-full mt-2'}>
                      <span className={'text-[#6941C6] text-base sm:text-lg font-bold'}>
                        +{userInfo?.referralCommissionPercentage ?? 10}% points
                      </span>
                      <StarIcon />
                    </span>
                  </div>
                  <div className={'flex-1'}>
                    <div className={'text-xs sm:text-sm'}>Your friends receive</div>
                    <span className={' flex items-center gap-1 rounded-full mt-2'}>
                      <span className={'text-[#6941C6] text-base sm:text-lg font-bold'}>
                        +{userInfo?.referralCommissionPercentage ?? 10}% points
                      </span>
                      <StarIcon />
                    </span>
                  </div>
                </div>
              </div>
              <div className={'w-full flex flex-col mt-5 sm:flex-row gap-4 z-20'}>
                <div
                  className={
                    'px-4 py-6 text-base flex flex-col gap-3 sm:flex-row justify-between bg-[#F9FAFB] w-full rounded-[24px]'
                  }
                >
                  <div>Referral link</div>
                  <div className={'flex items-center gap-2'}>
                    <div className={'text-[#53389E] text-sm sm:text-base font-medium'}>
                      {userInfo ? ellipseAddress(userInfo?.referralLink, 15) : '--'}
                    </div>
                    {connected && (
                      <Tooltip title={copyText}>
                        <div onClick={handleCopy} className={'cursor-pointer'}>
                          <CopyIcon />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
              <div className={'mt-5 flex flex-col gap-5'}>
                {userInfo && userInfo?.promotionCodes.length > 0 ? (
                  <>
                    {userInfo?.promotionCodes.map((item: any, index: number) => {
                      return (
                        <div
                          key={index}
                          className={
                            'border border-[#E4E7EC] p-4 flex justify-between items-center flex-1 gap-4 bg-transparent text-[#fff] h-12 font-semibold rounded-[16px]'
                          }
                        >
                          <span className={'text-[#475467]'}>Promotion code</span>
                          <div className={'text-[#101828] flex items-center gap-2'}>
                            <div>{item.promotionCode}</div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      if (!connected) {
                        dispatch(appActions.SET_SHOW_CONNECT(true));
                        return;
                      }
                      setShowPromotionCode(true);
                    }}
                    className={'border-0  w-full bg-[#7F56D9] text-[#fff] h-12 font-semibold rounded-full'}
                  >
                    Enter promotion code
                  </Button>
                )}
                {userInfo?.invitedBy && (
                  <Button
                    className={
                      'border-[#E4E7EC] flex items-center w-full justify-between gap-4 bg-transparent text-[#fff] h-12 font-semibold rounded-[16px]'
                    }
                  >
                    <span className={'text-[#475467]'}>Invited by</span>
                    <Link
                      target={'_blank'}
                      href={`https://explorer.aptoslabs.com/account/${userInfo?.invitedBy}?network=${networkCfg}`}
                      className={'text-[#7F56D9] flex items-center gap-2'}
                    >
                      <div>{ellipseAddress(userInfo?.invitedBy, 5)}</div>
                      <ShareIcon />
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      <ModalPromationCode isModalOpen={!!showPromotionCode} handleClose={togglePromotionCode} />
    </div>
  );
};
