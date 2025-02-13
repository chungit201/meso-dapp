import React, { useContext, useEffect, useState } from 'react'
import InputCurrency from '@/common/components/InputCurrentcy'
import { Button } from 'antd'
import BigNumber from 'bignumber.js'
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback'
import { useAssets } from '@/common/hooks/assets/useAssets'
import { AssetsContext } from '@/common/context'
import { MESO_ADDRESS } from '@/common/consts'
import { CoinType } from '@/common/hooks/useBalanceToken'
import { InputEntryFunctionData } from '@aptos-labs/ts-sdk'
import { CalculatorPosition } from '@/common/components/CaculaterPosition'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'

export interface AssetManageProps {
  asset: PoolAsset
  handleClose: () => void
  balance: number
  refetch: () => void
  setAssetSelected: (asset: PoolAsset) => void
}

export const Deposit: React.FunctionComponent<AssetManageProps> = ({
  asset,
  balance,
  refetch: refetchBalance,
  setAssetSelected,
}) => {
  const { refetchAllAssetData, refetchPoolsData } = useContext(AssetsContext)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')
  const transactionCallback = useTransactionCallback()
  const { refetch } = useAssets()

  useEffect(() => {
    setError('')
  }, [amount])

  useEffect(() => {}, [])

  const handleChange = (value: number) => {
    setAmount(value)
  }

  const handleDeposit = async () => {
    if (amount === 0) {
      setError('The amount must be above zero')
      return
    }
    try {
      let payload = {}
      if (asset.token.type === CoinType.COIN) {
        payload = {
          function: `${MESO_ADDRESS}::meso::deposit_coin`,
          typeArguments: [asset?.token.address as string],
          functionArguments: [BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString()],
        }
      } else {
        payload = {
          function: `${MESO_ADDRESS}::meso::deposit`,
          typeArguments: [],
          functionArguments: [
            asset.token.address,
            BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString(),
          ],
        }
      }
      transactionCallback({
        payload: payload as InputEntryFunctionData,
        onSuccess(hash: string) {
          console.log('hash', hash)
          refetch()
          refetchBalance()
          refetchAllAssetData()
          setAmount(0)
          setTimeout(() => {
            refetchPoolsData()
          }, 3000)
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
        label={'Max'}
        max={balance}
        maxDecimals={asset.token.decimals}
        placeholder={'0.00'}
        inputAmount={Number(amount) > 0 ? amount.toString() : ''}
        onInputChange={handleChange}
        asset={asset}
        balance={balance}
        keepApt={asset.token.symbol === 'APT'}
        setAssetSelected={setAssetSelected}
      />
      <CalculatorPosition asset={asset} amount={Number(amount)} mode={ManageAssetMode.Supply} />
      {/*<div className={'w-full border-b border-dashed border-[#E8EBF6] my-3'}></div>*/}
      {/*<div className={'space-y-2'}>*/}
      {/*  <div className={'flex justify-between text-[#737b94]'}>*/}
      {/*    <div>Deposited</div>*/}
      {/*    <div>*/}
      {/*      {formatNumberBalance(deposited, 2)} {asset?.token.symbol}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={'flex justify-between text-[#737b94]'}>*/}
      {/*    <div>Pool APR</div>*/}
      {/*    <div className={'text-[#737b94]'}>*/}
      {/*      <PoolSupplyApr asset={asset} />*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {error && <p className={'text-red-500 mt-3 text-center'}>{error}</p>}
      <Button
        loading={loading}
        disabled={loading}
        onClick={handleDeposit}
        className={'w-full mt-8 bg-[#7F56D9] border-0 text-[#fff] font-semibold h-11 rounded-full'}
      >
        Deposit
      </Button>
    </div>
  )
}
