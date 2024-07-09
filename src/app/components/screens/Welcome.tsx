import { FC, useEffect, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import classNames from "clsx";

import { addAccountModalAtom, profileStateAtom } from "app/atoms";

// import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import Button from "app/components/elements/Button";
import { ReactComponent as WigwamIcon } from "app/icons/nexis-logo.svg";
import { DotBackgroundDemo } from "../ui/dotBg";
// import AddAccountHeader from "../blocks/AddAccountHeader";
import { FlipWordsDemo } from "../ui/flipHeader";
import { SparklesPreview } from "../ui/sparkles";

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
    <DotBackgroundDemo
      child={
        // <BoardingPageLayout header={!isInitial} isWelcome>
        <div
          className={classNames(
            "flex flex-col items-center -mt-[3vh] relative z-10",
            addAccOpened
              ? "opacity-0"
              : "opacity-100 transition-opacity duration-500",
          )}
        >
          <div className="flex flex-col items-center justify-center">
            <SparklesPreview
              header={<WigwamIcon className={classNames("w-36 h-auto")} />}
              child={
                <>
                  <FlipWordsDemo />
                  <Button
                    theme="primary-reverse"
                    to={{ addAccOpened: true }}
                    merge
                    className="w-[14rem]"
                  >
                    {isInitial ? "Get started" : "Add wallet"}
                  </Button>
                </>
              }
            />
          </div>
        </div>
        //  </BoardingPageLayout>
      }
    />
  );
};

export default Welcome;
