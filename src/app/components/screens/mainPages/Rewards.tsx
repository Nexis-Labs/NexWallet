import React from "react";
import classNames from "clsx";

function Rewards() {
  return (
    <div>
      <h2 className={classNames("font-bold text-brand-light", "text-xl mt-4")}>
        Staking Rewards
      </h2>
      <h2 className={classNames(" text-brand-light", "text-lg mt-2")}>
        Rewards from staking Validators will be visible here
      </h2>
    </div>
  );
}

export default Rewards;
