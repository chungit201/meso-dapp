// import { LoadingPage } from '@/common/components/LoadingAssets/LoadingPage';
import ModalDoTask from '@/common/components/Modals/points/ModalDoTask';
import { OnchainTask } from '@/common/components/Views/points/OnchainTask';
import { SOCIAL_TASKS, SocialTask } from '@/common/components/Views/points/SocialTask';
import { useModal } from '@/common/hooks/useModal';
import { getAllTasks, linkDiscord, linkTwitter, veryfyTask } from '@/common/services/points';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { notification } from 'antd';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const LoadingPage = dynamic(
  () => import('@/common/components/LoadingAssets/LoadingPage').then((mod) => mod.LoadingPage),
  {
    ssr: false,
  },
);

interface Props {
  userInfo: any;
  tasksStatus: any;
  refetchTasksStatus: () => void;
  refetchUserInfo: () => void;
}

export const DailyTask: React.FunctionComponent<Props> = ({
  userInfo,
  tasksStatus,
  refetchTasksStatus,
  refetchUserInfo,
}) => {
  const [loadingLinkAccount, setLoadingLinkAccount] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>();
  const { show: showDoTask, setShow: setShowDoTask, toggle: toggleShowDoTask } = useModal();
  const { connected, account } = useWallet();
  const { data: session, status } = useSession();
  const router = useRouter();
  const provider = router.query.provider;
  const token = (session as any)?.access_token;
  const id = (session as any)?.providerAccountId;

  const { data: { tasks = [], pointEvent = null } = {}, refetch: refetchEvent } = useQuery({
    queryKey: ['tasks', account],
    queryFn: async () => {
      const { data } = await getAllTasks();
      return { tasks: data.tasks, pointEvent: data.pointEvent };
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (userInfo && provider) {
      handleLinkAccount();
    }
  }, [userInfo, account]);

  useEffect(() => {
    if (!account) {
      setSelectedTask(null);
    }
  }, [account, connected]);

  const handleLinkAccount = async () => {
    setLoadingLinkAccount(true);
    try {
      if (userInfo && token && id && provider) {
        let isLinked = false;
        try {
          if (provider === 'twitter' && (session as any)?.provider === 'twitter') {
            // setLoadingTwitter(true)
            if (!userInfo?.twitterId) {
              const res = await linkTwitter(id, token);
              console.log('res', res);
              if (res.data) {
                refetchUserInfo();
                router.push('/points');
              }
            }
            isLinked = true;
          } else if (provider === 'discord' && !userInfo?.discordId && (session as any)?.provider === 'discord') {
            // setLoadingDiscord(true)
            await linkDiscord(id, token);

            isLinked = true;
          }
          if (isLinked) {
            return;
          }
        } catch (e: any) {
          notification.error({ message: e?.response?.data?.message });
        }
        await router.push('/points');
      }
      setLoadingLinkAccount(false);
    } catch (e) {
      setLoadingLinkAccount(false);
      console.log(e);
    } finally {
      setLoadingLinkAccount(false);
    }
  };

  const handleCompleteTask = async (task: any) => {
    if (!userInfo) return;
    let isVerified = false;
    const w = 800;
    const h = 800;
    const left = screen.width / 2 - w / 2;
    const top = screen.height / 2 - h / 2;
    switch (task.key) {
      case 'JOIN_DISCORD':
        isVerified = true;
        window.open(task?.partnerLink, 'newwin', 'height=800,width=800');
        break;
      case 'FOLLOW_TWITTER':
        isVerified = true;
        window.open(
          'https://twitter.com/intent/follow?screen_name=' + task?.partnerId,
          'newwin',
          'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
            w +
            ', height=' +
            h +
            ', top=' +
            top +
            ', left=' +
            left,
        );
        break;
      case 'RETWEET_TWITTER':
        isVerified = true;
        window.open(
          'https://twitter.com/intent/retweet?tweet_id=' + task?.partnerId,
          'newwin',
          'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
            w +
            ', height=' +
            h +
            ', top=' +
            top +
            ', left=' +
            left,
        );
        break;
      default:
        isVerified = true;
        window.open(
          task?.partnerLink,
          'newwin',
          // 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
          //   w +
          //   ', height=' +
          //   h +
          //   ', top=' +
          //   top +
          //   ', left=' +
          //   left,
        );
        break;
    }
    if (!isVerified) {
      return;
    }
    if (
      (task.key == 'JOIN_DISCORD' && userInfo?.discordId) ||
      (task.key == 'FOLLOW_TWITTER' && userInfo?.twitterId) ||
      task.key == SOCIAL_TASKS.JOIN_TELEGRAM_GROUP_CHAT ||
      task.key == SOCIAL_TASKS.JOIN_TELEGRAM_ANNOUNCEMENT ||
      task.key == SOCIAL_TASKS.RETWEET_TWITTER
    ) {
      await handleVerifyTask(task?._id);
    }

    setTimeout(async () => {
      refetchTasksStatus();
      refetchUserInfo();
    }, 3000);
  };

  const handleVerifyTask = async (taskId: string) => {
    try {
      await veryfyTask(taskId);
    } catch (e: any) {
      console.log('e', e);
    }
  };

  const onChainTasks = tasks?.filter((task: any) => task?.type == 'ONCHAIN_TASK');
  const socialTasks = tasks?.filter((task: any) => task?.type == 'SOCIAL_TASK');

  return (
    <div className={'w-full text-base px-2'}>
      {loadingLinkAccount && <LoadingPage />}
      <div className={'relative w-full '}>
        <Image
          className={'absolute top-6 left-0 -translate-x-1/3 sm:w-[600px] -z-10'}
          src={require('@/common/assets/images/points/daily-task-blur-1.png')}
          alt={''}
        />
        <Image
          className={'hidden sm:flex absolute top-1/3 right-0 translate-x-1/3 sm:w-[600px] -z-10'}
          src={require('@/common/assets/images/points/daily-task-blur-2.png')}
          alt={''}
        />
        <Image
          className={'hidden sm:flex absolute top-1/4 right-0 sm:translate-x-1/3 sm:w-[600px] -z-10'}
          src={require('@/common/assets/images/points/daily-task-blur-3.png')}
          alt={''}
        />
        <Image
          className={'absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 sm:w-[600px] -z-10'}
          src={require('@/common/assets/images/points/daily-task-blur-4.png')}
          alt={''}
        />
        <Image
          className={'absolute -z-10'}
          src={require('@/common/assets/images/points/daily-task-blur-3.png')}
          alt={''}
        />
        <OnchainTask
          userInfo={userInfo}
          onChainTasks={onChainTasks}
          pointEvent={pointEvent}
          refetchEvent={refetchEvent}
        />
        <SocialTask
          handleCompleteTask={handleCompleteTask}
          setSelectedTask={setSelectedTask}
          socialTasks={socialTasks}
          tasksStatus={tasksStatus}
          setShowDoTask={setShowDoTask}
          userInfo={userInfo}
        />
      </div>
      <ModalDoTask
        type={selectedTask?.key}
        isModalOpen={!!showDoTask}
        handleClose={toggleShowDoTask}
        handleCompleteTask={handleCompleteTask}
      />
    </div>
  );
};
