import fs from "fs";
import { HardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

import { Prettify } from "./prettifier";
import "./type-extensions";
import { Row, Table } from "./types";

export class StorageLayout {
  public env: HardhatRuntimeEnvironment;

  constructor(hre: HardhatRuntimeEnvironment) {
    this.env = hre;
  }

  public jsonToMarkdown(jsonData: any[]): string {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return '';
    }

    const headers = Object.keys(jsonData[0]);
    const separator = headers.map(() => '---');
    const rows = jsonData.map(obj => headers.map(key => obj[key]));

    const table = [
      headers.join(' | '),
      separator.join(' | '),
      rows.map(row => row.join(' | ')).join('\n'),
    ].join('\n');

    return table;
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
    for (const { sourceName, contractName } of names) {
      for (const artifactJsonABI of artifacts) {
        const storage =
          artifactJsonABI.data.output?.contracts?.[sourceName]?.[contractName]
            ?.storageLayout?.storage;
        if (!storage) {
          continue;
        }
        const contract: Row = { name: contractName, stateVariables: [] };
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
        }
        data.contracts.push(contract);

        fs.writeFileSync(
          outputDirectory + "/storage.json",
          JSON.stringify(data)
        );

        const markdownData = this.jsonToMarkdown(JSON.parse(JSON.stringify(data)));
        fs.writeFileSync(outputDirectory +"/output.md", markdownData, 'utf-8');
      }
    }
    const prettifier = new Prettify(data.contracts);
    prettifier.tabulate();
  }
}


