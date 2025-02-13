import React, { useEffect, useMemo } from 'react'
import { PointsInfo } from '@/common/components/Views/points/PointsInfo'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { getTasksStatus } from '@/common/services/points'
import { getData, removeData } from '@/common/hooks/useLocalStoragre'
import { useDispatch, useSelector } from 'react-redux'
import { NotificationPlacement } from 'antd/es/notification'
import { notification, Tabs } from 'antd'
import { jwtDecode } from 'jwt-decode'
import { getDiff } from '@/utils'
import appActions from '@/modules/app/actions'
// import { DailyTask } from '@/common/components/Views/points/DailyTask'
import { useRouter } from 'next/router'
import useUser from '@/common/hooks/useUser'
import { DailyTask } from '@/common/components/Views/points/DailyTask'
import { ReferralInfo } from '@/common/components/Views/points/ReferralInfo'
import { MesoPointLeaderboard } from '@/common/components/Modals/points/MesoPointLeaderboard'

const WARNING_TIMEOUT = 5

const Points: React.FunctionComponent = () => {
  const isLogin = useSelector((state: any) => state.app.isLogin)
  const { account, disconnect, connected } = useWallet()
  const walletAddress = useMemo(() => account?.address, [account])
  const dispatch = useDispatch()
  const router = useRouter()
  const { handleLogin, userInfo, refetchUserInfo } = useUser()
  const accessToken = useMemo(() => getData('accessToken'), [account, isLogin])

  useEffect(() => {
    ;(async () => {
      if (router.query.ref && !accessToken && account) {
        await handleLogin()
      }
    })()
  }, [router, isLogin, account])

  const openNotification = (placement: NotificationPlacement) => {
    notification.error({
      message: `You changed your account, please reconnect the wallet !`,
      placement,
      duration: WARNING_TIMEOUT,
    })
  }

  const { data: tasksStatus, refetch: refetchTasksStatus } = useQuery({
    queryKey: ['tasksStatus', account, isLogin],
    queryFn: async () => {
      const { data } = await getTasksStatus(walletAddress as string)
      return data.tasks
    },
    enabled: !!walletAddress,
  })

  const accessToken2 = useMemo(async () => {
    const accessToken = getData('accessToken')
    if (!accessToken) return
    const decoded: any = jwtDecode(accessToken ?? '')
    const exp = getDiff(Number(decoded?.exp) * 1000)
    if (connected && account && walletAddress !== decoded.address) {
      openNotification('top')
      await removeData('accessToken')
      disconnect()
      dispatch(appActions.SET_IS_LOGIN(false))
    }
    if (exp < 0) {
      dispatch(appActions.SET_IS_LOGIN(false))
      await removeData('accessToken')
      disconnect()
    }
    return accessToken
  }, [walletAddress])

  useEffect(() => {
    ;(async () => {
      if (!accessToken2) {
        dispatch(appActions.SET_IS_LOGIN(false))
        disconnect()
      }
    })()
  }, [walletAddress])

  return (
    <div className={'bg-[#FFF] min-h-screen'}>
      <div className={'relative'}>
        <PointsInfo userInfo={userInfo} />
      </div>
      {/*<PointRefer userInfo={userInfo} />*/}
      <div className={'container max-w-[1200px] mx-auto px-3 mt-6'}>
        <Tabs className={'referralTabs'} defaultActiveKey="1">
          <Tabs.TabPane tab="All Tasks" key="1">
            <DailyTask
              userInfo={userInfo}
              tasksStatus={tasksStatus}
              refetchTasksStatus={refetchTasksStatus}
              refetchUserInfo={refetchUserInfo}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Leaderboard" key="2">
            <MesoPointLeaderboard />
          </Tabs.TabPane>
        </Tabs>
        <ReferralInfo userInfo={userInfo} />
      </div>
    </div>
  )
}

export default Points
