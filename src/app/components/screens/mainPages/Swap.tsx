import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";

import { transferTabAtom } from "app/atoms";
import { TransferTab as TransferTabEnum } from "app/nav";
import { ToastOverflowProvider } from "app/hooks/toast";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import NetworksList from "app/components/blocks/NetworksList";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";
import { ReactComponent as AssetIcon } from "app/icons/transfer-asset.svg";

import {TransferNativeTab} from "./Transfer.Tab";

const Swap: FC = () => {
  const activeTabRoute = useAtomValue(transferTabAtom);
  const activeRoute = useMemo(
    () =>
      tabsContent.find(({ route }) => route.transfer === activeTabRoute)?.route,
    [activeTabRoute],
  );

  return (
    <>
      <NetworksList />
      <div className="flex min-h-0 grow">
        <SecondaryTabs tabs={tabsContent} activeRoute={activeRoute} />
        <ScrollAreaContainer
            className="box-content w-full px-6"
            viewPortClassName="pb-5 pt-5"
            scrollBarClassName="py-0 pt-5 pb-5"
          >
            <ToastOverflowProvider>
              <div>
                <TransferNativeTab />
              </div>
            </ToastOverflowProvider>
          </ScrollAreaContainer>
      </div>
    </>
  );
};

export default Swap;

const tabsContent = [
  {
    route: { page: "transfer", transfer: TransferTabEnum.Asset },
    title: "Native Transfer",
    Icon: AssetIcon,
    desc: "Send tokens from Nexis EVM to Nexis Native",
  },
];
