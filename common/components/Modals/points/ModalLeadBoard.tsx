import { CloseIcon } from '@/common/components/Icons';
import { StarIcon } from '@/common/components/Icons/points';
import { TableLoading } from '@/common/components/Views/points/TableLoaading';
import { getDataLeaderBoard } from '@/common/services/points';
import { ellipseAddress, formatNumberBalance } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Modal, Pagination, PaginationProps, Row, Typography } from 'antd';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface Props {
  isModalOpen: boolean;
  handleClose: () => void;
  userInfo: any;
}

export const ModalLeadBoard: React.FunctionComponent<Props> = ({ isModalOpen, handleClose, userInfo }) => {
  const [current, setCurrent] = useState(1);
  const [totalItem, setTotalItem] = React.useState(0);

  const { data: { total = 0, data = [] } = {}, isFetching } = useQuery({
    queryKey: ['leaderboard', current],
    queryFn: async () => {
      const { data } = await getDataLeaderBoard(current - 1);
      return { total: data.total, data: data.datas };
    },
  });

  useEffect(() => {
    if (total > 0) {
      setTotalItem(total);
    }
  }, [total]);

  const onChange: PaginationProps['onChange'] = (page) => {
    console.log(page);
    setCurrent(page);
  };

  return (
    <Modal centered onCancel={handleClose} visible={isModalOpen} footer={false} closable={false} width={600}>
      <div onClick={handleClose} className={'absolute right-5 top-6 cursor-pointer'}>
        <CloseIcon />
      </div>
      <div className={'p-5 '}>
        <Typography className={'text-[#272B50] font-bold text-[#272B50] point-page text-start text-2xl'}>
          Leaderboard
        </Typography>
        <Row gutter={[16, 16]} className={'mt-8'}>
          <Col xs={24} xl={12}>
            <Card className={'rounded-[16px] bg-[#6C2AAE] p-4 point-page'}>
              <Image
                style={{ mixBlendMode: 'soft-light' }}
                className={'absolute w-full top-0 left-0'}
                src={require('@/common/assets/images/image 1.png')}
                alt={''}
              />
              <div className={'flex  flex-col gap-2 items-start'}>
                <Typography className={'text-[#fff]'}>Your rank</Typography>
                <Typography className={'text-xl text-[#fff] segoe-bold font-bold'}>
                  {userInfo?.rank > 0 ? formatNumberBalance(userInfo?.rank, 0) : 0}
                </Typography>
              </div>
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card className={'rounded-[16px] bg-[#6C2AAE] p-4 point-page'}>
              <Image
                className={'absolute w-full  top-0 left-0'}
                style={{ mixBlendMode: 'soft-light' }}
                src={require('@/common/assets/images/image 1.png')}
                alt={''}
              />
              <div className={'flex flex-col gap-2 '}>
                <Typography className={'text-[#fff]'}>Your points</Typography>
                <Typography className={'text-xl text-[#fff] segoe-bold font-bold'}>
                  {userInfo?.pointBalance > 0 ? formatNumberBalance(userInfo?.pointBalance, 0) : 0}
                </Typography>
              </div>
            </Card>
          </Col>
        </Row>
        <div className={'text-[#4A5578 ]'}>
          <div className={'mt-5'}>
            Your testnet points:{' '}
            <span className={'font-semibold'}>
              {userInfo?.testnetPoint > 0 ? formatNumberBalance(userInfo?.testnetPoint ?? 0) : 0}
            </span>
          </div>
          <div>Your points on the testnet will be preserved and accumulated on the mainnet.</div>
        </div>
        <div className={'mt-8 rounded-[16px]'}>
          <Row className={'p-4 text-[#1A2A3B] rounded-tr-[16px]'}>
            <Col xs={4} xl={2} className={'text-center text-[#7B8AB1] text-xs sm:text-sm'}>
              Rank
            </Col>
            <Col className={'px-4 text-xs text-[#7B8AB1] sm:text-sm'} xs={12} xl={15}>
              Wallet address
            </Col>
            <Col xs={8} xl={6} className={'text-center text-[#7B8AB1] text-xs sm:text-sm'}>
              Meso Points
            </Col>
          </Row>
          {isFetching && <TableLoading />}
          {!isFetching && (
            <>
              {data.map((item: any, index: number) => {
                return (
                  <Row
                    key={index}
                    className={'py-3 px-4 text-xs sm:text-sm text-[#1A2A3B] border border-[#EFF1F5] rounded-[16px]'}
                  >
                    <Col xs={4} className={'text-center'} xl={2}>
                      {item.rank === 1 ? (
                        <Image className={'w-[35px]'} src={require('@/common/assets/images/rank-1.png')} alt={''} />
                      ) : item.rank === 2 ? (
                        <Image className={'w-[35px]'} src={require('@/common/assets/images/rank-2.png')} alt={''} />
                      ) : item.rank === 3 ? (
                        <Image className={'w-[35px]'} src={require('@/common/assets/images/rank-3.png')} alt={''} />
                      ) : (
                        <div className={'w-[35px] flex justify-center'}>
                          <span className={'text-[#7B8AB1] italic font-bold text-lg'}>{item.rank}</span>
                        </div>
                      )}
                    </Col>
                    <Col
                      xs={12}
                      xl={15}
                      className={'text-xs flex font-semibold text-[#7B8AB1] items-center sm:text-sm px-4'}
                    >
                      <span
                        className={`${item.rank === 1 && 'text-[#F36617] italic'} ${
                          item.rank === 2 && 'text-[#586F89] italic'
                        } ${item.rank === 3 && 'text-[#D3A561] italic'}`}
                      >
                        {ellipseAddress(item.address, 6)}
                      </span>
                    </Col>
                    <Col
                      xs={8}
                      xl={6}
                      className={
                        'text-center flex items-center gap-1 font-bold justify-center text-gradient-point text-xs sm:text-sm text-[#1A2A3B]'
                      }
                    >
                      {formatNumberBalance(item.point, 0)}
                      <StarIcon />
                    </Col>
                  </Row>
                );
              })}
            </>
          )}
        </div>
        <div className={'flex justify-end'}>
          <Pagination
            className={'mt-5'}
            current={current}
            onChange={onChange}
            total={totalItem}
            showSizeChanger={false}
          />
        </div>
      </div>
    </Modal>
  );
};
