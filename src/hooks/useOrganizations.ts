import utils from "../utils";

export const useOrganizations = () => {
  const { data } = utils.loaders.getOrganizations();
  return data;
};
