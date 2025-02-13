import React, { useEffect, useState } from 'react'
import { Button, Divider, Drawer, Layout, Menu, Popover, Tooltip } from 'antd'
import Link from 'next/link'

const { Header } = Layout
import styles from './Header.module.scss'
import { default as classNames, default as cx } from 'classnames'
import { routes } from './routers'
import { Squash as Hamburger } from 'hamburger-react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ModalConnectWallet } from '@/common/components/Modals/ModalConnectWallet'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { avatarImage, copyToClipboard, ellipseAddress } from '@/utils'
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback'
import { FAUCET_CONTRACT_TESTNET } from '@/common/consts'
import { removeData } from '@/common/hooks/useLocalStoragre'
import appActions from '@/modules/app/actions'
import { useDispatch, useSelector } from 'react-redux'
import useClient from '@/common/hooks/useClient'
import useNetworkConfiguration from '@/common/hooks/useNetwork'
import { Network } from '@aptos-labs/ts-sdk'
import { CopyIcon, ViewMoreIcon } from '@/common/components/Icons'

interface ISideMenuProps {
  currentPageName: any
  onRouteSelected: () => void
}

export const HeaderPage: React.FunctionComponent = () => {
  const [pageName, setPageName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setOpen] = useState(false)
  const [copyText, setCopyText] = useState('Copy')

  const { account, disconnect, wallet } = useWallet()
  const router = useRouter()
  const transactionCallback = useTransactionCallback()
  const dispatch = useDispatch()
  const app = useSelector((state: any) => state.app)
  const { faucetClient } = useClient()
  const { networkCfg } = useNetworkConfiguration()

  useEffect(() => {
    setPageName(router.pathname.replace('/', ''))
  }, [router])

  const handleDisconnect = async () => {
    try {
      await removeData('accessToken')
      dispatch(appActions.SET_IS_LOGIN(false))
      disconnect()
    } catch (e) {
      console.log(e)
    }
  }

  const handleSwitchAccount = () => {
    disconnect()
    dispatch(appActions.SET_SHOW_CONNECT(true))
  }

  const faucetApt = async () => {
    try {
      await faucetClient.fundAccount(account?.address as string, 100_000_000)
    } catch (e) {
      console.log(e)
    }
  }

  const handleFaucet = async () => {
    try {
      setLoading(true)
      await faucetApt()
      transactionCallback({
        payload: {
          function: `${FAUCET_CONTRACT_TESTNET}::coins::faucet`,
          typeArguments: [],
          functionArguments: [],
        },
        onSuccess(hash: string) {
          console.log('hash', hash)
        },
        setLoading,
      })
    } catch (e) {
      console.log(e)
    }
  }

  const toggleModalConnect = () => {
    dispatch(appActions.SET_SHOW_CONNECT(!app.showConnect))
  }

  const handleCopy = (value: string) => {
    setCopyText('Copied!')
    setTimeout(() => {
      setCopyText('Copy')
    }, 1000)
    copyToClipboard(value)
  }

  const SideMenu = ({ currentPageName, onRouteSelected }: ISideMenuProps) => {
    return (
      <div className="w-full flex flex-col gap-5">
        {routes
          .filter((r) => r.path !== '*')
          .map(({ name, path }, index) => {
            const isCurrent = currentPageName === name
            return (
              <>
                {path === 'bridge' ? (
                  <a
                    href={`/${path}` || '/'}
                    className={` h6 font-medium dark:text-gray-400 relative flex items-center h-full `}
                    style={{ fontSize: '16px' }}
                  >
                    {name}
                  </a>
                ) : (
                  <Link
                    href={`/${path}`}
                    key={`${name}-${index}-${isCurrent}`}
                    onClick={onRouteSelected}
                    className={classNames(
                      `w-full ${path === 'convert' ? 'text-[#009393] flex items-center gap-2' : 'text-[#000]'} font-semibold dark:text-white menuItem text-base`,
                      {
                        'hip-btn-selected': isCurrent,
                      },
                    )}
                  >
                    {name}
                    {path === 'convert'}
                  </Link>
                )}
              </>
            )
          })}
        {account && networkCfg === Network.TESTNET && (
          <Button
            disabled={loading}
            loading={loading}
            onClick={handleFaucet}
            className={'bg-[#2458F6] border-0  text-[#fff] rounded'}
          >
            Faucet
          </Button>
        )}
      </div>
    )
  }

  const accountInfo = (
    <div className={'py-3'}>
      <div className={'flex gap-2 items-center px-3 '}>
        <div>
          <img className={'w-[30px] rounded-full'} src={avatarImage} alt={''} />
        </div>
        <div>{ellipseAddress(account?.address, 6)}</div>
      </div>
      <div className={'mt-3 flex gap-2 px-3'}>
        <Button onClick={handleSwitchAccount} className={'uppercase text-[10px] font-semibold'} size={'small'}>
          Switch Wallet
        </Button>
        <Button onClick={handleDisconnect} className={'uppercase text-[10px] font-semibold'} size={'small'}>
          Disconnect
        </Button>
      </div>
      <Divider className={'mt-3 mb-2'} />
      <div className={''}>
        <div className={'hover:bg-[#ccc] hover:bg-opacity-20 cursor-pointer font-medium  text-[#5D6B98]  px-3 py-2'}>
          <Tooltip title={copyText}>
            <div onClick={() => handleCopy(account?.address as string)} className={'flex gap-2  items-center'}>
              <div className={'w-[20px] flex'}>
                <CopyIcon />
              </div>
              Copy Address
            </div>
          </Tooltip>
        </div>
        <div className={'hover:bg-[#ccc] hover:bg-opacity-20 cursor-pointer font-medium  px-3 py-2'}>
          <Link
            target={'_blank'}
            className={'flex items-center gap-2 text-[#5D6B98]'}
            href={`https://explorer.aptoslabs.com/account/${account?.address}?network=${networkCfg}`}
          >
            <div className={'w-[20px] text-[#7F56D9] flex'}>
              <ViewMoreIcon />
            </div>
            View on Explorer
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <Header className="z-20 w-full flex items-center pb-0 bg-[#FFF] h-[60px] sm:h-[65px] mobile:py-2 relative px-3">
      <div className="container max-w-[1536px] mx-auto">
        <div className=" mx-auto h-full w-full top-0 left-0 flex items-center  justify-between relative">
          <div className={classNames('  flex items-center ')}>
            <Link href={'/'}>
              <div>
                <Image
                  className={'w-[148px] sm:w-[148px] h-auto'}
                  src={require('@/common/assets/images/logo-dark.png')}
                  alt={''}
                />
              </div>
            </Link>
          </div>
          <div className="grow items-center justify-center h-full hidden md:block ml-10">
            <Menu
              theme="light"
              className={cx(
                styles.menu,
                ' justify-center h-[75px] items-center min-w-[200px] w-full !bg-transparent hidden sm:flex',
              )}
            >
              <Menu
                theme="light"
                className={cx(
                  styles.menu,
                  ' justify-start h-[65px] items-center min-w-[200px] w-full !bg-transparent hidden sm:flex',
                )}
              >
                {routes.map(({ name, path }) => {
                  return (
                    <Menu.Item className={`${pageName === path && 'menu-active'} h-full mx-2 pr-2`} key={name}>
                      <>
                        {path === 'bridge' ? (
                          <a
                            href={`/${path}` || '/'}
                            className={`h6 font-medium dark:text-gray-400 relative flex items-center h-full hover:text-[#000]`}
                            style={{ fontSize: '16px' }}
                          >
                            {name}
                          </a>
                        ) : (
                          <Link
                            href={`/${path}` || '/'}
                            className={`h6 text-base ${path === 'convert' ? 'text-[#009393] flex items-center gap-2' : 'text-[#000]'} font-medium relative flex items-center h-full`}
                          >
                            {name}
                          </Link>
                        )}
                      </>

                      {pageName === path && (
                        <div className={'w-full absolute bottom-[10px] h-[1px]  nav-line-active'} />
                      )}
                    </Menu.Item>
                  )
                })}
              </Menu>
            </Menu>
          </div>
          <div className=" h-full w-fit absolute right-0 bottom-[50%] translate-y-2/4 flex items-center gap-x-2">
            <div className={'flex items-center gap-2 sm:gap-4'}>
              {account && networkCfg === Network.TESTNET && (
                <Button
                  disabled={loading}
                  loading={loading}
                  onClick={handleFaucet}
                  className={'bg-[#2458F6] border-0 hidden sm:block text-[#fff] rounded'}
                >
                  Faucet
                </Button>
              )}
              {account ? (
                <Popover placement="bottomRight" content={accountInfo} trigger="click">
                  <Button
                    className={
                      'bg-[#FFF] flex items-center justify-center gap-2 border-[#DCDFEA]  font-semibold h-9 rounded-full text-[#313547]'
                    }
                  >
                    <img className={'w-[14px] h-auto'} src={wallet?.icon} alt="" />
                    {ellipseAddress(account.address as string, 4)}
                  </Button>
                </Popover>
              ) : (
                <Button
                  onClick={() => {
                    dispatch(appActions.SET_SHOW_CONNECT(true))
                  }}
                  className={'border-0 bg-[#7F56D9] text-white font-bold h-10 rounded-full'}
                >
                  Connect Wallet
                </Button>
              )}
            </div>

            <div className={'block md:hidden'}>
              <Hamburger color={'#000'} size={24} toggled={isOpen} toggle={setOpen} />
            </div>
          </div>
        </div>
      </div>
      <Drawer open={isOpen} placement="right" width="70%" onClose={() => setOpen(false)}>
        <SideMenu currentPageName={router.asPath} onRouteSelected={() => setOpen(false)} />
      </Drawer>
      <ModalConnectWallet isModalOpen={app.showConnect} handleClose={toggleModalConnect} />
    </Header>
  )
}
