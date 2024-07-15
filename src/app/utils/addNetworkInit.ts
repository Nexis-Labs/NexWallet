import { useCallback } from "react";
import { withHumanDelay } from "./humanDelay";
import { storage } from "lib/ext/storage";
import {
    Setting,
  } from "core/common";
import * as Repo from "core/repo";
import { TEvent, trackEvent } from "core/client";

export const addNetworkOnInit = useCallback(
    async ({
      nName,
      rpcUrl,
      chainId,
      currencySymbol,
      blockExplorer,
    }: any) =>
      withHumanDelay(async () => {
        chainId = Number(chainId);

        try {
          const repoMethod = "add";

          if (repoMethod === "add") {
            await storage.put(Setting.TestNetworks, true);
          }

          await Repo.networks[repoMethod](
            {
                  chainId,
                  type: "unknown",
                  rpcUrls: [rpcUrl],
                  chainTag: "",
                  name: nName,
                  nativeCurrency: {
                    name: currencySymbol,
                    symbol: currencySymbol,
                    decimals: 18,
                  },
                  explorerUrls: blockExplorer ? [blockExplorer] : [],
                  position: 0,
                },
          );
            trackEvent(TEvent.NetworkCreation);
        } catch (err: any) {
          alert({ title: "Error!", content: err.message });
        }
      }),
    [
      alert,
    ],
  );
