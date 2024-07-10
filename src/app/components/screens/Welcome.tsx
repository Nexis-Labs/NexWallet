import { FC, useEffect, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import classNames from "clsx";

import { addAccountModalAtom, profileStateAtom } from "app/atoms";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import Button from "app/components/elements/Button";
import { ReactComponent as WigwamIcon } from "app/icons/nexis-logo.svg";

import AddAccountHeader from "../blocks/AddAccountHeader";
import { FlipWordsDemo } from "../ui/flipHeader";
import { BackgroundGradient } from "../BackgroundGradient"; // Adjust the import path as necessary

const Welcome: FC = () => {
  const { all } = useAtomValue(profileStateAtom);
  const addAccOpened = useAtomValue(addAccountModalAtom);
  const setAddAccOpened = useSetAtom(addAccountModalAtom);

  const isInitial = useMemo(() => all.length === 1, [all]);

  useEffect(() => {
    if (isInitial) {
      setAddAccOpened([true, "replace"]);
    }
  }, [isInitial, setAddAccOpened]);

  useEffect(() => {
    const t = setTimeout(() => {
      const scrollarea = document.documentElement;

      if (scrollarea) {
        scrollarea.scrollLeft =
          (scrollarea.offsetWidth - scrollarea.clientWidth) / 2;
      }
    }, 0);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative">
      <video
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="public/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <BoardingPageLayout header={!isInitial} isWelcome>
        <div
          className={classNames(
            "flex flex-col bg-transparent rounded-lg items-center -mt-[3vh] relative z-[10] p-15 pb-25 pt-25 pr-15 pl-15",
            addAccOpened
              ? "opacity-0"
              : "opacity-100 transition-opacity duration-500",
          )}
        >
          <BackgroundGradient className="relative z-[10]">
            <div className="flex flex-col bg-[#0d0f10] items-center rounded-md mt-25 pb-50 pt-25 pr-15 pl-15 justify-center">
              <div>
                <WigwamIcon
                  className={classNames(
                    "w-36 h-auto",
                    "absolute",
                    "top-10 left-1/2",
                    "-translate-x-1/2 -translate-y-1/4",
                    "z-30",
                  )}
                />
                <FlipWordsDemo />
                <AddAccountHeader
                  className="mb-12 px-10"
                  description={"Join the future of finance with NexWallet"}
                />
              </div>
              <Button
                theme="primary-reverse"
                to={{ addAccOpened: true }}
                merge
                className="w-[12rem] mx-25 mb-10"
              >
                {isInitial ? "Get started" : "Add wallet"}
              </Button>
            </div>
          </BackgroundGradient>
        </div>
      </BoardingPageLayout>
    </div>
  );
};

export default Welcome;
