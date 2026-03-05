import { useQueryStates } from "nuqs";
import { problemsParams } from "../params";

export const useProblemsParams = () => {
  return useQueryStates(problemsParams);
};
