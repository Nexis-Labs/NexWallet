import { useMemo } from "react";
import { Page } from "app/nav";
import { useSetAtom } from "jotai";

import { TEvent, trackEvent } from "core/client";

import { ReactComponent as OverviewIcon } from "app/icons/Overview.svg";
import { ReactComponent as ReceiveIcon } from "app/icons/Receive.svg";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as SwapIcon } from "app/icons/SwapIcon.svg";
import { ReactComponent as FaucetIcon } from "app/icons/Receive.svg";
// import { ReactComponent as AppsIcon } from "app/icons/Apps.svg";
import { ReactComponent as ContactsIcon } from "app/icons/Contacts.svg";
import { ReactComponent as WalletsIcon } from "app/icons/Wallets.svg";
import { ReactComponent as BuyIcon } from "app/icons/Buy-page.svg";
import { ReactComponent as SettingsIcon } from "app/icons/Settings.svg";
import { ReactComponent as SupportIcon } from "app/icons/Support.svg";
import { ReactComponent as ActivityIcon } from "app/icons/ActivityIcon.svg";
import { ReactComponent as RewardsIcon } from "app/icons/Rewards.svg";
// import { ReactComponent as BugIcon } from "app/icons/Bug.svg";
import * as SupportAlert from "app/components/elements/SupportAlert";
// import * as FindBug from "app/components/elements/FindBug";
import { useDialog } from "app/hooks/dialog";
import { activityModalAtom, receiveModalAtom } from "app/atoms";
import { useActivityBadge, useSwapBadge, useAccounts } from "app/hooks";

const useSidebarLinks = () => {
  const { alert } = useDialog();
  const setActivityOpened = useSetAtom(activityModalAtom);
  const setReceiveOpened = useSetAtom(receiveModalAtom);
  const activityBadgeAmount = useActivityBadge();
  const { currentAccount } = useAccounts();

  const swapBadgeAmount = useSwapBadge(currentAccount.address);

  const NavLinksPrimary = useMemo(() => {
    return [
      {
        route: Page.Default,
        label: "Assets",
        Icon: OverviewIcon,
      },
      {
        route: Page.Transfer,
        label: "Send",
        Icon: SendIcon,
      },
      {
        label: "Receive",
        Icon: ReceiveIcon,
        action: () => setReceiveOpened([true, "replace"]),
      },
      {
        route: Page.Swap,
        label: "Bridge",
        Icon: SwapIcon,
        badge: +swapBadgeAmount,
        action: () =>
          trackEvent(TEvent.SwapNavigated, {
            page: "dashboard",
          }),
      },
      {
        route: Page.Faucet,
        label: "Faucet",
        Icon: FaucetIcon,
        badge: 0,
        action: () =>
          trackEvent(TEvent.FaucetNavigated, {
            page: "dashboard",
          }),
      },
      {
        label: "Activity",
        Icon: ActivityIcon,
        action: () => setActivityOpened([true, "replace"]),
        badge: activityBadgeAmount,
      },
      // {
      //   label: "Bug bounty",
      //   Icon: BugIcon,
      //   action: () =>
      //     alert({
      //       title: <FindBug.Title />,
      //       content: <FindBug.Content />,
      //     }),
      // },
      // {
      //   route: Page.Apps,
      //   label: "Stake",
      //   Icon: AppsIcon,
      //   // soon: true,
      // },
    ];
  }, [
    activityBadgeAmount,
    swapBadgeAmount,
    setActivityOpened,
    setReceiveOpened,
    alert,
  ]);

  const NavLinksSecondary = useMemo(() => {
    return [
      {
        route: Page.Contacts,
        label: "Contacts",
        Icon: ContactsIcon,
      },
      {
        route: Page.Wallets,
        label: "Wallets",
        Icon: WalletsIcon,
      },
      {
        route: Page.Settings,
        label: "Settings",
        Icon: SettingsIcon,
      },
      {
        label: "Support",
        Icon: SupportIcon,
        action: () =>
          alert({
            title: <SupportAlert.Title />,
            content: <SupportAlert.Content />,
          }),
      },
    ];
  }, [alert]);

  const NavLinksNative = useMemo(() => {
    return [
      {
        route: Page.Buy,
        label: "Stake",
        Icon: BuyIcon,
        action: () =>
          trackEvent(TEvent.BuyNavigated, {
            page: "dashboard",
          }),
      },
      // {
      //   route: Page.Rewards,
      //   label: "Rewards",
      //   Icon: RewardsIcon,
      // },
    ];
  }, []);

  return useMemo(
    () => ({
      NavLinksPrimary,
      NavLinksNative,
      NavLinksSecondary,
    }),
    [NavLinksPrimary, NavLinksNative, NavLinksSecondary],
  );
};

export default useSidebarLinks;
