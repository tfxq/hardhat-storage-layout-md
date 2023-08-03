// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";
import { task } from "hardhat/config";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
};

task("getHash", "Gets the hash of an input string")
  .addParam("input", "The input string")
  .setAction(async (taskArgs, hre) => {
    const result = await hre.getHash(taskArgs.input);
    console.log(result);
  });

export default config;
