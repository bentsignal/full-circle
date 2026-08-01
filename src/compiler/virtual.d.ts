declare module "virtual:full-circle-analysis" {
  const analysis: import("full-circle/compiler").FullCircleAnalysis;

  export { analysis };
  export default analysis;
}
