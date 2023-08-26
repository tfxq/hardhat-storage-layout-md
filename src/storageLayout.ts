import fs from "fs";
import { HardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import { tsMarkdown } from 'ts-markdown'
import { Prettify } from "./prettifier";
import "./type-extensions";
import { Row, Table } from "./types";

export class StorageLayout {
  public env: HardhatRuntimeEnvironment;

  constructor(hre: HardhatRuntimeEnvironment) {
    this.env = hre;
  }

  public async export() {
    const storageLayoutPath = this.env.config.paths.newStorageLayoutPath;
    const outputDirectory = path.resolve(storageLayoutPath);
    if (!outputDirectory.startsWith(this.env.config.paths.root)) {
      throw new HardhatPluginError(
        "hardhat-storage-layout-json",
        "output directory should be inside the project directory"
      );
    }
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    const buildInfos = await this.env.artifacts.getBuildInfoPaths();
    const artifactsPath = this.env.config.paths.artifacts;
    const artifacts = buildInfos.map((source, idx) => {
      const artifact: Buffer = fs.readFileSync(source);
      return {
        idx,
        source: source.startsWith(artifactsPath)
          ? source.slice(artifactsPath.length)
          : source,
        data: JSON.parse(artifact.toString()),
      };
    });

    const names: Array<{ sourceName: string; contractName: string }> = [];
    for (const fullName of await this.env.artifacts.getAllFullyQualifiedNames()) {
      const {
        sourceName,
        contractName,
      } = await this.env.artifacts.readArtifact(fullName);
      names.push({ sourceName, contractName });
    }
    names.sort((a, b) => a.contractName.localeCompare(b.contractName));

    const data: Table = { contracts: [] };
    const mackDownData=[]
    for (const { sourceName, contractName } of names) {
      for (const artifactJsonABI of artifacts) {
        const storage =
          artifactJsonABI.data.output?.contracts?.[sourceName]?.[contractName]
            ?.storageLayout?.storage;
        if (!storage) {
          continue;
        }
        const contract: Row = { name: contractName, stateVariables: [] };

        mackDownData.push({
            "h3":contractName
        })
        
        let rowsData =[]
        for (const stateVariable of storage) {
          contract.stateVariables.push({
            name: stateVariable.label,
            slot: stateVariable.slot,
            offset: stateVariable.offset,
            type: stateVariable.type,
            idx: artifactJsonABI.idx,
            artifact: artifactJsonABI.source,
            numberOfBytes:
            artifactJsonABI.data.output?.contracts[sourceName][contractName]
              .storageLayout.types[stateVariable.type].numberOfBytes,
          });
          rowsData.push([
            stateVariable.label,stateVariable.slot,stateVariable.offset,
            stateVariable.type,artifactJsonABI.idx,artifactJsonABI.source,
            artifactJsonABI.data.output?.contracts[sourceName][contractName]
              .storageLayout.types[stateVariable.type].numberOfBytes
          ])
        }
        mackDownData.push({
          "table": {
            "columns": ["name", "slot", "offset", "type", "idx", "artifact", "numberOfBytes"],
            "rows":[
              rowsData
            ]
          }
        })
        data.contracts.push(contract);

        fs.writeFileSync(
          outputDirectory + "/storage.json",
          JSON.stringify(data)
        );

        fs.writeFileSync(
          outputDirectory + "/output.md",
          tsMarkdown(mackDownData),
        );
      }
    }
    const prettifier = new Prettify(data.contracts);
    prettifier.tabulate();
  }
}
