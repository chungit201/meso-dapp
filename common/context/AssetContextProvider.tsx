import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { AssetsContext } from '@/common/context/index'
import { getPools, getPoolsBackup } from '@/common/services/assets'
import { CoinType } from '@/common/hooks/useBalanceToken'
import BigNumber from 'bignumber.js'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import useContract from '@/common/hooks/useContract'
import { getPoolInfo, isAddress } from '@/utils'
import { MESO_ADDRESS } from '@/common/consts'
import useUser from '@/common/hooks/useUser'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { usePoxyServices } from '@/common/hooks/modules/poxy'

const AssetContextProvider = ({ children }: PropsWithChildren) => {
  const [page, setPage] = useState(1)
  const [pools, setPools] = useState<PoolAsset[]>([])
  const [allAssets, setAllAssets] = useState<PoolAsset[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { account } = useWallet()
  const { view } = useContract()
  const { userEMode, refetchUserEmode } = useUser()
  const poxyService = usePoxyServices()
  const router = useRouter()

  const walletAddress = useMemo(
    () =>
      router.query.view_address && isAddress(router.query.view_address as string)
        ? router.query.view_address
        : account?.address,
    [account, router],
  )

  useEffect(() => {
    getPoolsDefault(page)
  }, [page])

  const getPoolsDefault = async (page = 1) => {
    try {
      const { data } = await getPools(page)
      const filter: PoolAsset[] = []
      for (const pool of data.datas) {
        filter.push({
          ...pool,
          incentiveSupplyApy: pool.token.symbol === 'APT' ? 0 : pool.incentiveSupplyApy,
          emodeId: pool.token.symbol === 'sthAPT' ? '' : pool.emodeId,
        })
      }
      setPools(filter)
      setAllAssets(filter)
      setIsLoading(false)
    } catch (e) {
      const res: any = await getPoolsBackup()
      setPools(res.data.data)
      setIsLoading(false)
    }
  }

  const {
    data: allAssetsOnchain = [],
    refetch: refetchAllAssetData,
    isFetching: isFetchingDataOnchain,
  } = useQuery({
    queryKey: ['PoolsData', pools, walletAddress],
    queryFn: async () => {
      try {
        const data = await view({
          function: `${MESO_ADDRESS}::lending_pool::pool_data`,
          typeArguments: [],
          functionArguments: [pools.map((x) => x.poolAddress)],
        })
        const poolsData: any = data[0] ?? []
        const mappingData: PoolAsset[] = []
        let userBalances: any = []
        const maxBorrows: any = []
        const tasks = []

        if (poolsData.length === 0) return

        //get balance all coins and fungible assets
        const coins = pools.filter((x) => x.token.type === CoinType.COIN)
        const fungibleAssets = pools.filter((x) => x.token.type === CoinType.FUNGIBLE_ASSETS)
        const array = Array.from(new Array(14 - coins.length))

        //because total type of coin is 14
        for (const el of array) {
          coins.push(coins[coins.length - 1])
        }

        if (walletAddress) {
          const resBalances = poxyService.userWalletBalance(
            coins.map((x) => x.token.address),
            [walletAddress, fungibleAssets.map((x) => x.token.address)],
          )
          //get max borrowable amount
          const resMaxBorrowPyth = poxyService.maxBorrowAmountPyth(walletAddress as string)
          const resMaxBorrowSwitchboard = poxyService.maxBorrowAmountSwitchboard(walletAddress as string)

          const data = await Promise.allSettled([resBalances, resMaxBorrowPyth, resMaxBorrowSwitchboard])

          data.forEach((values: any, index: number) => {
            if (values.status === 'fulfilled') {
              if (index === 0) {
                userBalances = values.value[0].data ?? []
              } else {
                maxBorrows.push(...values.value[0].data)
              }
            }
          })
        }
        for (const pool of pools) {
          tasks.push(mappingPoolsData(poolsData, pools, pool))
        }
        const results: any = await Promise.all(tasks)

        for (const result of results) {
          const tokenBalance = userBalances.find((x: any) => x.key === result.token.address)
          const dataBorrow = maxBorrows.find((x: any) => x.key === result.token.address)
          const maxBorrow = BigNumber(dataBorrow?.value ?? 0)
            .div(BigNumber(10).pow(BigNumber(result.token.decimals)))
            .toNumber()
          const totalBorrowAvailableInPool = BigNumber(result.borrowCap - result.totalDebt)
            .div(BigNumber(10).pow(result.token.decimals))
            .toNumber()

          let totalBorrowAvailable = totalBorrowAvailableInPool < maxBorrow ? totalBorrowAvailableInPool : maxBorrow
          totalBorrowAvailable = totalBorrowAvailable < 0 ? 0 : totalBorrowAvailable

          mappingData.push({
            ...result,
            walletBalance: BigNumber(tokenBalance?.value ?? 0)
              .div(BigNumber(10).pow(BigNumber(result.token.decimals)))
              .toNumber(),
            totalBorrowAvailable,
          })
        }
        return mappingData
      } catch (e) {
        console.log(e)
      }
    },
    enabled: pools.length > 0,
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (allAssetsOnchain.length > 0) {
      setAllAssets(allAssetsOnchain)
    }
  }, [allAssetsOnchain])

  const assetsMode = useMemo(() => {
    if (userEMode) {
      return allAssets.filter((asset) => asset?.emodeId === userEMode)
    } else {
      return allAssets
    }
  }, [allAssets, userEMode, account])

  const mappingPoolsData = async (poolsData: any, pools: PoolAsset[], poolData: PoolAsset): Promise<any> => {
    try {
      const index = pools.map((e) => e.poolAddress).indexOf(poolData.poolAddress)
      const pool = getPoolInfo(poolsData as any, poolData, index)

      return {
        ...poolData,
        ...pool,
        token: poolData.token,
      }
    } catch (e) {
      console.log(e)
    }
  }

  const refetch = async () => {
    await getPoolsDefault(1)
  }

  return (
    <AssetsContext.Provider
      value={{
        allAssetsData: allAssets,
        isLoading,
        isFetchingDataOnchain,
        assetsMode,
        refetchUserEmode,
        refetchAllAssetData,
        refetchPoolsData: refetch,
      }}
    >
      {children}
    </AssetsContext.Provider>
  )
}

export default AssetContextProvider
