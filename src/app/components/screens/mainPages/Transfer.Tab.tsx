import { FC, Suspense, useMemo } from "react";
import { useAtomValue } from "jotai";
import { match } from "ts-pattern";
import { Redirect } from "lib/navigation";

import { Page, TransferTab as TransferTabEnum } from "app/nav";
import { transferTabAtom } from "app/atoms";

import Asset,{TransferNativeAsset} from "../transferTabs/Asset";
import Nft from "../transferTabs/Nft";

function matchTransferTab(transferTab: TransferTabEnum) {
  return (
    match(transferTab)
      .with(TransferTabEnum.Asset, () => <Asset />)
      .with(TransferTabEnum.Nft, () => <Nft />)
      // .with()
      // Redirect to default
      .otherwise(() => (
        <Redirect
          to={{ page: Page.Transfer, transfer: TransferTabEnum.Asset }}
        />
      ))
  );
}
function matchTransferNativeTab(transferTab: TransferTabEnum) {
  return (
    match(transferTab)
      .with(TransferTabEnum.Asset, () => <TransferNativeAsset />)
      .with(TransferTabEnum.Nft, () => <Nft />)
      // .with()
      // Redirect to default
      .otherwise(() => (
        <Redirect
          to={{ page: Page.Transfer, transfer: TransferTabEnum.Asset }}
        />
      ))
  );
}

const TransferTab: FC = () => {
  const transferTab = useAtomValue(transferTabAtom);

  return useMemo(
    () => <Suspense fallback={null}>{matchTransferTab(transferTab)}</Suspense>,
    [transferTab],
  );
};

export const TransferNativeTab: FC = () => {
  const transferNativeTab = useAtomValue(transferTabAtom);

  return useMemo(
    () => <Suspense fallback={null}>{matchTransferNativeTab(transferNativeTab)}</Suspense>,
    [transferNativeTab],
  );
};

export default TransferTab;
