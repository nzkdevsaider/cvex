export type WorkerInMessage = {
  type: "compile";
  latex: string;
};

export type WorkerOutMessage =
  | { type: "success"; blob: Blob }
  | { type: "error"; message: string };
