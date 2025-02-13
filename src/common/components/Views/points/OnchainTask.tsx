import React, { useMemo } from 'react'
import { Button, Typography } from 'antd'
import { CakeIcon, PointMesoIcon, StarIcon } from '@/common/components/Icons/points'
import { ArrowRightIcon } from '@/common/components/Icons'
// import CountdownEvent from '@/common/components/Views/points/CountdownEvent'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import appActions from '@/modules/app/actions'
import { useDispatch } from 'react-redux'
import { getDiff } from '@/utils'
import CountdownEvent from '@/common/components/Views/points/CountdownEvent'
import Image from 'next/image'

interface Props {
  onChainTasks: any[]
  pointEvent: any
  userInfo: any
  refetchEvent: any
}

export const OnchainTask: React.FunctionComponent<Props> = ({ onChainTasks, pointEvent, refetchEvent }) => {
  const eventTime = useMemo(() => (pointEvent?.deadline ? moment(pointEvent?.deadline).format('X') : 0), [pointEvent])
  const router = useRouter()
  const { connected } = useWallet()
  const dispatch = useDispatch()
  const isEnded = getDiff(Number(eventTime) * 1000) < 0

  return (
    <div>
      {!isEnded && (
        <div className={'onchain-task-box relative px-8 mt-5 py-8 rounded-[16px]'}>
          <Image
            className={'absolute left-0 z-[100] w-[260px] top-0 h-auto sm:h-full'}
            src={require('@/common/assets/images/flower.png')}
            alt={''}
          />
          <Image
            style={{ mixBlendMode: 'soft-light' }}
            className={'absolute top-0 left-0 w-full h-full object-cover rounded-[16px]'}
            src={require('@/common/assets/images/onchain-img.png')}
            alt={''}
          />
          <div className={'relative flex flex-col sm:flex-row items-start sm:items-center gap-12 z-50'}>
            <div className={'relative hidden sm:block'}>
              <video className={'rounded-[16px]'} autoPlay loop style={{ width: '120px', height: '120px' }}>
                <source src="/x2-point.mov" />
              </video>
            </div>

            <div>
              <div className={'flex items-center gap-3'}>
                <Typography className={'segoe-bold font-bold text-sm sm:text-base text-[#fff]'}>
                  Early Contributor Offer
                </Typography>
                <CountdownEvent
                  endAt={eventTime}
                  onMomentChange={() => {
                    refetchEvent()
                  }}
                />
              </div>
              <p className={'text-[#FFFFFF] mt-2'}>
                Accomplish on-chain tasks during the first month to earn Double points.
              </p>
              <p className={'text-[#FFFFFF]'}>
                The points will be counted based on specific tasks and daily asset amount snapshot.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={'relative '}>
        <div className={'mt-4 mb-3'}>On-chain tasks</div>
        <div className={'flex flex-col border border-[#F2F4F7] rounded-[16px]'}>
          {onChainTasks.map((task: any, index: number) => {
            return (
              <div key={index} className={'px-4 py-6 border-t first:border-0 sm:border-[#F2F4F7] relative'}>
                <div className={'flex flex-col gap-5 sm:flex-row justify-between'}>
                  <div className={'flex flex-col gap-5 md:flex-row justify-between'}>
                    {task.name.toLowerCase().includes('other') ? (
                      <PointMesoIcon />
                    ) : (
                      <div
                        className={
                          'w-[60px] h-[60px] border border-[#DFE8F6] rounded-full flex items-center justify-center'
                        }
                      >
                        {task.key === 'SUPPLY_CAKE' ? (
                          <CakeIcon />
                        ) : (
                          <img src={'https://image.meso.finance/stapt.png'} alt="" />
                        )}
                      </div>
                    )}
                    <div>
                      <div className={'flex items-center gap-3'}>
                        <div className={'flex items-center gap-4'}>
                          <Typography className={'text-[#313547] text-xl font-semibold segoe-bold'}>
                            {task.name}
                          </Typography>
                          {task.isApplyPromotion && (
                            <div
                              className={'rounded-full px-3 py-1 text-[#fff] text-sm font-semibold'}
                              style={{
                                background: 'linear-gradient(106deg, #55A3FF -2.36%, #4838FF 61.69%, #0921FF 98.5%)',
                              }}
                            >
                              Promotion
                            </div>
                          )}
                        </div>
                        {!isEnded && (
                          <div className={'italic point-x2 py-[2px] px-2 text-[#fff] rounded-full segoe-bold'}>
                            <span className={'text-sm'}>x2 points</span>
                          </div>
                        )}
                      </div>
                      <p className={'text-[#5D6B98] mt-2'}>{task.description}</p>
                    </div>
                  </div>
                  <div className={'flex gap-5 justify-between sm:justify-start items-center'}>
                    <div className={'min-w-[180px] sm:min-w-[250px]'}>
                      <div className={'flex items-center gap-1'}>
                        <Typography className={'text-[#7F56D9] font-bold segoe-bold'}>
                          {task.isApplyPromotion && 'Up to'} {task.amount * pointEvent?.rate}{' '}
                          {task.amount * pointEvent?.rate === 1 ? 'point' : 'points'}
                        </Typography>
                        <StarIcon />
                      </div>
                      <div className={'text-[#7A88B4]'}>
                        per $1{' '}
                        {task.key === 'SUPPLY_CAKE'
                          ? 'CAKE'
                          : task.name.toLowerCase().includes('other')
                            ? 'other assets'
                            : 'stAPT'}{' '}
                        {task.name.toLowerCase().includes('borrow') ? 'borrow' : 'supply'}{' '}
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        if (!connected) {
                          dispatch(appActions.SET_SHOW_CONNECT(true))
                          return
                        }
                        await router.push('/dashboard')
                      }}
                      className={
                        'flex w-fit sm:w-auto items-center gap-3 bg-[#7F56D9] min-w-[102px] justify-center rounded-full text-base text-white h-[42px] px-4'
                      }
                    >
                      Go
                      <ArrowRightIcon />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
