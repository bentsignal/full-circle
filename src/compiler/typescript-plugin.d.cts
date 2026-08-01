import type ts from "typescript";

declare function initialize(options: { readonly typescript: typeof ts }): ts.server.PluginModule;

export = initialize;
