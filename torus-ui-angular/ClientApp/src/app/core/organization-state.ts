import { OrganizationModel } from "./organization.model";
import { OrganizationContract } from "./organization-contract.interface";

export class OrganizationState {
  model: OrganizationModel;
  contract: OrganizationContract;
}
