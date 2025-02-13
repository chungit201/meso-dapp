import { ArrowRightIcon, CheckIcon } from '@/common/components/Icons';
import { DiscordIcon, StarIcon, TelegramIcon, TwitterIcon } from '@/common/components/Icons/points';
import { getData } from '@/common/hooks/useLocalStoragre';
import useUser, { LOGIN_TYPE } from '@/common/hooks/useUser';
import appActions from '@/modules/app/actions';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button } from 'antd';
import { signIn } from 'next-auth/react';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export enum SOCIAL_TASKS {
  FOLLOW_TWITTER = 'FOLLOW_TWITTER',
  JOIN_DISCORD = 'JOIN_DISCORD',
  JOIN_TELEGRAM_ANNOUNCEMENT = 'JOIN_TELEGRAM_ANNOUNCEMENT',
  JOIN_TELEGRAM_GROUP_CHAT = 'JOIN_TELEGRAM_GROUP_CHAT',
  RETWEET_TWITTER = 'RETWEET_TWITTER',
}

interface Props {
  socialTasks: any[];
  tasksStatus: any;
  setSelectedTask: (task: any) => void;
  userInfo: any;
  handleCompleteTask: (task: any) => Promise<void>;
  setShowDoTask: (value: boolean) => void;
}

export const SocialTask: React.FunctionComponent<Props> = ({
  socialTasks,
  tasksStatus,
  setSelectedTask,
  userInfo,
  handleCompleteTask,
  setShowDoTask,
}) => {
  const { connected, account } = useWallet();
  const dispatch = useDispatch();
  const { handleLogin } = useUser();
  const isLogin = useSelector((state: any) => state.app.isLogin);
  const accessToken = useMemo(() => getData('accessToken'), [account, isLogin]);

  const handleDoTask = async (type: any, task: any) => {
    if (!accessToken) {
      const res = await handleLogin(LOGIN_TYPE.TASK);
      if (!res) {
        return;
      }
    }
    switch (task.key) {
      case 'JOIN_DISCORD':
        if (userInfo && !userInfo?.discordId) {
          await signIn('discord', { callbackUrl: `/points?provider=discord` });
        }
        break;
      case 'FOLLOW_TWITTER':
        if (userInfo && !userInfo?.twitterId) {
          await signIn('twitter', { callbackUrl: `/points?provider=twitter` });
        }
        break;
      case 'RETWEET_TWITTER':
        if (userInfo && !userInfo?.twitterId) {
          await signIn('twitter', { callbackUrl: `/points?provider=twitter` });
        }
        break;
      default:
        break;
    }
    if ((task.key == 'JOIN_DISCORD' && userInfo?.discordId) || (task.key == 'FOLLOW_TWITTER' && userInfo?.twitterId)) {
      setShowDoTask(true);
    }
    if (
      (task.key == 'JOIN_DISCORD' && userInfo?.discordId) ||
      (task.key == 'FOLLOW_TWITTER' && userInfo?.twitterId) ||
      task.key == SOCIAL_TASKS.JOIN_TELEGRAM_ANNOUNCEMENT ||
      task.key == SOCIAL_TASKS.JOIN_TELEGRAM_GROUP_CHAT ||
      task.key == SOCIAL_TASKS.RETWEET_TWITTER
    ) {
      await handleCompleteTask(task);
    }
  };

  const getSocialTaskIcon = (task: any) => {
    switch (task.key) {
      case SOCIAL_TASKS.FOLLOW_TWITTER:
        return <TwitterIcon className={'w-[60px] sm:w-[60px] h-auto'} />;
      case SOCIAL_TASKS.JOIN_DISCORD:
        return <DiscordIcon className={'w-[60px] sm:w-[60px] h-auto'} />;
      case SOCIAL_TASKS.JOIN_TELEGRAM_GROUP_CHAT:
        return <TelegramIcon className={'w-[60px] sm:w-[60px] h-auto'} />;
      case SOCIAL_TASKS.JOIN_TELEGRAM_ANNOUNCEMENT:
        return <TelegramIcon className={'w-[60px] sm:w-[60px] h-auto'} />;
      case SOCIAL_TASKS.RETWEET_TWITTER:
        return <TwitterIcon className={'w-[60px] sm:w-[60px] h-auto'} />;
      default:
        return;
    }
  };

  return (
    <div className={'mt-10 relative z-50'}>
      <div className={''} id={'daily-task'}>
        Social tasks
      </div>
      <div className={'flex flex-col border border-[#F2F4F7] rounded-[16px] mt-3'}>
        {socialTasks?.map((task1: any, index: number) => {
          const status = tasksStatus?.find((task2: any) => task2?.id == task1?._id).status;
          return (
            <div
              key={index}
              className={
                ' flex flex-col sm:flex-row sm:items-center justify-between border-t first:border-0 sm:border-[#F2F4F7] gap-6 p-4'
              }
            >
              <div className={'flex flex-col gap-5 md:flex-row justify-between'}>
                <div>{getSocialTaskIcon(task1)}</div>
                <div className={'w-full flex flex-col gap-2'}>
                  <div className={'text-xl text-[#272B50] font-semibold segoe-bold'}>{task1.name}</div>
                  <div className={'text-[#7B8AB1]'}>{task1.description}</div>
                </div>
              </div>
              <div className={'flex gap-5 items-center justify-between sm:justify-start'}>
                <div className={'min-w-[100px] sm:min-w-[250px] flex items-center gap-1'}>
                  <div className={'text-[#7F56D9] font-bold'}>+{task1.amount} points</div>
                  <StarIcon />
                </div>
                {status ? (
                  <Button
                    className={
                      'flex w-fit sm:w-auto items-center gap-3 min-w-[102px] bg-[#FCFAFF] border-[#FCFAFF] rounded-full text-base text-[#D6BBFB] h-[42px] px-4'
                    }
                  >
                    <CheckIcon fill={'#D6BBFB'} />
                    Done
                  </Button>
                ) : (
                  <Button
                    onClick={async () => {
                      if (!connected) {
                        dispatch(appActions.SET_SHOW_CONNECT(true));
                        return;
                      }
                      if (!userInfo && account) {
                        await handleLogin(LOGIN_TYPE.TASK);
                        return;
                      }
                      setSelectedTask(task1);
                      await handleDoTask(task1?.key, task1);
                    }}
                    className={
                      'flex w-fit sm:w-auto items-center gap-3 bg-[#7F56D9] min-w-[102px] rounded-full text-base text-white h-[42px] px-4'
                    }
                  >
                    Go
                    <ArrowRightIcon />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
