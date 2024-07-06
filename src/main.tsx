import { porter } from "core/client";
import { PorterChannel } from "core/types";

import { mount } from "app/root";
import MainApp from "app/components/MainApp";
// Add this line at the very beginning of your entry file
porter.connect(PorterChannel.Wallet);

mount(<MainApp />);
