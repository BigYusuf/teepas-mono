const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const seedRolesAndPermissions = async () => {
  console.log("🚀 Seeding roles and permissions...");

  // ───────────────────────────────────────────────────────────────────────────
  // PERMISSIONS
  // ───────────────────────────────────────────────────────────────────────────
  const permissionGroups = [
    // Agency
    {
      key: "manage_agency",
      name: "Manage Agency",
      description: "Edit agency profile, invites, and settings",
      category: "Agency",
    },
    {
      key: "manage_team",
      name: "Manage Team",
      description: "Invite, remove, or assign staff members",
      category: "Agency",
    },
    {
      key: "view_agency_reports",
      name: "View Agency Reports",
      description: "View agency analytics and performance reports",
      category: "Agency",
    },
    {
      key: "edit_profile",
      name: "Edit Profile",
      description: "Edit your own profile and profile images",
      category: "Agency",
    },
    {
      key: "view_agency_addresses",
      name: "View Agency Addresses",
      description: "View all agency addresses",
      category: "Agency",
    },
    {
      key: "manage_agency_addresses",
      name: "Manage Agency Addresses",
      description: "Add, update, delete, or set default agency addresses",
      category: "Agency",
    },

    // Property
    {
      key: "create_property",
      name: "Create Property",
      description: "Create new property listings",
      category: "Property",
    },
    {
      key: "edit_property",
      name: "Edit Property",
      description: "Edit or update existing property listings",
      category: "Property",
    },
    {
      key: "delete_property",
      name: "Delete Property",
      description: "Remove property listings",
      category: "Property",
    },
    {
      key: "publish_property",
      name: "Publish Property",
      description: "Publish or unpublish property listings",
      category: "Property",
    },
    {
      key: "view_properties",
      name: "View Properties",
      description: "View property listings owned or managed",
      category: "Property",
    },
    {
      key: "list_property",
      name: "List Property",
      description: "List a new property for rent or sale",
      category: "Property",
    },
    {
      key: "manage_own_property",
      name: "Manage Own Property",
      description: "Edit or update personally owned properties",
      category: "Property",
    },
    {
      key: "view_own_property_reports",
      name: "View Own Property Reports",
      description: "View performance of owned listings",
      category: "Property",
    },

    // Finance
    {
      key: "manage_finance",
      name: "Manage Finance",
      description: "Manage agency bank accounts and financial operations",
      category: "Finance",
    },
    {
      key: "view_finance",
      name: "View Finance",
      description: "View agency bank accounts and financial info",
      category: "Finance",
    },

    // Marketing
    {
      key: "manage_promotions",
      name: "Manage Promotions",
      description: "Create or manage promotional campaigns",
      category: "Marketing",
    },
    {
      key: "manage_boosts",
      name: "Manage Boosts",
      description: "Boost or feature property listings",
      category: "Marketing",
    },
    {
      key: "manage_marketing_events",
      name: "Manage Marketing Events",
      description: "Create and manage open house or promo events",
      category: "Marketing",
    },
    {
      key: "manage_agency_credits",
      name: "Manage Agency Credits",
      description: "Allocate or track agency marketing credits",
      category: "Marketing",
    },

    // Communication
    {
      key: "send_notifications",
      name: "Send Notifications",
      description: "Send email, SMS, or in-app notifications",
      category: "Communication",
    },
    {
      key: "manage_inquiries",
      name: "Manage Inquiries",
      description: "View and respond to property or tenant inquiries",
      category: "Communication",
    },
    {
      key: "manage_reviews",
      name: "Manage Reviews",
      description: "Manage property or agency reviews",
      category: "Communication",
    },
    {
      key: "follow_agency",
      name: "Follow Agency",
      description: "Follow or unfollow agencies",
      category: "Communication",
    },
    {
      key: "approve_property_applications",
      name: "Approve Property Applications",
      description: "Approve or reject property applications",
      category: "Communication",
    },

    // Clients
    {
      key: "apply_property",
      name: "Apply for Property",
      description: "Apply for property rentals",
      category: "Clients",
    },
    {
      key: "view_application_status",
      name: "View Application Status",
      description: "Track property application progress",
      category: "Clients",
    },

    // Platform
    {
      key: "manage_users",
      name: "Manage Users",
      description: "Manage all users across the platform",
      category: "Platform",
    },
    {
      key: "manage_agencies_global",
      name: "Manage Agencies Global",
      description: "Approve, verify, or suspend agencies",
      category: "Platform",
    },
    {
      key: "view_platform_reports",
      name: "View Platform Reports",
      description: "Access platform-wide reports and insights",
      category: "Platform",
    },
    // Finance / Payments (new)
    {
      key: "manage_escrow",
      name: "Manage Escrow Payments",
      description: "View, confirm, or dispute escrow-held payments",
      category: "Finance",
    },
    {
      key: "resolve_escrow_disputes",
      name: "Resolve Escrow Disputes",
      description: "Resolve disputed escrow payments (release or refund)",
      category: "Platform", // admin-only — not agency-scoped
    },
    {
      key: "manage_wallet",
      name: "Manage Wallet",
      description: "View wallet balance and transaction history",
      category: "Finance",
    },
    {
      key: "manage_withdrawals",
      name: "Manage Withdrawals",
      description: "Request withdrawals from agency wallet to bank account",
      category: "Finance",
    },

    // Applications & Inspections (new)
    {
      key: "manage_inspections",
      name: "Manage Inspections",
      description: "Schedule and manage property inspections",
      category: "Communication",
    },

    // Property / Units (new)
    {
      key: "manage_units",
      name: "Manage Units",
      description: "Add, edit, or delete units within a multi-unit property",
      category: "Property",
    },

    // Marketing (new)
    {
      key: "create_marketing_events",
      name: "Create Marketing Events",
      description: "Create agency or property ad campaigns",
      category: "Marketing",
    },
    {
      key: "manage_currencies",
      name: "Manage Currencies",
      description: "Add or toggle supported currencies platform-wide",
      category: "Platform",
    },
  ];

  // Permissions
  for (const perm of permissionGroups) {
    const exists = await prisma.permissions.findUnique({
      where: { key: perm.key },
    });
    if (!exists) {
      await prisma.permissions.create({ data: perm });
      console.log(`✅ Permission '${perm.key}' created.`);
    }
  }

  const allPermissions = await prisma.permissions.findMany();

  const pick = (...keys) =>
    allPermissions
      .filter((p) => keys.includes(p.key))
      .map((p) => ({ permissionId: p.id }));

  const all = allPermissions.map((p) => ({ permissionId: p.id }));

  // ───────────────────────────────────────────────────────────────────────────
  // ROLES
  // ───────────────────────────────────────────────────────────────────────────
  const roles = [
    {
      key: "PLATFORM_ADMIN",
      name: "Platform Admin",
      description: "Full access across the entire platform (superuser)",
      isDefault: true,
      permissions: all,
    },
    {
      key: "AGENCY_OWNER",
      name: "Agency Owner",
      description: "Owns and manages the agency with full internal control",
      isDefault: true,
      permissions: pick(
        "manage_agency",
        "edit_profile",
        "send_notifications",
        "follow_agency",
        "view_agency_addresses",
        "manage_agency_addresses",
        "manage_team",
        "view_finance",
        "manage_finance",
        "approve_property_applications",
        "manage_promotions",
        "create_property",
        "edit_property",
        "delete_property",
        "publish_property",
        "manage_boosts",
        "view_properties",
        "manage_marketing_events",
        "manage_agency_credits",
        "list_property",
        "manage_own_property",
        "view_own_property_reports",
        "apply_property",
        "view_application_status",
        "manage_inquiries",
        "manage_reviews",
        "manage_escrow",
        "manage_wallet",
        "manage_withdrawals",
        "manage_inspections",
        "manage_units",
        "create_marketing_events",
      ),
    },
    {
      key: "AGENCY_ADMIN",
      name: "Agency Admin",
      description: "Almost all owner privileges; cannot remove the owner",
      isDefault: true,
      permissions: pick(
        "manage_agency",
        "edit_profile",
        "send_notifications",
        "follow_agency",
        "manage_team",
        "view_agency_addresses",
        "manage_agency_addresses",
        "view_finance",
        "manage_finance",
        "approve_property_applications",
        "manage_promotions",
        "create_property",
        "edit_property",
        "delete_property",
        "publish_property",
        "manage_boosts",
        "view_properties",
        "manage_marketing_events",
        "manage_agency_credits",
        "list_property",
        "manage_own_property",
        "view_own_property_reports",
        "apply_property",
        "manage_inquiries",
        "manage_reviews",
        "view_application_status",
        "manage_escrow",
        "manage_wallet",
        "manage_withdrawals",
        "manage_inspections",
        "manage_units",
        "create_marketing_events",
      ),
    },
    {
      key: "MANAGER",
      name: "Manager",
      description: "Supervises agents, manages listings and operations",
      isDefault: true,
      permissions: pick(
        "manage_team",
        "create_property",
        "edit_property",
        "delete_property",
        "publish_property",
        "view_agency_reports",
        "manage_promotions",
        "manage_marketing_events",
        "view_properties",
        "manage_units",
        "manage_inspections",
      ),
    },
    {
      key: "AGENT",
      name: "Agent",
      description: "Creates and manages assigned property listings",
      isDefault: true,
      permissions: pick(
        "create_property",
        "edit_property",
        "publish_property",
        "view_properties",
        "manage_inquiries",
        "manage_units", // if agents can add/edit their own units — otherwise skip
        "manage_inspections",
      ),
    },
    {
      key: "ACCOUNTANT",
      name: "Accountant",
      description: "Manages agency financial operations and transactions",
      isDefault: true,
      permissions: pick(
        "manage_finance",
        "view_finance",
        "view_agency_reports",
        "manage_wallet",
        "manage_withdrawals",
        "manage_escrow", // to reconcile/view escrow status affecting the wallet
      ),
    },
    {
      key: "MARKETING",
      name: "Marketing",
      description: "Handles marketing campaigns, boosts, and promotions",
      isDefault: true,
      permissions: pick(
        "manage_promotions",
        "manage_boosts",
        "manage_marketing_events",
        "manage_agency_credits",
        "create_marketing_events",
      ),
    },
    {
      key: "SUPPORT_STAFF",
      name: "Support Staff",
      description: "Handles communication, reviews, and support inquiries",
      isDefault: true,
      permissions: pick(
        "send_notifications",
        "manage_inquiries",
        "manage_reviews",
      ),
    },
    {
      key: "LANDLORD",
      name: "Landlord",
      description: "Manages personally owned properties and reports",
      isDefault: true,
      permissions: pick(
        "list_property",
        "manage_own_property",
        "view_own_property_reports",
      ),
    },
    {
      key: "TENANT",
      name: "Tenant",
      description: "Applies for and manages rental applications",
      isDefault: true,
      permissions: pick(
        "apply_property",
        "view_application_status",
        "manage_escrow", // to pay/confirm/dispute their own escrow payments — controller already scopes by payerId
      ),
    },
  ];

  // Roles
  for (const role of roles) {
    const existing = await prisma.roles.findUnique({
      where: { key: role.key },
    });

    if (!existing) {
      await prisma.roles.create({
        data: {
          key: role.key,
          name: role.name,
          description: role.description,
          isDefault: role.isDefault,
          permissions: { create: role.permissions },
        },
      });
      console.log(
        `✅ Role '${role.key}' created with ${role.permissions.length} permissions.`,
      );
    } else {
      // Re-sync permissions without transactions
      await prisma.rolePermissions.deleteMany({
        where: { roleId: existing.id },
      });
      for (const p of role.permissions) {
        await prisma.rolePermissions.create({
          data: { roleId: existing.id, permissionId: p.permissionId },
        });
      }
      console.log(`♻️  Role '${role.key}' permissions re-synced.`);
    }
  }
  // Upsert roles by key, then sync permissions
  // for (const role of roles) {
  //   const existing = await prisma.roles.findUnique({
  //     where: { key: role.key },
  //   });

  //   if (!existing) {
  //     await prisma.roles.create({
  //       data: {
  //         key: role.key,
  //         name: role.name,
  //         description: role.description,
  //         isDefault: role.isDefault,
  //         permissions: { create: role.permissions },
  //       },
  //     });
  //     console.log(
  //       `✅ Role '${role.key}' created with ${role.permissions.length} permissions.`,
  //     );
  //   } else {
  //     // Wipe and re-sync permissions on re-run so changes are always applied
  //     await prisma.rolePermissions.deleteMany({
  //       where: { roleId: existing.id },
  //     });
  //     await prisma.rolePermissions.createMany({
  //       data: role.permissions.map((p) => ({
  //         roleId: existing.id,
  //         permissionId: p.permissionId,
  //       })),
  //     });
  //     console.log(`♻️  Role '${role.key}' permissions re-synced.`);
  //   }
  // }

  console.log("\n🎉 Roles and permissions seeded successfully!");
};

module.exports = { seedRolesAndPermissions };
