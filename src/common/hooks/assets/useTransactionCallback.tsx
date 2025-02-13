import { useWallet } from '@aptos-labs/wallet-adapter-react'
import React, { useCallback } from 'react'
import { InputEntryFunctionData } from '@aptos-labs/ts-sdk'
import { notification } from 'antd'
import Link from 'next/link'
import { networkConfig } from '@/utils/network'
import { handlePushErrorToGoogleSheet } from '@/common/services/google'
import useContract from '@/common/hooks/useContract'

type TransactionProps = {
  payload: InputEntryFunctionData
  startMsg?: string
  completeMsg?: string
  actionMsg?: string
  reset?: () => void
  onSuccess?: (hash: string) => void
  setLoading?: (loading: boolean) => void
}

export type TransactionCallback = (transactionProps: TransactionProps) => void

const useTransactionCallback = (): TransactionCallback => {
  const { account, signAndSubmitTransaction, connected } = useWallet()
  const { run } = useContract()
  return useCallback(
    ({
      payload,
      startMsg = 'Prompting Transaction',
      completeMsg = 'Transaction Executed Successfully',
      actionMsg = '',
      reset = undefined,
      setLoading,
      onSuccess,
    }: TransactionProps) => {
      let shouldReset = true
      const callback = async () => {
        if (!account || !connected) return
        let hash: string
        try {
          setLoading?.(true)
          console.info(startMsg)
          return run(payload)
            .then((res: any) => {
              hash = res.hash
              console.info(completeMsg)
              if (onSuccess) {
                onSuccess(hash)
                notification.success({
                  message: <div className={'text-[#344054] font-semibold'}>Transaction created</div>,
                  description: (
                    <Link
                      target={'_blank'}
                      className={'flex items-center gap-2'}
                      href={`https://explorer.aptoslabs.com/txn/${res.hash}?network=${networkConfig()}`}
                    >
                      <span className={'text-[#2458F6] hover:underline font-semibold'}>View transaction</span>
                    </Link>
                  ),
                })
              }
            })
            .catch((err: any) => {
              handlePushErrorToGoogleSheet(account?.address as string, err || err.message)
              shouldReset = false
            })
            .finally(() => {
              setLoading?.(false)
              shouldReset && reset && reset()
              return { hash }
            })
        } catch (e) {
          throw e
        }
      }
      return callback()
    },
    [account, connected, signAndSubmitTransaction],
  )
}

export default useTransactionCallback
