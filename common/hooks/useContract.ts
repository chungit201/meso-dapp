import useClient from '@/common/hooks/useClient';
import appActions from '@/modules/app/actions';
import { Ed25519PublicKey, InputViewFunctionData } from '@aptos-labs/ts-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { MartianWalletName } from '@martianwallet/aptos-wallet-adapter';
import { PontemWalletName } from '@pontem/wallet-adapter-plugin';
import { notification } from 'antd';
import { useDispatch } from 'react-redux';

const useContract = () => {
  const { signAndSubmitTransaction, connected, account, disconnect, wallet } = useWallet();
  const { aptos, provider } = useClient();
  const dispatch = useDispatch();

  const run = async (payload: any): Promise<{ hash: string; result: any }> => {
    try {
      let pendingTxn: any;
      if (!connected || !account) {
        dispatch(appActions.SET_SHOW_CONNECT(true));
        throw { message: 'Authentication' };
      }
      const rawTxn = await aptos.transaction.build.simple({
        sender: account.address,
        data: payload,
      });

      //NOT PUBLIC KEY WALLET
      if (wallet?.name === 'Continue with Google' || wallet?.name === 'MSafe' || wallet?.name === 'Rimosafe') {
        pendingTxn = await signAndSubmitTransaction({
          data: payload,
        });
        const response = await aptos.waitForTransaction({
          transactionHash: pendingTxn.hash,
        });
        if (response && response?.success) {
          return { hash: pendingTxn?.hash, result: response };
        } else {
          throw { message: response.vm_status || 'Transaction error!' };
        }
      }

      //PUBLIC KEY WALLET
      const publicKey = new Ed25519PublicKey(account.publicKey.toString());
      const userTransaction = await aptos.transaction.simulate.simple({
        signerPublicKey: publicKey,
        transaction: rawTxn,
        options: { estimateGasUnitPrice: true, estimateMaxGasAmount: true, estimatePrioritizedGasUnitPrice: true },
      });

      if (wallet?.name === PontemWalletName || wallet?.name === MartianWalletName) {
        pendingTxn = await signAndSubmitTransaction({
          data: payload,
        });
      } else {
        pendingTxn = await signAndSubmitTransaction({
          data: payload,
          options: {
            maxGasAmount: parseInt(String(Number(userTransaction[0].gas_used) * 1.2)),
            gasUnitPrice: Number(userTransaction[0].gas_unit_price),
          },
        });
      }
      const response = await aptos.waitForTransaction({
        transactionHash: pendingTxn.hash,
      });
      if (response && response?.success) {
        return { hash: pendingTxn?.hash, result: response };
      } else {
        throw { message: response.vm_status || 'Transaction error!' };
      }
    } catch (e: any) {
      console.log('e', e);
      if (e.code === 4100) {
        notification.error({ message: 'The account is not authorized!' });
        disconnect();
      }
      const message = e.message || e.name || e || 'Transaction error!';
      throw { message };
    }
  };

  const view = async (payload: InputViewFunctionData) => {
    return await aptos.view({
      payload,
    });
  };

  return { run, view };
};

export default useContract;
