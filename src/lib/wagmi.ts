import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { TARGET_CHAIN } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "BlessUP Launchpad",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "placeholder",
  chains: [TARGET_CHAIN],
  transports: {
    [TARGET_CHAIN.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
