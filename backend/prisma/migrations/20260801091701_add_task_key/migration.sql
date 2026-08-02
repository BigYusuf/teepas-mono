-- CreateEnum
CREATE TYPE "AgentRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ApplicationAgencyStatus" AS ENUM ('PENDING', 'INSPECTION_APPROVED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BoostStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventSliderStatus" AS ENUM ('BOOKED', 'ACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EventSliderSlot" AS ENUM ('HOME_SLIDER_1', 'HOME_SLIDER_2', 'HOME_SLIDER_3', 'HOME_SLIDER_4', 'HOME_SLIDER_5', 'CATEGORY_SLIDER');

-- CreateEnum
CREATE TYPE "agencyddressType" AS ENUM ('HEAD_OFFICE', 'BRANCH', 'WAREHOUSE');

-- CreateEnum
CREATE TYPE "AgencySteps" AS ENUM ('incomplete', 'pending_address', 'pending_docs', 'pending_bank', 'complete');

-- CreateEnum
CREATE TYPE "addressType" AS ENUM ('Home', 'Work', 'Other');

-- CreateEnum
CREATE TYPE "ApplicationUserStatus" AS ENUM ('PENDING', 'INSPECTION_SCHEDULED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShowAddress" AS ENUM ('ALL', 'APPROVED_ONLY');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('SELF_CONTAIN', 'MINI_FLAT', 'ONE_BEDROOM_FLAT', 'TWO_BEDROOM_FLAT', 'THREE_BEDROOM_FLAT', 'FOUR_BEDROOM_FLAT', 'FIVE_BEDROOM_FLAT', 'ROOM_ONLY', 'SHOP', 'OFFICE_SPACE', 'SHORT_LET', 'LAND', 'OTHER');

-- CreateEnum
CREATE TYPE "FloorType" AS ENUM ('TILED', 'CEMENT', 'WOODEN', 'MARBLE', 'VINYL', 'LAMINATE');

-- CreateEnum
CREATE TYPE "RoofType" AS ENUM ('ALUMINUM', 'ASBESTOS', 'CONCRETE', 'THATCH', 'ZINC');

-- CreateEnum
CREATE TYPE "WallFinish" AS ENUM ('PAINTED', 'WALLPAPER', 'BARE_CEMENT', 'POP');

-- CreateEnum
CREATE TYPE "CeilingType" AS ENUM ('POP', 'PVC', 'WOODEN', 'GYPSUM_BOARD');

-- CreateEnum
CREATE TYPE "DesignType" AS ENUM ('BUNGALOW', 'DUPLEX', 'DETACHED_HOUSE', 'SEMI_DETACHED_HOUSE', 'TERRACED_HOUSE', 'MAISONETTE', 'PENTHOUSE', 'STOREY_BUILDING', 'FACE_ME_I_FACE_YOU', 'BLOCK_OF_FLATS', 'MANSION', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyPurpose" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'SHORT_LET', 'HOSTEL', 'TENEMENT', 'SERVICED_APARTMENT');

-- CreateEnum
CREATE TYPE "EconomicClass" AS ENUM ('LUXURY', 'MIDDLE_CLASS', 'LOW_INCOME', 'INFORMAL');

-- CreateEnum
CREATE TYPE "BuildingMaterial" AS ENUM ('CEMENT_BLOCK', 'MUD', 'WOODEN', 'CONTAINER', 'BRICK', 'BAMBOO_THATCH');

-- CreateEnum
CREATE TYPE "PropertyCategory" AS ENUM ('RENT', 'SALE', 'LEASE', 'SHORT_LET');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'PENDING', 'RENTED', 'SOLD', 'ARCHIVED', 'DRAFT');

-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('GARAGE', 'CARPORT', 'DRIVEWAY', 'STREET', 'VALET', 'COMPOUND', 'OFF_SITE', 'NO_PARKING');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('FREEHOLD', 'LEASEHOLD', 'SHARE_OF_FREEHOLD', 'COMMONHOLD');

-- CreateEnum
CREATE TYPE "BathroomType" AS ENUM ('EN_SUITE', 'SHARED', 'JACK_AND_JILL', 'HALF_BATH', 'FULL_BATH');

-- CreateEnum
CREATE TYPE "BedroomType" AS ENUM ('MASTER_BEDROOM', 'GUEST_BEDROOM', 'CHILDRENS_BEDROOM', 'STUDIO_ROOM', 'DORMITORY');

-- CreateEnum
CREATE TYPE "SecurityFeature" AS ENUM ('CCTV', 'GATED_COMMUNITY', 'SECURITY_GUARD', 'ALARM_SYSTEM', 'INTERCOM', 'FIREPLACE', 'NO_SECURITY');

-- CreateEnum
CREATE TYPE "OutdoorFeature" AS ENUM ('GARDEN', 'BALCONY', 'TERRACE', 'SWIMMING_POOL', 'PLAYGROUND', 'OUTDOOR_KITCHEN');

-- CreateEnum
CREATE TYPE "IndoorFeature" AS ENUM ('AIR_CONDITIONING', 'HEATING', 'FIREPLACE', 'HARDWOOD_FLOORS', 'WALK_IN_CLOSET', 'LAUNDRY_ROOM');

-- CreateEnum
CREATE TYPE "Amenity" AS ENUM ('GYM', 'SPA', 'CLUBHOUSE', 'TENNIS_COURT', 'BASKETBALL_COURT', 'GOLF_COURSE');

-- CreateEnum
CREATE TYPE "NearbyLocation" AS ENUM ('SCHOOL', 'HOSPITAL', 'SHOPPING_MALL', 'PUBLIC_TRANSPORT', 'PARK', 'RESTAURANT');

-- CreateEnum
CREATE TYPE "ConditionStatus" AS ENUM ('NEW', 'GOOD', 'NEEDS_RENOVATION', 'OLD');

-- CreateEnum
CREATE TYPE "Tag" AS ENUM ('NEW_LISTING', 'PRICE_REDUCED', 'OPEN_HOUSE', 'HOT_PROPERTY', 'EXCLUSIVE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR');

-- CreateEnum
CREATE TYPE "Duration" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "LeaseTerm" AS ENUM ('SIX_MONTHS', 'ONE_YEAR', 'TWO_YEARS', 'THREE_YEARS', 'FIVE_YEARS');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE_NOW', 'AVAILABLE_FROM_DATE', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "ConstructionStatus" AS ENUM ('COMPLETED', 'UNDER_CONSTRUCTION', 'PLANNED');

-- CreateEnum
CREATE TYPE "HeatingType" AS ENUM ('CENTRAL_HEATING', 'ELECTRIC_HEATING', 'GAS_HEATING', 'SOLAR_HEATING', 'NO_HEATING');

-- CreateEnum
CREATE TYPE "CoolingType" AS ENUM ('CENTRAL_COOLING', 'WINDOW_UNIT', 'SPLIT_SYSTEM', 'EVAPORATIVE_COOLING', 'NO_COOLING');

-- CreateEnum
CREATE TYPE "WaterSupplyType" AS ENUM ('MUNICIPAL', 'WELL', 'BOREHOLE', 'RAINWATER_HARVESTING', 'NO_WATER_SUPPLY');

-- CreateEnum
CREATE TYPE "ElectricityType" AS ENUM ('GRID', 'SOLAR', 'GENERATOR', 'INVERTER', 'GRID_SOLAR', 'GRID_GENERATOR', 'GRID_INVERTER_SOLAR', 'NO_ELECTRICITY');

-- CreateEnum
CREATE TYPE "MeterType" AS ENUM ('PREPAID', 'POSTPAID', 'NO_METER');

-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "TaskTarget" AS ENUM ('AGENT', 'AGENCY');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('ONBOARDING', 'PROFILE', 'DOCUMENTS', 'PROPERTY', 'FINANCE', 'CLIENTS', 'MARKETING', 'SALES', 'TEAM', 'ADVANCED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "ListingStep" AS ENUM ('BASIC_INFO', 'STRUCTURE', 'MEDIA', 'PRICING', 'REVIEW');

-- CreateEnum
CREATE TYPE "KitchenType" AS ENUM ('PRIVATE', 'SHARED', 'OUTDOOR');

-- CreateEnum
CREATE TYPE "ToiletLocation" AS ENUM ('INDOOR', 'OUTDOOR', 'SHARED');

-- CreateEnum
CREATE TYPE "PetPolicy" AS ENUM ('NOT_ALLOWED', 'ALLOWED', 'NEGOTIABLE', 'REQUIRES_APPROVAL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('COFO', 'SURVEY_PLAN', 'DEED', 'ALLOCATION_LETTER', 'BUILDING_PLAN', 'TAX_RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('AGENCY', 'PROPERTY', 'GLOBAL');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ENDED', 'UPCOMING', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('WEB', 'MOBILE', 'BOTH');

-- CreateEnum
CREATE TYPE "BoostTier" AS ENUM ('SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('EARNED', 'SPENT', 'PURCHASED', 'REFUNDED', 'TASK_REWARD');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NotifyFrequency" AS ENUM ('IMMEDIATE', 'DAILY', 'WEEKLY');

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "password" TEXT,
    "following" TEXT[],
    "imagesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyReviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "reviews" TEXT,
    "agencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyReviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyRoles" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyRolePermissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "agencyRolePermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyMembership" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitedById" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "agencyRolesId" TEXT,

    CONSTRAINT "agencyMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyJoinRequests" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "message" TEXT,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyJoinRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyInvites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyInvites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "category" TEXT NOT NULL,
    "operatingAreas" TEXT[],
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "supportEmail" TEXT,
    "openingHours" TEXT,
    "commissionRate" DOUBLE PRECISION,
    "servicesOffered" TEXT[],
    "yearEstablished" INTEGER,
    "businessRegNumber" TEXT,
    "taxId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "avatar" TEXT,
    "coverBanner" TEXT,
    "logoUrl" TEXT,
    "videoIntro" TEXT,
    "socialLinks" JSONB[],
    "agencyAnalyticsId" TEXT,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyAddresses" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "label" "agencyddressType" NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyAddresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target" "TaskTarget" NOT NULL,
    "category" "TaskCategory" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "rewardCredits" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agentTaskProgress" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agentTaskProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyTaskProgress" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyTaskProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyDocuments" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "businessCertificate" TEXT,
    "proofOfAddress" TEXT,
    "ownerIdCard" TEXT,
    "insuranceDocument" TEXT,
    "signedAgreement" TEXT,
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyBankAccounts" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyBankAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rolePermissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "rolePermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL,
    "categories" TEXT[],
    "subCategories" JSONB NOT NULL,
    "logo" TEXT,
    "banner" TEXT,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "discountCode" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agentId" TEXT,
    "agencyId" TEXT NOT NULL,
    "propertyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyAmenities" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,

    CONSTRAINT "propertyAmenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" "PropertyCategory",
    "type" "PropertyType",
    "designType" "DesignType",
    "purpose" "PropertyPurpose",
    "economicClass" "EconomicClass",
    "customSpecifications" JSONB,
    "customFeatures" JSONB,
    "tags" TEXT[],
    "furnishing" "FurnishingStatus",
    "sizeSqm" DOUBLE PRECISION,
    "landSizeSqm" DOUBLE PRECISION,
    "yearBuilt" INTEGER,
    "condition" "ConditionStatus",
    "availableFrom" TIMESTAMP(3),
    "video_url" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "showTo" "ShowAddress",
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ratings" DOUBLE PRECISION DEFAULT 0,
    "views" INTEGER DEFAULT 0,
    "favorites" INTEGER DEFAULT 0,
    "structureId" TEXT,
    "electricity" "ElectricityType",
    "electricBilling" "MeterType",
    "waterSupply" "WaterSupplyType",
    "cooling" "CoolingType",
    "heating" "HeatingType",
    "construction" "ConstructionStatus",
    "availability" "AvailabilityStatus",
    "floorType" "FloorType",
    "roofType" "RoofType",
    "wallFinish" "WallFinish",
    "ceilingType" "CeilingType",
    "buildingMaterial" "BuildingMaterial",
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "progressStep" "ListingStep" NOT NULL DEFAULT 'BASIC_INFO',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "isDeleted" BOOLEAN DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "agencyId" TEXT NOT NULL,
    "agentId" TEXT,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImages" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "type" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyStructureLocale" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "localName" TEXT NOT NULL,
    "description" TEXT,
    "examples" TEXT[],

    CONSTRAINT "PropertyStructureLocale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyStructure" (
    "id" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "toilets" INTEGER,
    "livingRooms" INTEGER,
    "kitchens" INTEGER,
    "kitchenType" "KitchenType",
    "toiletLocation" "ToiletLocation",
    "isWholeBuilding" BOOLEAN DEFAULT false,
    "isServiced" BOOLEAN DEFAULT false,
    "floorLevel" INTEGER,
    "hasBalcony" BOOLEAN DEFAULT false,
    "petPolicy" "PetPolicy" DEFAULT 'NOT_ALLOWED',
    "petDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PropertyStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyPricing" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "cautionFee" DOUBLE PRECISION,
    "agentFee" DOUBLE PRECISION,
    "legalFee" DOUBLE PRECISION,
    "serviceCharge" DOUBLE PRECISION,
    "paymentType" "PropertyCategory",
    "paymentFrequency" "PaymentFrequency",
    "leaseTerm" "LeaseTerm",
    "currency" TEXT DEFAULT 'NGN',
    "negotiable" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "propertyPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyVideo" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "title" TEXT,
    "duration" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyNearbyPlaces" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION,

    CONSTRAINT "propertyNearbyPlaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floorPlan" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "layout" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "floorPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyDocuments" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "propertyDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "lastVisited" TIMESTAMP(3) NOT NULL,
    "actions" JSONB,
    "recommendations" JSONB,
    "lastTrained" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "userAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyAnalytics" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "inquiries" INTEGER NOT NULL DEFAULT 0,
    "saved" INTEGER NOT NULL DEFAULT 0,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "rents" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3) NOT NULL,
    "boostedViews" INTEGER NOT NULL DEFAULT 0,
    "boostedRents" INTEGER NOT NULL DEFAULT 0,
    "boostedSales" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "propertyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyAnalytics" (
    "id" TEXT NOT NULL,
    "totalVisitors" INTEGER NOT NULL DEFAULT 0,
    "countryStats" JSONB,
    "cityStats" JSONB,
    "deviceStats" JSONB,
    "lastVisitedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uniqueAgencyVisitors" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uniqueAgencyVisitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyApplications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "agencyId" TEXT,
    "userStatus" "ApplicationUserStatus" NOT NULL DEFAULT 'PENDING',
    "agencyStatus" "ApplicationAgencyStatus" NOT NULL DEFAULT 'PENDING',
    "overallStatus" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "propertyApplications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" "addressType" NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT,
    "receiverId" TEXT NOT NULL,
    "redirect_link" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Unread',
    "type" TEXT,
    "channel" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversationGroup" (
    "id" TEXT NOT NULL,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT,
    "agentId" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "content" TEXT,
    "attachments" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'sent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketingEvents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platforms" "PlatformType"[] DEFAULT ARRAY['WEB', 'MOBILE']::"PlatformType"[],
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'ACTIVE',
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "type" "EventType" NOT NULL,
    "agencyId" TEXT,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "marketingEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventPropertyLink" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "eventPropertyLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventImages" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "eventId" TEXT,
    "platform" "PlatformType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyBoosts" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tier" "BoostTier" NOT NULL,
    "creditsSpent" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BoostStatus" NOT NULL DEFAULT 'PENDING',
    "priorityScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propertyBoosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyCredits" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agencyCredits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditTransactions" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "type" "CreditType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "purpose" TEXT,
    "note" TEXT,
    "eventId" TEXT,
    "boostId" TEXT,
    "promotionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "agencyCreditsId" TEXT,

    CONSTRAINT "creditTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditSettings" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tier" TEXT,
    "cost" INTEGER NOT NULL,
    "currencyValue" DOUBLE PRECISION DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "creditSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "AdminStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adminRoleLink" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "adminRoleLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adminRoles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "adminRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adminPermissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "adminPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rolePermissionLink" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "rolePermissionLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adminActivityLogs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adminActivityLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyTransactions" (
    "id" TEXT NOT NULL,
    "type" "PropertyCategory" NOT NULL DEFAULT 'RENT',
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "paymentRef" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "propertyTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyMonitors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "location" TEXT,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "propertyType" TEXT,
    "category" "PropertyCategory",
    "frequency" "NotifyFrequency" NOT NULL DEFAULT 'IMMEDIATE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propertyMonitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nonitorNotifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "channel" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nonitorNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitorSentHistory" (
    "id" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitorSentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agencyJoinRequests_agencyId_agentId_key" ON "agencyJoinRequests"("agencyId", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "agencyInvites_token_key" ON "agencyInvites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "followers_userId_agencyId_key" ON "followers"("userId", "agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_key_key" ON "tasks"("key");

-- CreateIndex
CREATE UNIQUE INDEX "agentTaskProgress_agentId_taskId_key" ON "agentTaskProgress"("agentId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "agencyTaskProgress_agencyId_taskId_key" ON "agencyTaskProgress"("agencyId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "agencyDocuments_agencyId_key" ON "agencyDocuments"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_discountCode_key" ON "promotions"("discountCode");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "propertyAmenities_propertyId_amenityId_key" ON "propertyAmenities"("propertyId", "amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "properties_structureId_key" ON "properties"("structureId");

-- CreateIndex
CREATE UNIQUE INDEX "propertyPricing_propertyId_key" ON "propertyPricing"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "userAnalytics_userId_key" ON "userAnalytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "propertyAnalytics_propertyId_key" ON "propertyAnalytics"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "uniqueAgencyVisitors_agencyId_userId_key" ON "uniqueAgencyVisitors"("agencyId", "userId");

-- CreateIndex
CREATE INDEX "message_conversationId_createdAt_idx" ON "message"("conversationId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "agencyCredits_agencyId_key" ON "agencyCredits"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "adminRoles_name_key" ON "adminRoles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "adminPermissions_code_key" ON "adminPermissions"("code");

-- CreateIndex
CREATE INDEX "monitorSentHistory_monitorId_propertyId_idx" ON "monitorSentHistory"("monitorId", "propertyId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_imagesId_fkey" FOREIGN KEY ("imagesId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyReviews" ADD CONSTRAINT "agencyReviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyReviews" ADD CONSTRAINT "agencyReviews_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyRoles" ADD CONSTRAINT "agencyRoles_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyRolePermissions" ADD CONSTRAINT "agencyRolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "agencyRoles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyRolePermissions" ADD CONSTRAINT "agencyRolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyMembership" ADD CONSTRAINT "agencyMembership_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyMembership" ADD CONSTRAINT "agencyMembership_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyMembership" ADD CONSTRAINT "agencyMembership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyMembership" ADD CONSTRAINT "agencyMembership_agencyRolesId_fkey" FOREIGN KEY ("agencyRolesId") REFERENCES "agencyRoles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyJoinRequests" ADD CONSTRAINT "agencyJoinRequests_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyJoinRequests" ADD CONSTRAINT "agencyJoinRequests_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyInvites" ADD CONSTRAINT "agencyInvites_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyInvites" ADD CONSTRAINT "agencyInvites_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_agencyAnalyticsId_fkey" FOREIGN KEY ("agencyAnalyticsId") REFERENCES "agencyAnalytics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyAddresses" ADD CONSTRAINT "agencyAddresses_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentTaskProgress" ADD CONSTRAINT "agentTaskProgress_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentTaskProgress" ADD CONSTRAINT "agentTaskProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyTaskProgress" ADD CONSTRAINT "agencyTaskProgress_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyTaskProgress" ADD CONSTRAINT "agencyTaskProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyDocuments" ADD CONSTRAINT "agencyDocuments_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyBankAccounts" ADD CONSTRAINT "agencyBankAccounts_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolePermissions" ADD CONSTRAINT "rolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolePermissions" ADD CONSTRAINT "rolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyAmenities" ADD CONSTRAINT "propertyAmenities_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyAmenities" ADD CONSTRAINT "propertyAmenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "PropertyStructure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImages" ADD CONSTRAINT "PropertyImages_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyStructureLocale" ADD CONSTRAINT "PropertyStructureLocale_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "PropertyStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyPricing" ADD CONSTRAINT "propertyPricing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyVideo" ADD CONSTRAINT "PropertyVideo_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyNearbyPlaces" ADD CONSTRAINT "propertyNearbyPlaces_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floorPlan" ADD CONSTRAINT "floorPlan_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyDocuments" ADD CONSTRAINT "propertyDocuments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyDocuments" ADD CONSTRAINT "propertyDocuments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyAnalytics" ADD CONSTRAINT "propertyAnalytics_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyAnalytics" ADD CONSTRAINT "propertyAnalytics_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyApplications" ADD CONSTRAINT "propertyApplications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyApplications" ADD CONSTRAINT "propertyApplications_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyApplications" ADD CONSTRAINT "propertyApplications_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketingEvents" ADD CONSTRAINT "marketingEvents_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketingEvents" ADD CONSTRAINT "marketingEvents_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventPropertyLink" ADD CONSTRAINT "eventPropertyLink_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "marketingEvents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventPropertyLink" ADD CONSTRAINT "eventPropertyLink_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventImages" ADD CONSTRAINT "eventImages_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "marketingEvents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyBoosts" ADD CONSTRAINT "propertyBoosts_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyBoosts" ADD CONSTRAINT "propertyBoosts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyCredits" ADD CONSTRAINT "agencyCredits_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditTransactions" ADD CONSTRAINT "creditTransactions_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditTransactions" ADD CONSTRAINT "creditTransactions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "marketingEvents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditTransactions" ADD CONSTRAINT "creditTransactions_boostId_fkey" FOREIGN KEY ("boostId") REFERENCES "propertyBoosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditTransactions" ADD CONSTRAINT "creditTransactions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditTransactions" ADD CONSTRAINT "creditTransactions_agencyCreditsId_fkey" FOREIGN KEY ("agencyCreditsId") REFERENCES "agencyCredits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adminRoleLink" ADD CONSTRAINT "adminRoleLink_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adminRoleLink" ADD CONSTRAINT "adminRoleLink_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "adminRoles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolePermissionLink" ADD CONSTRAINT "rolePermissionLink_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "adminRoles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolePermissionLink" ADD CONSTRAINT "rolePermissionLink_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "adminPermissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adminActivityLogs" ADD CONSTRAINT "adminActivityLogs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyTransactions" ADD CONSTRAINT "propertyTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyTransactions" ADD CONSTRAINT "propertyTransactions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyTransactions" ADD CONSTRAINT "propertyTransactions_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyMonitors" ADD CONSTRAINT "propertyMonitors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
