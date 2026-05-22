import { mockOrganizations } from "@/mocks/organizations.mock";

import { mockNoResponse } from "./common";

export const mockGetOrganizations = async () => mockOrganizations;

export const mockCreateOrganization = async () => mockNoResponse();

export const mockUpdateOrganization = async () => mockNoResponse();

export const mockDisableOrganization = async () => mockNoResponse();
