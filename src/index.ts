import {
  BindingName,
  Project,
  Statement,
  SyntaxKind,
  VariableStatement,
  ts,
} from "ts-morph";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";

const isVariableStatement = (
  property?: Statement<ts.Statement>
): property is VariableStatement =>
  property?.getKind() === SyntaxKind.VariableStatement;

console.log("INIT PROJ");
// Define the path to the project and the file containing the object
const projectPath =
  "/Users/durnford/Developer/power-platform-ux/apps/powerva-microsoft-com";
const filePath = `/Users/durnford/Developer/power-platform-ux/apps/powerva-microsoft-com/src/data/shell/selectors.ts`;

// Load the project and source file
const project = new Project({
  tsConfigFilePath: `${projectPath}/tsconfig.json`,
});
console.log("PROJ");
const file = project.getSourceFile(filePath);

const getBindingNameReferences = (
  bindingName: BindingName,
  fileName: string
): ts.ReferenceEntry[] => {
  const end = bindingName.getEnd();
  return (
    project
      .getLanguageService()
      .compilerObject.getReferencesAtPosition(fileName, end) ?? []
  );
};

if (file) {
  const statements = file.getStatements();

  statements.forEach((statement) => {
    if (isVariableStatement(statement)) {
      const [declaration] = statement.getDeclarationList().getDeclarations();
      const bindingName = declaration.getNameNode();

      const references = getBindingNameReferences(bindingName, filePath).filter(
        (ref) =>
          !ref.fileName.includes("selectors.ts") &&
          !ref.fileName.includes("/lib/")
      );

      const results = references.map((ref) => ({
        filepath: ref.fileName,
      }));

      const csvWriter = createObjectCsvWriter({
        path: `./output/${bindingName.getText()}.csv`,
        header: [{ id: "filepath", title: "File path" }],
      });

      // If output directory doesn't exist, create it
      if (!fs.existsSync("./output")) {
        fs.mkdirSync("./output");
      }

      csvWriter
        .writeRecords(results)
        .then(() => console.log("CSV file has been created successfully."))
        .catch((error) => console.error("Error writing CSV file:", error));

      // results.push({
      //   name: bindingName.getText(),
      //   referenceCount: references.length,
      //   codeReferenceCount: codeReferences.length,
      //   codeReferences: `${Array.from(
      //     new Set(codeReferences.map((ref) => ref.fileName))
      //   )
      //     .reduce<string[]>((acc, fp) => {
      //       const file = project.getSourceFile(fp);
      //       if (file) {
      //         const identifiers = file.getDescendantsOfKind(
      //           SyntaxKind.Identifier
      //         );

      //         const fcbIdentifiers = identifiers.filter(
      //           (i) => i.getText() === bindingName.getText()
      //         );
      //         const result = fcbIdentifiers.map((i) => {
      //           const lineNumber = i.getStartLineNumber();
      //           const lineStart = i.getStartLinePos();
      //           const startPosition = i.getStart() - lineStart;

      //           return `${fp}:${lineNumber}:${startPosition}`.replace(
      //             "/Users/durnford/Developer",
      //             "."
      //           );
      //         });
      //         acc.push(...result);
      //       }
      //       return acc;
      //     }, [])
      //     .join("\\r\\n")}`,
      //   testReferenceCount: testReferences.length,
      //   testReferences: `${Array.from(
      //     new Set(testReferences.map((ref) => ref.fileName))
      //   )
      //     .reduce<string[]>((acc, fp) => {
      //       const file = project.getSourceFile(fp);
      //       if (file) {
      //         const identifiers = file.getDescendantsOfKind(
      //           SyntaxKind.Identifier
      //         );

      //         const fcbIdentifiers = identifiers.filter(
      //           (i) => i.getText() === bindingName.getText()
      //         );
      //         const result = fcbIdentifiers.map((i) => {
      //           const lineNumber = i.getStartLineNumber();
      //           const lineStart = i.getStartLinePos();
      //           const startPosition = i.getStart() - lineStart;

      //           return `${fp}:${lineNumber}:${startPosition}`.replace(
      //             "/Users/durnford/Developer",
      //             "."
      //           );
      //         });
      //         acc.push(...result);
      //       }
      //       return acc;
      //     }, [])
      //     .join("\\r\\n")}`,
      // });
    }
  });
}
