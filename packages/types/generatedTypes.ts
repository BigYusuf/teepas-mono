// Auto-generated from Prisma schema
// ⚠️ Do not edit directly — run "pnpm generate:types" instead

export enum AgentRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export type AgentRoleType = keyof typeof AgentRole;

export const AgentRoleOptions = Object.entries(AgentRole).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum ApplicationAgencyStatus {
  PENDING = "PENDING",
  INSPECTION_APPROVED = "INSPECTION_APPROVED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type ApplicationAgencyStatusType = keyof typeof ApplicationAgencyStatus;

export const ApplicationAgencyStatusOptions = Object.entries(
  ApplicationAgencyStatus
).map(([label, value]) => ({
  label,
  value,
}));

export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
}

export type ApplicationStatusType = keyof typeof ApplicationStatus;

export const ApplicationStatusOptions = Object.entries(ApplicationStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum BoostStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export type BoostStatusType = keyof typeof BoostStatus;

export const BoostStatusOptions = Object.entries(BoostStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum EventSliderStatus {
  BOOKED = "BOOKED",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
}

export type EventSliderStatusType = keyof typeof EventSliderStatus;

export const EventSliderStatusOptions = Object.entries(EventSliderStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum EventSliderSlot {
  HOME_SLIDER_1 = "HOME_SLIDER_1",
  HOME_SLIDER_2 = "HOME_SLIDER_2",
  HOME_SLIDER_3 = "HOME_SLIDER_3",
  HOME_SLIDER_4 = "HOME_SLIDER_4",
  HOME_SLIDER_5 = "HOME_SLIDER_5",
  CATEGORY_SLIDER = "CATEGORY_SLIDER",
}

export type EventSliderSlotType = keyof typeof EventSliderSlot;

export const EventSliderSlotOptions = Object.entries(EventSliderSlot).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum agencyddressType {
  HEAD_OFFICE = "HEAD_OFFICE",
  BRANCH = "BRANCH",
  WAREHOUSE = "WAREHOUSE",
}

export type agencyddressTypeType = keyof typeof agencyddressType;

export const agencyddressTypeOptions = Object.entries(agencyddressType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum AgencySteps {
  incomplete = "incomplete",
  pending_address = "pending_address",
  pending_docs = "pending_docs",
  pending_bank = "pending_bank",
  complete = "complete",
}

export type AgencyStepsType = keyof typeof AgencySteps;

export const AgencyStepsOptions = Object.entries(AgencySteps).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum addressType {
  Home = "Home",
  Work = "Work",
  Other = "Other",
}

export type addressTypeType = keyof typeof addressType;

export const addressTypeOptions = Object.entries(addressType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum ApplicationUserStatus {
  PENDING = "PENDING",
  INSPECTION_SCHEDULED = "INSPECTION_SCHEDULED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export type ApplicationUserStatusType = keyof typeof ApplicationUserStatus;

export const ApplicationUserStatusOptions = Object.entries(
  ApplicationUserStatus
).map(([label, value]) => ({
  label,
  value,
}));

export enum ShowAddress {
  ALL = "ALL",
  APPROVED_ONLY = "APPROVED_ONLY",
}

export type ShowAddressType = keyof typeof ShowAddress;

export const ShowAddressOptions = Object.entries(ShowAddress).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum PropertyType {
  SELF_CONTAIN = "SELF_CONTAIN",
  MINI_FLAT = "MINI_FLAT",
  ONE_BEDROOM_FLAT = "ONE_BEDROOM_FLAT",
  TWO_BEDROOM_FLAT = "TWO_BEDROOM_FLAT",
  THREE_BEDROOM_FLAT = "THREE_BEDROOM_FLAT",
  FOUR_BEDROOM_FLAT = "FOUR_BEDROOM_FLAT",
  FIVE_BEDROOM_FLAT = "FIVE_BEDROOM_FLAT",
  ROOM_ONLY = "ROOM_ONLY",
  SHOP = "SHOP",
  OFFICE_SPACE = "OFFICE_SPACE",
  SHORT_LET = "SHORT_LET",
  LAND = "LAND",
  OTHER = "OTHER",
}

export type PropertyTypeType = keyof typeof PropertyType;

export const PropertyTypeOptions = Object.entries(PropertyType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum FloorType {
  TILED = "TILED",
  CEMENT = "CEMENT",
  WOODEN = "WOODEN",
  MARBLE = "MARBLE",
  VINYL = "VINYL",
  LAMINATE = "LAMINATE",
}

export type FloorTypeType = keyof typeof FloorType;

export const FloorTypeOptions = Object.entries(FloorType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum RoofType {
  ALUMINUM = "ALUMINUM",
  ASBESTOS = "ASBESTOS",
  CONCRETE = "CONCRETE",
  THATCH = "THATCH",
  ZINC = "ZINC",
}

export type RoofTypeType = keyof typeof RoofType;

export const RoofTypeOptions = Object.entries(RoofType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum WallFinish {
  PAINTED = "PAINTED",
  WALLPAPER = "WALLPAPER",
  BARE_CEMENT = "BARE_CEMENT",
  POP = "POP",
}

export type WallFinishType = keyof typeof WallFinish;

export const WallFinishOptions = Object.entries(WallFinish).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum CeilingType {
  POP = "POP",
  PVC = "PVC",
  WOODEN = "WOODEN",
  GYPSUM_BOARD = "GYPSUM_BOARD",
}

export type CeilingTypeType = keyof typeof CeilingType;

export const CeilingTypeOptions = Object.entries(CeilingType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum DesignType {
  BUNGALOW = "BUNGALOW",
  DUPLEX = "DUPLEX",
  DETACHED_HOUSE = "DETACHED_HOUSE",
  SEMI_DETACHED_HOUSE = "SEMI_DETACHED_HOUSE",
  TERRACED_HOUSE = "TERRACED_HOUSE",
  MAISONETTE = "MAISONETTE",
  PENTHOUSE = "PENTHOUSE",
  STOREY_BUILDING = "STOREY_BUILDING",
  FACE_ME_I_FACE_YOU = "FACE_ME_I_FACE_YOU",
  BLOCK_OF_FLATS = "BLOCK_OF_FLATS",
  MANSION = "MANSION",
  OTHER = "OTHER",
}

export type DesignTypeType = keyof typeof DesignType;

export const DesignTypeOptions = Object.entries(DesignType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum PropertyPurpose {
  RESIDENTIAL = "RESIDENTIAL",
  COMMERCIAL = "COMMERCIAL",
  MIXED_USE = "MIXED_USE",
  SHORT_LET = "SHORT_LET",
  HOSTEL = "HOSTEL",
  TENEMENT = "TENEMENT",
  SERVICED_APARTMENT = "SERVICED_APARTMENT",
}

export type PropertyPurposeType = keyof typeof PropertyPurpose;

export const PropertyPurposeOptions = Object.entries(PropertyPurpose).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum EconomicClass {
  LUXURY = "LUXURY",
  MIDDLE_CLASS = "MIDDLE_CLASS",
  LOW_INCOME = "LOW_INCOME",
  INFORMAL = "INFORMAL",
}

export type EconomicClassType = keyof typeof EconomicClass;

export const EconomicClassOptions = Object.entries(EconomicClass).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum BuildingMaterial {
  CEMENT_BLOCK = "CEMENT_BLOCK",
  MUD = "MUD",
  WOODEN = "WOODEN",
  CONTAINER = "CONTAINER",
  BRICK = "BRICK",
  BAMBOO_THATCH = "BAMBOO_THATCH",
}

export type BuildingMaterialType = keyof typeof BuildingMaterial;

export const BuildingMaterialOptions = Object.entries(BuildingMaterial).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum PropertyCategory {
  RENT = "RENT",
  SALE = "SALE",
  LEASE = "LEASE",
  SHORT_LET = "SHORT_LET",
}

export type PropertyCategoryType = keyof typeof PropertyCategory;

export const PropertyCategoryOptions = Object.entries(PropertyCategory).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum ListingStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  RENTED = "RENTED",
  SOLD = "SOLD",
  ARCHIVED = "ARCHIVED",
  DRAFT = "DRAFT",
}

export type ListingStatusType = keyof typeof ListingStatus;

export const ListingStatusOptions = Object.entries(ListingStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum FurnishingStatus {
  FURNISHED = "FURNISHED",
  SEMI_FURNISHED = "SEMI_FURNISHED",
  UNFURNISHED = "UNFURNISHED",
}

export type FurnishingStatusType = keyof typeof FurnishingStatus;

export const FurnishingStatusOptions = Object.entries(FurnishingStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum ParkingType {
  GARAGE = "GARAGE",
  CARPORT = "CARPORT",
  DRIVEWAY = "DRIVEWAY",
  STREET = "STREET",
  VALET = "VALET",
  COMPOUND = "COMPOUND",
  OFF_SITE = "OFF_SITE",
  NO_PARKING = "NO_PARKING",
}

export type ParkingTypeType = keyof typeof ParkingType;

export const ParkingTypeOptions = Object.entries(ParkingType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum OwnershipType {
  FREEHOLD = "FREEHOLD",
  LEASEHOLD = "LEASEHOLD",
  SHARE_OF_FREEHOLD = "SHARE_OF_FREEHOLD",
  COMMONHOLD = "COMMONHOLD",
}

export type OwnershipTypeType = keyof typeof OwnershipType;

export const OwnershipTypeOptions = Object.entries(OwnershipType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum BathroomType {
  EN_SUITE = "EN_SUITE",
  SHARED = "SHARED",
  JACK_AND_JILL = "JACK_AND_JILL",
  HALF_BATH = "HALF_BATH",
  FULL_BATH = "FULL_BATH",
}

export type BathroomTypeType = keyof typeof BathroomType;

export const BathroomTypeOptions = Object.entries(BathroomType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum BedroomType {
  MASTER_BEDROOM = "MASTER_BEDROOM",
  GUEST_BEDROOM = "GUEST_BEDROOM",
  CHILDRENS_BEDROOM = "CHILDRENS_BEDROOM",
  STUDIO_ROOM = "STUDIO_ROOM",
  DORMITORY = "DORMITORY",
}

export type BedroomTypeType = keyof typeof BedroomType;

export const BedroomTypeOptions = Object.entries(BedroomType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum SecurityFeature {
  CCTV = "CCTV",
  GATED_COMMUNITY = "GATED_COMMUNITY",
  SECURITY_GUARD = "SECURITY_GUARD",
  ALARM_SYSTEM = "ALARM_SYSTEM",
  INTERCOM = "INTERCOM",
  FIREPLACE = "FIREPLACE",
  NO_SECURITY = "NO_SECURITY",
}

export type SecurityFeatureType = keyof typeof SecurityFeature;

export const SecurityFeatureOptions = Object.entries(SecurityFeature).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum OutdoorFeature {
  GARDEN = "GARDEN",
  BALCONY = "BALCONY",
  TERRACE = "TERRACE",
  SWIMMING_POOL = "SWIMMING_POOL",
  PLAYGROUND = "PLAYGROUND",
  OUTDOOR_KITCHEN = "OUTDOOR_KITCHEN",
}

export type OutdoorFeatureType = keyof typeof OutdoorFeature;

export const OutdoorFeatureOptions = Object.entries(OutdoorFeature).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum IndoorFeature {
  AIR_CONDITIONING = "AIR_CONDITIONING",
  HEATING = "HEATING",
  FIREPLACE = "FIREPLACE",
  HARDWOOD_FLOORS = "HARDWOOD_FLOORS",
  WALK_IN_CLOSET = "WALK_IN_CLOSET",
  LAUNDRY_ROOM = "LAUNDRY_ROOM",
}

export type IndoorFeatureType = keyof typeof IndoorFeature;

export const IndoorFeatureOptions = Object.entries(IndoorFeature).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum Amenity {
  GYM = "GYM",
  SPA = "SPA",
  CLUBHOUSE = "CLUBHOUSE",
  TENNIS_COURT = "TENNIS_COURT",
  BASKETBALL_COURT = "BASKETBALL_COURT",
  GOLF_COURSE = "GOLF_COURSE",
}

export type AmenityType = keyof typeof Amenity;

export const AmenityOptions = Object.entries(Amenity).map(([label, value]) => ({
  label,
  value,
}));

export enum NearbyLocation {
  SCHOOL = "SCHOOL",
  HOSPITAL = "HOSPITAL",
  SHOPPING_MALL = "SHOPPING_MALL",
  PUBLIC_TRANSPORT = "PUBLIC_TRANSPORT",
  PARK = "PARK",
  RESTAURANT = "RESTAURANT",
}

export type NearbyLocationType = keyof typeof NearbyLocation;

export const NearbyLocationOptions = Object.entries(NearbyLocation).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum ConditionStatus {
  NEW = "NEW",
  GOOD = "GOOD",
  NEEDS_RENOVATION = "NEEDS_RENOVATION",
  OLD = "OLD",
}

export type ConditionStatusType = keyof typeof ConditionStatus;

export const ConditionStatusOptions = Object.entries(ConditionStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum Tag {
  NEW_LISTING = "NEW_LISTING",
  PRICE_REDUCED = "PRICE_REDUCED",
  OPEN_HOUSE = "OPEN_HOUSE",
  HOT_PROPERTY = "HOT_PROPERTY",
  EXCLUSIVE = "EXCLUSIVE",
}

export type TagType = keyof typeof Tag;

export const TagOptions = Object.entries(Tag).map(([label, value]) => ({
  label,
  value,
}));

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  NGN = "NGN",
  KES = "KES",
  GHS = "GHS",
  ZAR = "ZAR",
}

export type CurrencyType = keyof typeof Currency;

export const CurrencyOptions = Object.entries(Currency).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum Duration {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export type DurationType = keyof typeof Duration;

export const DurationOptions = Object.entries(Duration).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum PaymentFrequency {
  ONE_TIME = "ONE_TIME",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
}

export type PaymentFrequencyType = keyof typeof PaymentFrequency;

export const PaymentFrequencyOptions = Object.entries(PaymentFrequency).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum LeaseTerm {
  SIX_MONTHS = "SIX_MONTHS",
  ONE_YEAR = "ONE_YEAR",
  TWO_YEARS = "TWO_YEARS",
  THREE_YEARS = "THREE_YEARS",
  FIVE_YEARS = "FIVE_YEARS",
}

export type LeaseTermType = keyof typeof LeaseTerm;

export const LeaseTermOptions = Object.entries(LeaseTerm).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum AvailabilityStatus {
  AVAILABLE_NOW = "AVAILABLE_NOW",
  AVAILABLE_FROM_DATE = "AVAILABLE_FROM_DATE",
  COMING_SOON = "COMING_SOON",
}

export type AvailabilityStatusType = keyof typeof AvailabilityStatus;

export const AvailabilityStatusOptions = Object.entries(AvailabilityStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum ConstructionStatus {
  COMPLETED = "COMPLETED",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
  PLANNED = "PLANNED",
}

export type ConstructionStatusType = keyof typeof ConstructionStatus;

export const ConstructionStatusOptions = Object.entries(ConstructionStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum HeatingType {
  CENTRAL_HEATING = "CENTRAL_HEATING",
  ELECTRIC_HEATING = "ELECTRIC_HEATING",
  GAS_HEATING = "GAS_HEATING",
  SOLAR_HEATING = "SOLAR_HEATING",
  NO_HEATING = "NO_HEATING",
}

export type HeatingTypeType = keyof typeof HeatingType;

export const HeatingTypeOptions = Object.entries(HeatingType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum CoolingType {
  CENTRAL_COOLING = "CENTRAL_COOLING",
  WINDOW_UNIT = "WINDOW_UNIT",
  SPLIT_SYSTEM = "SPLIT_SYSTEM",
  EVAPORATIVE_COOLING = "EVAPORATIVE_COOLING",
  NO_COOLING = "NO_COOLING",
}

export type CoolingTypeType = keyof typeof CoolingType;

export const CoolingTypeOptions = Object.entries(CoolingType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum WaterSupplyType {
  MUNICIPAL = "MUNICIPAL",
  WELL = "WELL",
  BOREHOLE = "BOREHOLE",
  RAINWATER_HARVESTING = "RAINWATER_HARVESTING",
  NO_WATER_SUPPLY = "NO_WATER_SUPPLY",
}

export type WaterSupplyTypeType = keyof typeof WaterSupplyType;

export const WaterSupplyTypeOptions = Object.entries(WaterSupplyType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum ElectricityType {
  GRID = "GRID",
  SOLAR = "SOLAR",
  GENERATOR = "GENERATOR",
  INVERTER = "INVERTER",
  GRID_SOLAR = "GRID_SOLAR",
  GRID_GENERATOR = "GRID_GENERATOR",
  GRID_INVERTER_SOLAR = "GRID_INVERTER_SOLAR",
  NO_ELECTRICITY = "NO_ELECTRICITY",
}

export type ElectricityTypeType = keyof typeof ElectricityType;

export const ElectricityTypeOptions = Object.entries(ElectricityType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum MeterType {
  PREPAID = "PREPAID",
  POSTPAID = "POSTPAID",
  NO_METER = "NO_METER",
}

export type MeterTypeType = keyof typeof MeterType;

export const MeterTypeOptions = Object.entries(MeterType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum KitchenType {
  PRIVATE = "PRIVATE",
  SHARED = "SHARED",
  OUTDOOR = "OUTDOOR",
}

export type KitchenTypeType = keyof typeof KitchenType;

export const KitchenTypeOptions = Object.entries(KitchenType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum ToiletLocation {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  SHARED = "SHARED",
}

export type ToiletLocationType = keyof typeof ToiletLocation;

export const ToiletLocationOptions = Object.entries(ToiletLocation).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum PetPolicy {
  NOT_ALLOWED = "NOT_ALLOWED",
  ALLOWED = "ALLOWED",
  NEGOTIABLE = "NEGOTIABLE",
  REQUIRES_APPROVAL = "REQUIRES_APPROVAL",
}

export type PetPolicyType = keyof typeof PetPolicy;

export const PetPolicyOptions = Object.entries(PetPolicy).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum DocumentType {
  COFO = "COFO", // Certificate of Occupancy = "COFO // Certificate of Occupancy",
  SURVEY_PLAN = "SURVEY_PLAN",
  DEED = "DEED",
  ALLOCATION_LETTER = "ALLOCATION_LETTER",
  BUILDING_PLAN = "BUILDING_PLAN",
  TAX_RECEIPT = "TAX_RECEIPT",
  OTHER = "OTHER",
}

export type DocumentTypeType = keyof typeof DocumentType;

export const DocumentTypeOptions = Object.entries(DocumentType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum EventType {
  AGENCY = "AGENCY",
  PROPERTY = "PROPERTY",
  GLOBAL = "GLOBAL",
}

export type EventTypeType = keyof typeof EventType;

export const EventTypeOptions = Object.entries(EventType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum EventStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
  UPCOMING = "UPCOMING",
  SUSPENDED = "SUSPENDED",
  TERMINATED = "TERMINATED",
}

export type EventStatusType = keyof typeof EventStatus;

export const EventStatusOptions = Object.entries(EventStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum PlatformType {
  WEB = "WEB",
  MOBILE = "MOBILE",
  BOTH = "BOTH",
}

export type PlatformTypeType = keyof typeof PlatformType;

export const PlatformTypeOptions = Object.entries(PlatformType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum BoostTier {
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

export type BoostTierType = keyof typeof BoostTier;

export const BoostTierOptions = Object.entries(BoostTier).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum CreditType {
  EARNED = "EARNED",
  SPENT = "SPENT",
  PURCHASED = "PURCHASED",
  REFUNDED = "REFUNDED",
}

export type CreditTypeType = keyof typeof CreditType;

export const CreditTypeOptions = Object.entries(CreditType).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum AdminStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  DEACTIVATED = "DEACTIVATED",
}

export type AdminStatusType = keyof typeof AdminStatus;

export const AdminStatusOptions = Object.entries(AdminStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export type OrderStatusType = keyof typeof OrderStatus;

export const OrderStatusOptions = Object.entries(OrderStatus).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export enum NotifyFrequency {
  IMMEDIATE = "IMMEDIATE",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
}

export type NotifyFrequencyType = keyof typeof NotifyFrequency;

export const NotifyFrequencyOptions = Object.entries(NotifyFrequency).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export interface images {
  id: string;
  fileId: string;
  url: string;
  users: users[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface users {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string | null;
  following: String[];
  avatar: images | null;
  agencyReviews: agencyReviews[];
  imagesId: string | null;
  followings: followers[];
  applications: propertyApplications[];
  propertyTransactions: propertyTransactions[];
  createdAt: Date;
  updatedAt: Date | null;
  propertyMonitors: propertyMonitors[];
}

export interface agencyReviews {
  id: string;
  userId: string;
  user: users;
  rating: number;
  reviews: string | null;
  agencyId: string | null;
  agencies: agencies | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface agencyInvites {
  id: string;
  email: string;
  token: string;
  agencyId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date | null;
  agency: agencies;
}

export interface followers {
  id: string;
  userId: string;
  agencyId: string;
  user: users;
  agencies: agencies | null;
}

export interface agencies {
  id: string;
  name: string;
  bio: string | null;
  category: string;
  operatingAreas: String[];
  website: string | null;
  email: string | null;
  phone: string | null;
  supportEmail: string | null;
  openingHours: string | null;
  commissionRate: number | null;
  servicesOffered: String[];
  yearEstablished: number | null;
  businessRegNumber: string | null;
  taxId: string | null;
  verified: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  step: string;
  currentStep: number;
  ownerId: string;
  owner: agents;
  agents: agents[];
  avatar: string | null;
  coverBanner: string | null;
  socialLinks: JSON[];
  logoUrl: string | null;
  videoIntro: string | null;
  followers: followers[];
  reviews: agencyReviews[];
  properties: properties[];
  propertyTransactions: propertyTransactions[];
  propertyApplications: propertyApplications[];
  propertyAnalytics: propertyAnalytics[];
  agencyCredits: agencyCredits | null;
  events: marketingEvents[];
  promotions: promotions[];
  propertyBoosts: propertyBoosts[];
  transactions: creditTransactions[];
  invites: agencyInvites[];
  addresses: agencyAddresses[];
  documents: agencyDocuments | null;
  analytics: agencyAnalytics | null;
  bankAccounts: agencyBankAccounts[];
  agencyAnalyticsId: string | null;
}

export interface agencyAddresses {
  id: string;
  agencyId: string;
  label: agencyddressType;
  name: string;
  street: string;
  city: string;
  zip: string;
  state: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  agency: agencies;
}

export interface agents {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  password: string;
  stripeId: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  agencyId: string | null;
  agency: agencies | null;
  ownedAgency: agencies | null;
  role: AgentRole;
  properties: properties[];
  propertyDocuments: propertyDocuments[];
}

export interface agencyDocuments {
  id: string;
  agencyId: string;
  businessCertificate: string | null;
  proofOfAddress: string | null;
  ownerIdCard: string | null;
  insuranceDocument: string | null;
  signedAgreement: string | null;
  verifiedByAdmin: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  agency: agencies;
}

export interface agencyBankAccounts {
  id: string;
  agencyId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  agency: agencies;
}

export interface site_config {
  id: string;
  categories: String[];
  subCategories: JSON;
  logo: string | null;
  banner: string | null;
}

export interface promotions {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
  agentId: string;
  createdAt: Date;
  updatedAt: Date | null;
  agencies: agencies | null;
  agenciesId: string | null;
  creditTransactions: creditTransactions[];
}

export interface properties {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: PropertyCategory | null;
  type: PropertyType | null;
  designType: DesignType | null;
  purpose: PropertyPurpose | null;
  economicClass: EconomicClass | null;
  customSpecifications: JSON | null;
  customFeatures: JSON | null;
  tags: String[];
  furnishing: FurnishingStatus | null;
  sizeSqm: number | null;
  landSizeSqm: number | null;
  yearBuilt: number | null;
  condition: ConditionStatus | null;
  availableFrom: Date | null;
  video_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  showTo: ShowAddress | null;
  coordinates: JSON | null;
  ratings: number | null;
  views: number | null;
  favorites: number | null;
  structureId: string | null;
  structure: PropertyStructure | null;
  electricity: ElectricityType | null;
  electricBilling: MeterType | null;
  waterSupply: WaterSupplyType | null;
  cooling: CoolingType | null;
  heating: HeatingType | null;
  construction: ConstructionStatus | null;
  availability: AvailabilityStatus | null;
  floorType: FloorType | null;
  roofType: RoofType | null;
  wallFinish: WallFinish | null;
  ceilingType: CeilingType | null;
  buildingMaterial: BuildingMaterial | null;
  amenities: String[];
  nearByLocation: String[];
  status: ListingStatus;
  progressStep: number;
  isPublished: boolean;
  verified: boolean | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  isDeleted: boolean | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  images: PropertyImages[];
  documents: propertyDocuments[];
  pricing: propertyPricing | null;
  floorPlans: floorPlan[];
  propertyBoosts: propertyBoosts[];
  propertyAnalytics: propertyAnalytics | null;
  propertyTransactions: propertyTransactions[];
  applications: propertyApplications[];
  agencyId: string;
  agency: agencies;
  agentId: string | null;
  agent: agents | null;
  PropertyVideo: PropertyVideo[];
  eventPropertyLink: eventPropertyLink[];
}

export interface PropertyImages {
  id: string;
  propertyId: string;
  property: properties;
  fileId: string;
  url: string;
  caption: string | null;
  type: string | null;
  isCover: boolean;
  order: number | null;
  createdAt: Date;
}

export interface PropertyStructureLocale {
  id: string;
  structureId: string;
  countryCode: string;
  localName: string;
  description: string | null;
  examples: String[];
  structure: PropertyStructure;
}

export interface PropertyStructure {
  id: string;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  livingRooms: number | null;
  kitchens: number | null;
  kitchenType: KitchenType | null;
  toiletLocation: ToiletLocation | null;
  isWholeBuilding: boolean | null;
  isServiced: boolean | null;
  floorLevel: number | null;
  hasBalcony: boolean | null;
  petPolicy: PetPolicy | null;
  petDetails: JSON | null;
}

export interface propertyPricing {
  id: string;
  propertyId: string;
  basePrice: number;
  cautionFee: number | null;
  agentFee: number | null;
  legalFee: number | null;
  serviceCharge: number | null;
  paymentType: PropertyCategory | null;
  paymentFrequency: PaymentFrequency | null;
  leaseTerm: LeaseTerm | null;
  currency: string | null;
  negotiable: boolean | null;
  createdAt: Date;
  updatedAt: Date | null;
  property: properties;
}

export interface PropertyVideo {
  id: string;
  propertyId: string;
  property: properties;
  fileId: string;
  url: string;
  thumbnail: string | null;
  title: string | null;
  duration: number | null;
  createdAt: Date;
}

export interface floorPlan {
  id: string;
  propertyId: string;
  property: properties;
  fileId: string;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  layout: JSON | null;
}

export interface propertyDocuments {
  id: string;
  propertyId: string | null;
  name: string;
  type: DocumentType;
  url: string;
  fileId: string;
  uploadedById: string | null;
  verified: boolean | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  property: properties | null;
  uploadedBy: agents | null;
}

export interface userAnalytics {
  id: string;
  userId: string;
  country: string | null;
  city: string | null;
  device: string | null;
  lastVisited: Date;
  actions: JSON | null;
  recommendations: JSON | null;
  lastTrained: Date;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface propertyAnalytics {
  id: string;
  propertyId: string;
  agencyId: string;
  views: number;
  inquiries: number;
  saved: number;
  applications: number;
  rents: number;
  sales: number;
  lastViewedAt: Date;
  boostedViews: number;
  boostedRents: number;
  boostedSales: number;
  createdAt: Date;
  updatedAt: Date | null;
  agency: agencies;
  property: properties;
}

export interface agencyAnalytics {
  id: string;
  totalVisitors: number;
  countryStats: JSON | null;
}

export interface uniqueAgencyVisitors {
  id: string;
  agencyId: string;
  userId: string;
  visitedAt: Date;
}

export interface propertyApplications {
  id: string;
  userId: string;
  propertyId: string;
  agencyId: string | null;
  userStatus: ApplicationUserStatus;
  agencyStatus: ApplicationAgencyStatus;
  overallStatus: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date | null;
  user: users;
  property: properties;
  agency: agencies | null;
}

export interface address {
  id: string;
  userId: string;
  label: addressType;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface notifications {
  id: string;
  creatorId: string | null;
  receiverId: string;
  redirect_link: string | null;
  title: string;
  message: string;
  status: string;
  type: string | null;
  channel: string | null;
  meta: JSON | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface conversationGroup {
  id: string;
  isGroup: boolean;
  name: string | null;
  creatorId: string;
  participantIds: String[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface participant {
  id: string;
  conversationId: string;
  userId: string | null;
  agentId: string | null;
  lastSeenAt: Date | null;
  isOnline: boolean;
  unreadCount: number;
  muted: boolean;
  joinedAt: Date;
}

export interface message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string | null;
  attachments: String[];
  status: string;
  createdAt: Date;
}

export interface marketingEvents {
  id: string;
  title: string;
  description: string | null;
  platforms: PlatformType[];
  showOnHomepage: boolean;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  pointsUsed: number;
  type: EventType;
  agencyId: string | null;
  adminId: string | null;
  agency: agencies | null;
  admin: admins | null;
  images: eventImages[];
  transactions: creditTransactions[];
  propertyLinks: eventPropertyLink[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface eventPropertyLink {
  id: string;
  eventId: string;
  propertyId: string;
  marketingEvent: marketingEvents;
  property: properties;
}

export interface eventImages {
  id: string;
  fileId: string;
  url: string;
  eventId: string | null;
  event: marketingEvents | null;
  platform: PlatformType | null;
  createdAt: Date;
}

export interface propertyBoosts {
  id: string;
  agencyId: string;
  propertyId: string;
  tier: BoostTier;
  creditsSpent: number;
  startTime: Date;
  endTime: Date;
  status: BoostStatus;
  priorityScore: number;
  agency: agencies;
  property: properties;
  createdAt: Date;
  creditTransactions: creditTransactions[];
}

export interface agencyCredits {
  id: string;
  agencyId: string;
  balance: number;
  lastUpdated: Date;
  agency: agencies;
  transactions: creditTransactions[];
  createdAt: Date;
}

export interface creditTransactions {
  id: string;
  agencyId: string;
  type: CreditType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string | null;
  purpose: string | null;
  note: string | null;
  eventId: string | null;
  boostId: string | null;
  promotionId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  agency: agencies;
  marketingEvent: marketingEvents | null;
  propertyBoost: propertyBoosts | null;
  promotion: promotions | null;
  agencyCredits: agencyCredits | null;
  agencyCreditsId: string | null;
}

export interface creditSettings {
  id: string;
  action: string;
  tier: string | null;
  cost: number;
  currencyValue: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface admins {
  id: string;
  name: string;
  email: string;
  password: string;
  status: AdminStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  roleLinks: adminRoleLink[];
  logs: adminActivityLogs[];
  events: marketingEvents[];
}

export interface adminRoleLink {
  id: string;
  adminId: string;
  roleId: string;
  admin: admins;
  role: adminRoles;
}

export interface adminRoles {
  id: string;
  name: string;
  description: string | null;
  permissionLinks: rolePermissionLink[];
  roleLinks: adminRoleLink[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface adminPermissions {
  id: string;
  code: string;
  description: string | null;
  permissionLinks: rolePermissionLink[];
}

export interface rolePermissionLink {
  id: string;
  roleId: string;
  permissionId: string;
  role: adminRoles;
  permission: adminPermissions;
}

export interface adminActivityLogs {
  id: string;
  adminId: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  description: string | null;
  createdAt: Date;
  admin: admins;
}

export interface propertyTransactions {
  id: string;
  type: PropertyCategory;
  userId: string;
  propertyId: string;
  agencyId: string;
  startDate: Date | null;
  endDate: Date | null;
  amount: number | null;
  paymentRef: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date | null;
  user: users;
  property: properties;
  agency: agencies;
}

export interface propertyMonitors {
  id: string;
  userId: string;
  name: string | null;
  location: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string | null;
  category: PropertyCategory | null;
  frequency: NotifyFrequency;
  isActive: boolean;
  lastCheckedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: users;
}

export interface nonitorNotifications {
  id: string;
  userId: string;
  title: string;
  message: string;
  data: JSON | null;
  channel: string;
  read: boolean;
  createdAt: Date;
}

export interface monitorSentHistory {
  id: string;
  monitorId: string;
  propertyId: string;
  sentAt: Date;
}
