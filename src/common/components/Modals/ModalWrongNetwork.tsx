import React from 'react'
import { Button, Modal, Typography } from 'antd'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import useNetworkConfiguration from '@/common/hooks/useNetwork'

interface Props {
  isModalOpen: boolean
  handleClose: () => void
}

export const ModalWrongNetwork: React.FunctionComponent<Props> = ({ isModalOpen, handleClose }) => {
  const { networkCfg } = useNetworkConfiguration()
  const { disconnect } = useWallet()

  return (
    <Modal centered open={isModalOpen} footer={false} closable={false} width={400}>
      <div className={'p-5'}>
        <Typography className={'text-xl font-semibold text-center'}>Wrong Network</Typography>
        <p className={'mt-4'}>
          We currently support only the Aptos {"blockchain's"} {networkCfg} network. Please switch it with your wallet
          and try again.
        </p>
        <div className={'mt-5 flex items-center gap-3 justify-center'}>
          <Button
            onClick={() => {
              disconnect()
              handleClose()
            }}
            className={'flex-1 border-[#7F56D9] bg-[#7F56D9] text-[#fff] rounded-full h-10'}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
