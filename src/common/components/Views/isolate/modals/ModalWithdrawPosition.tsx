import React, { useEffect, useMemo } from 'react'
import { Button, Modal, notification, Typography } from 'antd'
import InputCurrency from '@/common/components/InputCurrentcy'
import { useMutation, useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { CloseIcon } from '@/common/components/Icons'
import { ISOLATE_ADDRESS, MAX_u64 } from '@/common/consts'
import useContract from '@/common/hooks/useContract'
import { useIsolatePools } from '@/common/hooks/useIsolatePools'
import { CoinType } from '@/common/hooks/useBalanceToken'
import { roundDown } from '@/utils'

interface Props {
  isModalOpen: boolean
  handleClose: () => void
  asset: PoolAsset
  isolatePool: IsolatePools
}

export const ModalWithdrawPosition: React.FunctionComponent<Props> = ({
  handleClose,
  isModalOpen,
  asset,
  isolatePool,
}) => {
  const [amount, setAmount] = React.useState(0)
  const { view, run } = useContract()
  const { refetchUserPosition } = useIsolatePools()

  useEffect(() => {
    refetchUserPosition()
    setAmount(0)
  }, [isModalOpen])

  const position = useMemo(() => isolatePool.position, [isolatePool])

  const { data: totalReserves = 0 } = useQuery({
    queryKey: ['totalReserves', asset],
    queryFn: async () => {
      const data = await Promise.all([
        view({
          function: `${ISOLATE_ADDRESS}::lending_pool::pool_supply`,
          typeArguments: [],
          functionArguments: [asset.poolAddress],
        }),
        view({
          function: `${ISOLATE_ADDRESS}::lending_pool::total_pool_debt`,
          typeArguments: [],
          functionArguments: [asset.poolAddress],
        }),
      ])
      const totalSupply = BigNumber(Number(data[0][0])).div(BigNumber(10).pow(asset.token.decimals)).toNumber()
      const totalBorrow = BigNumber(Number(data[1][0])).div(BigNumber(10).pow(asset.token.decimals)).toNumber()
      return roundDown(totalSupply - totalBorrow, asset.token.decimals)
    },
    enabled: !!asset,
  })

  const { data: totalWithdrawAvailable = 0, refetch: refetchWithdrawAmount } = useQuery({
    queryKey: ['WithdrawAvailable', asset, position, isModalOpen],
    queryFn: async () => {
      if (!asset) {
        return 0
      }
      const res: any = await view({
        function: `${ISOLATE_ADDRESS}::lending_pool::remaining_withdrawable_amount`,
        typeArguments: [],
        functionArguments: [position, asset.poolAddress],
      })
      console.log('res', res)
      return BigNumber(Number(res[0])).div(BigNumber(10).pow(asset.token.decimals)).toNumber()
    },
    enabled: !!position && !!asset,
  })

  const isMax = useMemo(() => {
    return amount === totalWithdrawAvailable
  }, [totalWithdrawAvailable, amount])

  const withdraw = async () => {
    if (asset.token.type === CoinType.COIN) {
      return await run({
        function: `${ISOLATE_ADDRESS}::isolated::withdraw_coin`,
        typeArguments: [asset.token.address],
        functionArguments: [
          position,
          asset.poolAddress,
          isMax ? MAX_u64 : BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString(),
        ],
      })
    } else {
      return await run({
        function: `${ISOLATE_ADDRESS}::isolated::withdraw`,
        typeArguments: [],
        functionArguments: [
          position,
          asset.poolAddress,
          isMax ? MAX_u64 : BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString(),
        ],
      })
    }
  }

  const { isPending, mutate: remove } = useMutation({
    mutationFn: async () => withdraw(),
    onSuccess: (res: any) => {
      refetchWithdrawAmount()
      refetchUserPosition()
      handleClose()
      notification.success({ message: 'Transaction created.' })
    },
    onError: (error: any) => {
      notification.error({ message: error?.message || 'Something went wrong.' })
    },
  })

  const handleChange = (value: number) => {
    setAmount(value)
  }

  return (
    <Modal
      centered
      onCancel={() => {
        handleClose()
      }}
      open={isModalOpen}
      footer={false}
      closable={false}
      title={
        <div className={'flex items-center justify-between gap-3'}>
          <Typography className={'text-[#191D21] flex gap-1 text-lg'}>Withdraw</Typography>
          <div className={'flex items-center gap-2'}>
            <div onClick={handleClose} className={'cursor-pointer'}>
              <CloseIcon />
            </div>
          </div>
        </div>
      }
      width={483}
    >
      <div className={'p-6 pt-0'}>
        <InputCurrency
          label={'Withdrawable'}
          max={totalWithdrawAvailable > totalReserves ? totalReserves : totalWithdrawAvailable}
          maxDecimals={asset.token.decimals}
          placeholder={'0.00'}
          inputAmount={Number(amount) > 0 ? amount.toString() : ''}
          onInputChange={handleChange}
          asset={asset}
          balance={totalWithdrawAvailable > totalReserves ? totalReserves : totalWithdrawAvailable}
          disableSelectAssets
        />

        <Button
          loading={isPending}
          disabled={isPending || amount <= 0}
          onClick={() => remove()}
          className={'bg-[#5C80FF] rounded-full text-[#fff] w-full h-11 mt-8 font-semibold'}
        >
          Withdraw
        </Button>
      </div>
    </Modal>
  )
}
