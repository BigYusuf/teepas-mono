import { TaskTarget, TaskCategory } from "@prisma/client";

import prisma from "../../libs/prisma";

const defaultTasks: {
  name: string;
  description: string;
  target: TaskTarget;
  category: TaskCategory;
  points: number;
  rewardCredits: number;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
}[] = [
  // ── ONBOARDING ──────────────────────────────────────────────────────────────
  {
    name: "Create or Join an Agency",
    description:
      "Set up your own agency or accept an invitation to join an existing one. Your journey starts here.",
    target: TaskTarget.AGENT,
    category: TaskCategory.ONBOARDING,
    points: 50,
    rewardCredits: 0,
    sortOrder: 1,
    isRequired: true,
    isActive: true,
  },
  {
    name: "Verify Your Account",
    description:
      "Complete identity verification to unlock all platform features and build client trust.",
    target: TaskTarget.AGENT,
    category: TaskCategory.ONBOARDING,
    points: 100,
    rewardCredits: 10,
    sortOrder: 2,
    isRequired: true,
    isActive: true,
  },

  // ── PROFILE ─────────────────────────────────────────────────────────────────
  {
    name: "Upload Your Profile Picture",
    description:
      "Put a face to your name. Agents with photos get 3× more trust from clients.",
    target: TaskTarget.AGENT,
    category: TaskCategory.PROFILE,
    points: 10,
    rewardCredits: 0,
    sortOrder: 3,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Complete Agency Profile",
    description:
      "Add your agency name, logo, phone number, email address, and office location.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROFILE,
    points: 20,
    rewardCredits: 0,
    sortOrder: 4,
    isRequired: true,
    isActive: true,
  },
  {
    name: "Upload Agency Logo",
    description:
      "First impressions matter. Give your agency a professional look with a clean logo.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROFILE,
    points: 10,
    rewardCredits: 0,
    sortOrder: 5,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Add Agency Support Contact",
    description:
      "Make it easy for clients to reach you. Add a support email and phone number.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROFILE,
    points: 10,
    rewardCredits: 0,
    sortOrder: 6,
    isRequired: true,
    isActive: true,
  },
  {
    name: "Add Agency Address",
    description:
      "Let clients know where you operate. Add your agency's physical office address.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROFILE,
    points: 10,
    rewardCredits: 0,
    sortOrder: 7,
    isRequired: true,
    isActive: true,
  },
  {
    name: "Add Emergency Contacts",
    description:
      "Save emergency and maintenance contacts so your team can respond fast when it matters.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROFILE,
    points: 20,
    rewardCredits: 0,
    sortOrder: 8,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Reach 100% Profile Completion",
    description:
      "You're almost there! Complete every setup step to unlock your agency's full potential.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.ADVANCED,
    points: 200,
    rewardCredits: 50,
    sortOrder: 9,
    isRequired: false,
    isActive: true,
  },

  // ── DOCUMENTS ───────────────────────────────────────────────────────────────
  {
    name: "Upload Agency Documents",
    description:
      "Upload your CAC registration, license, and verification files to build credibility with clients.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.DOCUMENTS,
    points: 30,
    rewardCredits: 0,
    sortOrder: 10,
    isRequired: true,
    isActive: true,
  },
  {
    name: "Create Your First Lease Agreement",
    description:
      "Generate a lease agreement directly on the platform — no paperwork needed.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.DOCUMENTS,
    points: 60,
    rewardCredits: 5,
    sortOrder: 11,
    isRequired: false,
    isActive: true,
  },

  // ── FINANCE ─────────────────────────────────────────────────────────────────
  {
    name: "Add Bank Account",
    description:
      "Set up a bank account to receive transfers, commissions, and online payments seamlessly.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.FINANCE,
    points: 20,
    rewardCredits: 0,
    sortOrder: 12,
    isRequired: true,
    isActive: true,
  },
  {
    name: "Generate Your First Invoice",
    description:
      "Create a professional invoice for a client or tenant in seconds.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.FINANCE,
    points: 30,
    rewardCredits: 0,
    sortOrder: 13,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Send Your First Payment Reminder",
    description:
      "Keep your cash flow healthy. Notify a tenant or client about an upcoming payment.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.FINANCE,
    points: 20,
    rewardCredits: 0,
    sortOrder: 14,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Receive Your First Online Payment",
    description:
      "Collect your first payment online through the platform. Say goodbye to cash runs.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.FINANCE,
    points: 80,
    rewardCredits: 10,
    sortOrder: 15,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Close ₦1,000,000 in Transactions",
    description:
      "Hit your first major revenue milestone. You're building something real.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.FINANCE,
    points: 300,
    rewardCredits: 100,
    sortOrder: 16,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Generate 100 Invoices",
    description:
      "A sign of a thriving agency. Reach 100 invoices and prove you mean business.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.FINANCE,
    points: 200,
    rewardCredits: 50,
    sortOrder: 17,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Complete 50 Transactions",
    description:
      "50 closed deals means 50 happy clients. Keep the momentum going.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.FINANCE,
    points: 500,
    rewardCredits: 200,
    sortOrder: 18,
    isRequired: false,
    isActive: true,
  },

  // ── PROPERTY ─────────────────────────────────────────────────────────────────
  {
    name: "Create Your First Property",
    description:
      "Add your first property listing with photos, pricing, and all the details clients need.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROPERTY,
    points: 50,
    rewardCredits: 0,
    sortOrder: 19,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Upload Property Images",
    description:
      "Listings with great photos sell faster. Upload high-quality images for your properties.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROPERTY,
    points: 20,
    rewardCredits: 0,
    sortOrder: 20,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Add Your First Land Listing",
    description:
      "Diversify your portfolio. List your first plot of land and attract land buyers.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROPERTY,
    points: 60,
    rewardCredits: 5,
    sortOrder: 21,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Add Your First Commercial Property",
    description:
      "Go beyond residential. List a commercial property and tap into a bigger market.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROPERTY,
    points: 60,
    rewardCredits: 5,
    sortOrder: 22,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Add 5 Properties",
    description:
      "A growing portfolio means more opportunities. Keep listing and watch your reach expand.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROPERTY,
    points: 100,
    rewardCredits: 10,
    sortOrder: 23,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Add 10 Properties",
    description:
      "Double digits! Your agency is becoming a serious force in the market.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROPERTY,
    points: 200,
    rewardCredits: 30,
    sortOrder: 24,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Upload 50 Property Images",
    description:
      "Rich visual content makes your listings stand out. Hit 50 images across your properties.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROPERTY,
    points: 150,
    rewardCredits: 20,
    sortOrder: 25,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Create a Property Inspection",
    description:
      "Schedule and manage a property inspection directly from the app.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROPERTY,
    points: 40,
    rewardCredits: 0,
    sortOrder: 26,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Maintain 95% Tenant Occupancy Rate",
    description:
      "The mark of an elite agency. Keep your properties full and your clients happy.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.PROPERTY,
    points: 500,
    rewardCredits: 200,
    sortOrder: 27,
    isRequired: false,
    isActive: true,
  },

  // ── CLIENTS ──────────────────────────────────────────────────────────────────
  {
    name: "Register Your First Tenant",
    description:
      "Create a tenant profile and start managing their lease, payments, and communications.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.CLIENTS,
    points: 40,
    rewardCredits: 0,
    sortOrder: 28,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Register Your First Buyer",
    description: "Add a buyer, track their interests, and close deals faster.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.CLIENTS,
    points: 40,
    rewardCredits: 0,
    sortOrder: 29,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Register 10 Tenants",
    description:
      "You're building a real client base. 10 tenants managed, many more to come.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.CLIENTS,
    points: 150,
    rewardCredits: 20,
    sortOrder: 30,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Register 10 Buyers",
    description:
      "Ten buyers tracked and ready to close. Your sales pipeline is heating up.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.CLIENTS,
    points: 150,
    rewardCredits: 20,
    sortOrder: 31,
    isRequired: false,
    isActive: true,
  },

  // ── SALES ────────────────────────────────────────────────────────────────────
  {
    name: "Complete Your First Rent Transaction",
    description:
      "Your first rent collected! A sign that your agency is fully operational.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.SALES,
    points: 100,
    rewardCredits: 10,
    sortOrder: 32,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Complete Your First Property Sale",
    description:
      "Close your first sale and celebrate — this is what it's all about.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.SALES,
    points: 150,
    rewardCredits: 20,
    sortOrder: 33,
    isRequired: false,
    isActive: true,
  },

  // ── MARKETING ────────────────────────────────────────────────────────────────
  {
    name: "Create Your First Advertisement",
    description:
      "Promote a property listing and get it in front of more buyers and tenants.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.MARKETING,
    points: 50,
    rewardCredits: 0,
    sortOrder: 34,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Run Your First WhatsApp Campaign",
    description:
      "Reach clients where they already are. Send your first WhatsApp marketing campaign.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.MARKETING,
    points: 80,
    rewardCredits: 5,
    sortOrder: 35,
    isRequired: false,
    isActive: true,
  },

  // ── TEAM ─────────────────────────────────────────────────────────────────────
  {
    name: "Invite a Team Member",
    description:
      "You can't do it all alone. Bring in your first staff member and start building your dream team.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.TEAM,
    points: 30,
    rewardCredits: 0,
    sortOrder: 36,
    isRequired: false,
    isActive: true,
  },
  {
    name: "Invite 5 Team Members",
    description:
      "A strong team builds a strong agency. Get 5 members on board and watch productivity soar.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.TEAM,
    points: 100,
    rewardCredits: 15,
    sortOrder: 37,
    isRequired: false,
    isActive: true,
  },

  // ── ADVANCED ─────────────────────────────────────────────────────────────────
  {
    name: "Reach Platinum Agency Status",
    description:
      "The highest tier. Complete advanced milestones to earn Platinum status and unlock exclusive perks.",
    target: TaskTarget.AGENCY,
    category: TaskCategory.ADVANCED,
    points: 1000,
    rewardCredits: 500,
    sortOrder: 38,
    isRequired: false,
    isActive: true,
  },
];

export async function seedTasks() {
  try {
    for (const task of defaultTasks) {
      const exists = await prisma.tasks.findFirst({
        where: { name: task.name, target: task.target },
      });

      if (!exists) {
        await prisma.tasks.create({ data: task });
        console.log(`✅ [${task.category}] '${task.name}' created.`);
      } else {
        console.log(
          `ℹ️  [${task.category}] '${task.name}' already exists, skipping.`,
        );
      }
    }

    console.log("\n🎉 Task seeding completed!");
  } catch (error) {
    console.error("❌ Failed to seed tasks:", error);
  } finally {
    await prisma.$disconnect();
  }
}
