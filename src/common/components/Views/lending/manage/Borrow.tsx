import React, { useEffect, useState } from 'react'
import InputCurrency from '@/common/components/InputCurrentcy'
import { Button, notification } from 'antd'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { roundDown } from '@/utils'
import useContract from '@/common/hooks/useContract'
import { useAssets } from '@/common/hooks/assets/useAssets'
import { MESO_ADDRESS } from '@/common/consts'
import { CoinType } from '@/common/hooks/useBalanceToken'
import { InputEntryFunctionData } from '@aptos-labs/ts-sdk'
import useUser from '@/common/hooks/useUser'
import { CalculatorPosition } from '@/common/components/CaculaterPosition'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'
import { AssetManageProps } from '@/common/components/Views/lending/manage/Deposit'

export const Borrow: React.FunctionComponent<AssetManageProps> = ({
  asset,
  balance,
  handleClose,
  refetch: refetchBalance,
  setAssetSelected,
}) => {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')

  const transactionCallback = useTransactionCallback()
  const { account } = useWallet()
  const { view } = useContract()
  const { userEMode } = useUser()
  const { refetch } = useAssets()

  useEffect(() => {
    setAmount(0)
  }, [])

  useEffect(() => {
    setError('')
  }, [amount])

  const { data: totalBorrowAvailable = 0, refetch: refetchBorrowAmount } = useQuery({
    queryKey: ['calculateBorrowAsset', asset],
    queryFn: async () => {
      const res: any = await view({
        function: `${MESO_ADDRESS}::lending_pool::max_borrowable_amount`,
        typeArguments: [],
        functionArguments: [account?.address, asset.poolAddress],
      })
      const maxBorrow = BigNumber(Number(res[0])).div(BigNumber(10).pow(asset.token.decimals)).toNumber()
      const totalBorrowAvailableInPool = BigNumber(asset.borrowCap - asset.totalDebt)
        .div(BigNumber(10).pow(asset.token.decimals))
        .toNumber()
      const borrowAvailable = maxBorrow > totalBorrowAvailableInPool ? totalBorrowAvailableInPool : maxBorrow
      return borrowAvailable < 0 ? 0 : borrowAvailable
    },
    enabled: !!asset && !!account?.address,
    refetchInterval: 5000,
  })

  const handleChange = (value: number) => {
    setAmount(value)
  }

  const handleBorrow = async () => {
    if (userEMode && userEMode !== asset.emodeId) {
      notification.warning({
        message: 'Users are only allowed to borrow assets belonging to the selected category when E-Mode is enabled.',
      })
      return
    }
    if (amount === 0) {
      setError('The amount must be above zero')
      return
    }
    try {
      let payload = {}
      if (asset.token.type === CoinType.COIN) {
        payload = {
          function: `${MESO_ADDRESS}::meso::borrow_coin`,
          typeArguments: [asset?.token.address as string],
          functionArguments: [
            BigNumber(roundDown(amount, asset.token.decimals))
              .times(BigNumber(10).pow(asset.token.decimals))
              .plus(BigNumber(1))
              .toNumber(),
          ],
        }
      } else {
        payload = {
          function: `${MESO_ADDRESS}::meso::borrow`,
          typeArguments: [],
          functionArguments: [
            asset?.token.address,
            BigNumber(roundDown(amount, asset.token.decimals))
              .times(BigNumber(10).pow(asset.token.decimals))
              .plus(BigNumber(1))
              .toNumber(),
          ],
        }
      }
      transactionCallback({
        payload: payload as InputEntryFunctionData,
        onSuccess(hash: string) {
          setTimeout(() => {
            refetch()
            refetchBalance()
            refetchBorrowAmount()
            setAmount(0)
          }, 1000)
        },
        setLoading,
      })
    } catch (e) {
      console.log('e', e)
    }
  }

  return (
    <div className={'mt-2'}>
      <InputCurrency
        label={'Available'}
        placeholder={'0.00'}
        inputAmount={amount > 0 ? amount.toString() : ''}
        onInputChange={handleChange}
        asset={asset}
        max={totalBorrowAvailable * 0.995}
        balance={totalBorrowAvailable * 0.995}
        setAssetSelected={setAssetSelected}
        maxDecimals={asset.token.decimals}
      />
      <CalculatorPosition asset={asset} amount={Number(amount)} mode={ManageAssetMode.Borrow} />
      {/*<div className={'w-full border-b border-dashed border-[#E8EBF6] my-3'}></div>*/}
      {/*<div className={' space-y-2'}>*/}
      {/*  <div className={'flex justify-between text-[#737b94]'}>*/}
      {/*    <div>Wallet</div>*/}
      {/*    <div>*/}
      {/*      {formatNumberBalance(balance, 4)} {asset?.token.symbol}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={'flex justify-between text-[#737b94]'}>*/}
      {/*    <div>Borrow Fee</div>*/}
      {/*    <div>*/}
      {/*      {amount ? formatNumberBalance(Number((amount * asset.borrowFeeBps) / MAX_BPS), 4) : 0} {asset?.token.symbol}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={'flex justify-between text-[#737b94]'}>*/}
      {/*    <div>Your Margin</div>*/}
      {/*    <div>$0</div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {error && <p className={'text-red-500 mt-3 text-center'}>{error}</p>}

      <Button
        loading={loading}
        disabled={loading}
        onClick={handleBorrow}
        className={'w-full mt-8 bg-[#7F56D9] border-0 text-[#fff] font-semibold h-11 rounded-full'}
      >
        Borrow
      </Button>
    </div>
  )
}
