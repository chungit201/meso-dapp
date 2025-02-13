import React, { useEffect } from 'react'
import { HeaderPage } from '@/common/components/Header'
import { backup } from '@/common/services/assets'
import Footer from '@/common/components/Footer'
import { ModalWrongNetwork } from '@/common/components/Modals/ModalWrongNetwork'
import { useModal } from '@/common/hooks/useModal'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import useNetworkConfiguration from '@/common/hooks/useNetwork'
import Image from 'next/image'

interface Props {
  children: React.ReactNode
}

export const LayoutPage: React.FunctionComponent<Props> = ({ children }) => {
  const { show, setShow, toggle } = useModal()
  const { network } = useWallet()
  const { networkCfg } = useNetworkConfiguration()

  useEffect(() => {
    if (network && network?.name !== networkCfg) {
      setShow(true)
    } else {
      setShow(false)
    }
  }, [network, networkCfg])

  useEffect(() => {
    backupData()
  }, [])

  const backupData = async () => {
    try {
      await backup()
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className={'relative'}>
      <HeaderPage />
      <div className={'min-h-screen'}>{children}</div>
      <Footer />
      <Image
        className={'absolute bottom-[20%] -z-10 left-0'}
        src={require('@/common/assets/images/Group1.png')}
        alt={''}
      />
      <Image
        className={'absolute bottom-[10%] -z-10 right-0'}
        src={require('@/common/assets/images/Group2.png')}
        alt={''}
      />
      <ModalWrongNetwork isModalOpen={!!show} handleClose={toggle} />
    </div>
  )
}
