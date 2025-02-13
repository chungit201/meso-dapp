import React, { useMemo } from 'react'
import { Button, Divider, Modal, notification } from 'antd'
import { useWallet, Wallet } from '@aptos-labs/wallet-adapter-react'
import { isMobile } from 'react-device-detect'
import { deepLinkMobile } from '@/utils'
import { PetraWalletName } from 'petra-plugin-wallet-adapter'
import { OKXWalletName } from '@okwallet/aptos-wallet-adapter'
import { MSafeWalletName } from '@msafe/aptos-wallet-adapter'
import { MartianWalletName } from '@martianwallet/aptos-wallet-adapter'
import { FewchaWalletName } from 'fewcha-plugin-wallet-adapter'
import { RimoWalletName } from 'rimosafe-plugin-wallet-adapter'

interface Props {
  isModalOpen: boolean
  handleClose: () => void
}

export const ModalConnectWallet: React.FunctionComponent<Props> = ({ isModalOpen, handleClose }) => {
  const { wallets, connect, connected } = useWallet()

  const sorting = [
    PetraWalletName,
    'Pontem Wallet',
    OKXWalletName,
    RimoWalletName,
    MSafeWalletName,
    MartianWalletName,
    FewchaWalletName,
  ]

  const comparator = (a: any, b: any) => {
    const indexInA = sorting.findIndex((value) => a.name === value)
    const indexInB = sorting.findIndex((value) => b.name === value)
    if (indexInA >= 0 && indexInB >= 0) {
      return indexInA - indexInB
    } else if (indexInA >= 0) {
      return -1
    } else if (indexInB >= 0) {
      return 1
    }
    return 0
  }

  const googleWallet = useMemo(() => {
    return wallets?.find((item: any) => item.name === 'Continue with Google')
  }, [wallets])

  const walletList = useMemo(() => {
    if (wallets) {
      const petraWallet = wallets.find((item) => item.name === 'Petra')
      let list = wallets.filter(
        (item) => item.name !== 'Petra' && item.name !== 'Continue with Google' && item.name !== 'Dev T wallet',
      )
      const bybitWalletInstalled = wallets.find(
        (item) => item.name === 'Bybit Wallet' && item.readyState === 'Installed',
      )
      const bybitWalletNotInstalled = wallets.find(
        (item) => item.name === 'Bybit Wallet' && item.readyState === 'NotDetected',
      )
      if (bybitWalletInstalled && bybitWalletNotInstalled) {
        const idx = list.indexOf(bybitWalletNotInstalled)
        if (idx !== -1) list = list.splice(idx, 1)
      }
      const _arr = petraWallet ? [petraWallet, ...list] : list
      return _arr.sort(comparator)
    } else return []
  }, [wallets])

  const handleConnect = async (wallet: Wallet) => {
    try {
      if (wallet.readyState === 'Installed') {
        await connect(wallet?.name)
        handleClose()
      } else {
        if (!isMobile) {
          window.open(wallet.url, '_blank')
        } else {
          deepLinkMobile(wallet)
        }
      }
    } catch (e: any) {
      notification.error({
        message: <h3 className={'text-[#1A2A3B] dark:text-white'}>Transaction failed!</h3>,
        description: (
          <div>
            <div className={'text-red-400'}>{e.name || e.message}</div>
            <div className={'text-xs opacity-50 mt-1 text-[#1A2A3B] dark:text-white'}>a few seconds ago</div>
          </div>
        ),
        placement: 'bottomRight',
      })
      console.log(e)
    }
  }

  return (
    <Modal centered visible={isModalOpen} footer={false} title={''} onCancel={handleClose} width={453} closable={true}>
      <React.Fragment>
        <div className={'p-4 overflow-auto sm:overflow-hidden'}>
          <h1 className={'text-start text-[#191D21] text-xl font-medium'}>Login or Connect</h1>
          <p className={'mb-5 text-start text-[#191D21] text-opacity-70 dark:text-white mt-2'}>
            Please connect your wallet to start the journey.
          </p>
          <Button
            onClick={() => handleConnect(googleWallet as Wallet)}
            key={googleWallet?.name}
            className={
              'walletItem bg-[#F3F5F8] border-0 h-16 rounded-[12px] w-full hover:bg-[#F3F5F8] flex items-center text-start text-xl '
            }
          >
            <div className={'w-full'}>
              <div className={'text-[#1A2A3B] dark:text-[#fff]'}>
                <div className={'flex justify-center'}>
                  <div className={'flex justify-center items-center gap-4'}>
                    <div className={'flex justify-center relative w-[30px] h-[30px] '}>
                      <img className={'h-[30px] w-[30px] rounded-full'} src={googleWallet?.icon} alt="" />
                    </div>
                    <div>
                      <div className={'text-[12px] leading-none text-lg text-[#1A2A3B] font-semibold'}>
                        {googleWallet?.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Button>
          <Divider>Or</Divider>
          <div className={'walletLists max-h-[500px] overflow-y-auto px-3 sm:px-0 '}>
            <div className={'space-y-3'}>
              {walletList?.map((item: any, index: number) => {
                return (
                  <Button
                    onClick={() => handleConnect(item as Wallet)}
                    key={index}
                    className={
                      'walletItem bg-[#F3F5F8] border-0 h-16 rounded-[12px] w-full hover:bg-[#F3F5F8] flex items-center text-start text-xl '
                    }
                  >
                    <div className={'w-full'}>
                      <div className={'text-[#1A2A3B] dark:text-[#fff]'}>
                        <div className={'flex justify-between'}>
                          <div className={'flex justify-start items-center gap-4'}>
                            <div className={'flex justify-center relative w-[40px] h-[40px] '}>
                              <img className={'h-[40px] w-[40px] rounded-full'} src={item?.icon} alt="" />
                            </div>
                            <div>
                              <div className={'text-[12px] leading-none text-lg text-[#1A2A3B] font-semibold'}>
                                {item?.name}
                              </div>
                              <span className={'text-sm text-[#BFBFBF]'}>
                                {item?.readyState === 'Installed' ? 'Installed' : 'NotDetected'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </React.Fragment>
    </Modal>
  )
}
