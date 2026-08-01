import type { Linter } from "eslint";

type RestrictedSyntax = {
  readonly message: string;
  readonly selector: string;
};

const typescriptSyntax = [
  {
    selector:
      ":matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)[params.length>4]",
    message: "If a function requires more than four parameters, use one object parameter.",
  },
  {
    selector:
      "FunctionDeclaration[returnType]:not([returnType.typeAnnotation.type='TSTypePredicate'])",
    message:
      "Do not annotate return types. Let TypeScript keep them synchronized with the implementation.",
  },
  {
    selector:
      "ArrowFunctionExpression[returnType][parent.type='VariableDeclarator']:not([returnType.typeAnnotation.type='TSTypePredicate'])",
    message:
      "Do not annotate return types. Let TypeScript keep them synchronized with the implementation.",
  },
  {
    selector: "VariableDeclarator[init][id.type='Identifier'][id.typeAnnotation]",
    message: "Do not annotate initialized variables. Let TypeScript infer their types.",
  },
] satisfies readonly RestrictedSyntax[];

const reactSyntax = [
  {
    selector: "TryStatement[finalizer]",
    message: "Avoid finally blocks in React code because the React Compiler cannot optimize them.",
  },
  {
    selector: "CallExpression[callee.name='useContext']",
    message: "Use a Full Circle store selector instead of subscribing to an entire React context.",
  },
  {
    selector: "CallExpression[callee.name='useEffect']",
    message:
      "Effects are reserved for synchronization with external systems. Explain any necessary exception with an eslint-disable comment.",
  },
  {
    selector:
      ":function VariableDeclarator[init.type='JSXElement'], :function VariableDeclarator[init.type='JSXFragment']",
    message:
      "Do not assign JSX to a variable inside a component or hook. Extract a component instead.",
  },
] satisfies readonly RestrictedSyntax[];

export const strictSyntaxRules = {
  "no-restricted-imports": [
    "error",
    {
      paths: [
        {
          name: "react",
          importNames: ["memo", "useCallback", "useMemo"],
          message:
            "Let the React Compiler handle memoization unless an explained escape hatch is necessary.",
        },
      ],
    },
  ],
  "no-restricted-syntax": ["error", ...typescriptSyntax, ...reactSyntax],
} satisfies Partial<Record<string, Linter.RuleEntry>>;
