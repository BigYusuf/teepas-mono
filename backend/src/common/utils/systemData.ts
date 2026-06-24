//basic user permissions that are created for every app. These can be assigned to default roles and/or used in custom roles
export const SYSTEM_PERMISSIONS = [
  { name: "profile:read", description: "Read user profile" },
  { name: "profile:update", description: "Update user profile" },
  { name: "profile:delete", description: "Delete user profile" },
  { name: "app:read", description: "Read app details" },
];
