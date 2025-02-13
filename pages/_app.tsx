import '@/styles/globals.css';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { Provider as ReduxProvider } from 'react-redux';

import { LayoutPage } from '@/common/components/Layout/LayoutPage';
import queryClient from '@/configs/queryClient';
import reducer from '@/modules/app/reducer';
import { initRootState } from '@/modules/rootReducer';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter';
import { PontemWallet } from '@pontem/wallet-adapter-plugin';
import { configureStore } from '@reduxjs/toolkit';
import { RiseWallet } from '@rise-wallet/wallet-adapter';
import { TrustWallet } from '@trustwallet/aptos-wallet-adapter';
import { FewchaWallet } from 'fewcha-plugin-wallet-adapter';
import { SessionProvider } from 'next-auth/react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';


import { ENV, envNane } from '@/common/consts';
import AssetContextProvider from '@/common/context/AssetContextProvider';
import { MesoProvider } from '@/common/context/MesoContextProvider';
import { getData } from '@/common/hooks/useLocalStoragre';
import { setHiddenTimeBannerTether, setHiddenTimePopupTether, setHiddenTimeTutorialCalculator } from '@/utils';
import { MSafeWalletAdapter } from '@msafe/aptos-wallet-adapter';
import { OKXWallet } from '@okwallet/aptos-wallet-adapter';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { gtag, install } from 'ga-gtag';
import { GateWallet } from 'gate-plugin-wallet-adapter';
import { useEffect } from 'react';
import { RimoWallet } from 'rimosafe-plugin-wallet-adapter';

const isDevelopmentMode = process.env.NODE_ENV === 'development';

export const installConfig = () => {
  if (ENV === envNane.MAINNET) {
    install('G-C7BKVXSHCQ');
  } else {
    install('G-7VX012E92N');
  }
};

export const store = configureStore({
  reducer: {
    app: reducer,
  },
  preloadedState: initRootState,
  devTools: isDevelopmentMode,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: {
        ignoredPaths: ['connection'],
      },
    }).concat([]),
});

export default function App({ Component, pageProps }: AppProps) {
  const wallets = [
    new PetraWallet(),
    new PontemWallet(),
    new OKXWallet(),
    new MSafeWalletAdapter(),
    new GateWallet(),
    new RimoWallet(),
    new MartianWallet(),
    new TrustWallet(),
    new FewchaWallet(),
    new RiseWallet(),

    // new SpikaWallet(),
    // new MSafeWalletAdapter(),
    // new NightlyWallet(),
  ];

  useEffect(() => {
    const calculatorHiddenTime = getData('hiddeGuideTime');
    const hiddePopupTetherTime = getData('hiddePopupTether');
    const hiddenTimeBannerTether = getData('hiddenTimeBannerTether');
    if (calculatorHiddenTime) {
      setHiddenTimeTutorialCalculator();
    }
    if (hiddePopupTetherTime) {
      setHiddenTimePopupTether();
    }
    if (hiddenTimeBannerTether) {
      setHiddenTimeBannerTether();
    }
    installConfig();
    const sendGA = (e: any) => {
      if (e.srcElement.localName === 'a' || e.srcElement.localName === 'button') {
        clickButtonAndLink(e);
      } else if (e.target.dataset.name) {
        clickDataSet(e);
      }
    };

    const clickDataSet = (e: any) => {
      const eventName = `click_${e.target.dataset.name}`;
      gtag('event', eventName.slice(0, 40));
    };

    const clickButtonAndLink = (e: any) => {
      const innerText = e.target.innerText || e.srcElement.title;
      if (e.srcElement.localName === 'a') {
        const eventName = `click_${innerText}_${e.srcElement.href}`;
        gtag('event', eventName.slice(0, 40));
      } else if (innerText === '') {
        const eventName = `click_${e.target.dataset.name}`;
        gtag('event', eventName.slice(0, 40));
      } else {
        const eventName = `click_${innerText}`;
        gtag('event', eventName.slice(0, 40));
      }
    };

    document.addEventListener('scroll', installConfig);
    document.addEventListener('click', installConfig);
    document.addEventListener('click', sendGA);

    return () => {
      document.removeEventListener('click', sendGA);
    };
  }, []);

  return (
    <ReduxProvider store={store}>
      <AptosWalletAdapterProvider
        plugins={wallets as any}
        autoConnect={true}
        onError={(error) => {
          console.log('error', error);
        }}
      >
        <SessionProvider session={pageProps.session}>
          <QueryClientProvider client={queryClient}>
            <MesoProvider>
              <AssetContextProvider>
                <LayoutPage>
                  <Component {...pageProps} />
                </LayoutPage>
              </AssetContextProvider>
            </MesoProvider>
          </QueryClientProvider>
        </SessionProvider>
      </AptosWalletAdapterProvider>
    </ReduxProvider>
  );
}
