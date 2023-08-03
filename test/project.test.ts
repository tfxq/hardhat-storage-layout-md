// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";

import { useEnvironment } from "./helpers";

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("Hash of 'hello' should return 0x1x8...", async function () {
      const result = await this.hre.getHash("hello");
      assert.equal(
        result,
        "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac7"
      );
    });
  });
});
