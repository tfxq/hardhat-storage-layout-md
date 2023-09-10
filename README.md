# hardhat-storage-layout-json

Hardhat TS plugin to generate a json file describing the storage layout of contracts
99% copied from hardhat-storage-layout, just added json output.

Generate Ethereum smart contract storage layout with Hardhat. This plugin saves time and avoids human error when a
developer tries to update a specific `storage slot` in a remote solidity contract. For more info about the storage
layout, please refer to the [official solidity documentation](https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html).

## Installation

```bash
yarn add --dev git+https://github.com/tfxq/hardhat-storage-layout-md.git

pnpm add git+https://github.com/tfxq/hardhat-storage-layout-md.git --save-dev
```

## Usage

- Add this plugin to `hardhat.config.js`:

```javascript
require("hardhat-storage-layout-json");
```

- Or Add this plugin to `hardhat.config.ts`:

```typescript
import 'hardhat-storage-layout-json';
```

- Set storage output path

```typescript
const config: HardhatUserConfig = {
    paths: {
        artifacts: './artifacts',
        sources: './contracts',
        cache: './cache_hardhat',
        newStorageLayoutPath: './storage_layout'
    }
}
```

- Compile your contracts (Solc version must be greater than 0.5.13)
- Run `yarn hardhat check`

Or

- Export the contracts storage layout prior deployment as follows:

```javascript
const hre = require("hardhat");

async function main() {
  await hre.storageLayout.export();
}

main().then(r =>{} )
```

```
┌─────────────────┬────────────────┬──────────────┬────────┬─────────────────────────────────────────────────────┬────────────────┐
│ contract        │ state_variable │ storage_slot │ offset │ type                                                │ numberOfBytes  │
├─────────────────┼────────────────┼──────────────┼────────┼─────────────────────────────────────────────────────┤────────────────┤
│ ERC20           │ _balances      │      0       │   0    │ t_mapping(t_address,t_uint256)                      │1               │
│ ERC20           │ _allowances    │      1       │   0    │ t_mapping(t_address,t_mapping(t_address,t_uint256)) │1               │
│ ERC20           │ _totalSupply   │      2       │   0    │ t_uint256                                           │1               │
│ ERC20           │ _name          │      3       │   0    │ t_string_storage                                    │1               │
│ ERC20           │ _symbol        │      4       │   0    │ t_string_storage                                    │1               │
│ WatermelonToken │ _balances      │      0       │   0    │ t_mapping(t_address,t_uint256)                      │1               │
│ WatermelonToken │ _allowances    │      1       │   0    │ t_mapping(t_address,t_mapping(t_address,t_uint256)) │1               │
│ WatermelonToken │ _totalSupply   │      2       │   0    │ t_uint256                                           │1               │
│ WatermelonToken │ _name          │      3       │   0    │ t_string_storage                                    │1               │
│ WatermelonToken │ _symbol        │      4       │   0    │ t_string_storage                                    │1               │
└─────────────────┴────────────────┴──────────────┴────────┴─────────────────────────────────────────────────────┘────────────────┘

```

- **contract**: is the name of the contract including its path as prefix
- **state variable**: is the name of the state variable
- **offset**: is the offset in bytes within the storage slot according to the encoding
- **storage slot**: is the storage slot where the state variable resides or starts. This number may be very large and
  therefore its JSON value is represented as a string.
- **type**: is an identifier used as key to the variable’s type information (described in the following)
- **numberOfBytes**: is the nummber of bytes used by the state variable.
