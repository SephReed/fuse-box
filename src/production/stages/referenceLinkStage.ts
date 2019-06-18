import { IProductionFlow } from '../main';
import { ProductionModule } from '../ProductionModule';

function referenceLink(productionModule: ProductionModule, props: IProductionFlow) {
  const structure = productionModule.structure;
  const log = props.ctx.log;

  productionModule.dependants.forEach(externalLink => {
    // checking imports
    // import { foo } from "./homeModule";
    for (const importedExternal of externalLink.imports) {
      for (const homeLink of structure.links) {
        const target = homeLink.exports.find(exp => {
          return importedExternal.name === (exp.exported || exp.name);
        });
        if (target) {
          target.dependantVariables.push(importedExternal);
          log.progressFormat(
            'Import Reference',
            '<cyan>$ref</cyan> [ $objType ] from <green>$fromModule</green> to <magenta>$toModule</magenta>',
            {
              fromModule: productionModule.module.getShortPath(),
              toModule: importedExternal.link.productionModule.module.getShortPath(),
              ref: target.exported,
              objType: target.type,
            },
          );
        }
      }
    }

    // checking imports
    // export { foo } from "./homeModule";
    for (const exportedExternal of externalLink.exports) {
      for (const homeLink of structure.links) {
        const target = homeLink.exports.find(exp => {
          return exportedExternal.name === exp.exported;
        });
        if (target) {
          target.dependantExports.push(exportedExternal);
          log.progressFormat(
            'Export Reference',
            '<cyan>$ref</cyan> [ $objType ]  <green>$fromModule</green> to <magenta>$from</magenta>',
            {
              fromModule: productionModule.module.getShortPath(),
              from: exportedExternal.link.productionModule.module.getShortPath(),
              ref: target.exported,
              objType: target.type,
            },
          );
        }
      }
    }
  });
}
export function referenceLinkStage(props: IProductionFlow) {
  const { productionContext } = props;

  const log = props.ctx.log;
  log.progress('<yellow><bold>- Reference Link stage - linking exports/imports</bold></yellow>');

  productionContext.productionPackages.forEach(pkg => {
    pkg.productionModules.forEach(mod => referenceLink(mod, props));
  });

  log.progressEnd('<green><bold>$checkmark Reference Link stage completed</bold></green>');
}
