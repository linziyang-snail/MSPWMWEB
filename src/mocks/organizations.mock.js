export const mockOrganizations = [
  {
    id: 1,
    orgName: "總行",
    parentId: null,
    orgType: "HEAD_OFFICE",
    status: "ACTIVE",
  },
  {
    id: 2,
    orgName: "數位金融部",
    parentId: 1,
    orgType: "DEPARTMENT",
    status: "ACTIVE",
  },
  {
    id: 3,
    orgName: "信用卡處",
    parentId: 1,
    orgType: "DEPARTMENT",
    status: "PENDING",
  },
  {
    id: 4,
    orgName: "分行營運處",
    parentId: 1,
    orgType: "DEPARTMENT",
    status: "DISABLED",
  },
];
