import { countries } from "@/utils/countires";
import {
  buildingMaterialOptions,
  ceilingTypeOptions,
  coolingTypeOptions,
  floorTypeOptions,
  heatingTypeOptions,
  wallFinishOptions,
} from "./property";

export const addressFields = [
  { name: "address", label: "Street", type: "text", required: true },
  { name: "city", label: "City", type: "text", required: true },
  { name: "state", label: "State", type: "text", required: true },
  {
    name: "country",
    label: "Country",
    type: "select",
    options: countries.map((c) => ({ label: c.name, value: c.code })),
    required: true,
  },
  {
    name: "showTo",
    label: "Visible To",
    type: "select",
    options: [
      { label: "All Users", value: "ALL" },
      { label: "Approved Users Only", value: "APPROVED_ONLY" },
    ],
  },
] as any;

export const interiorFields = [
  {
    name: "floorType",
    label: "Floor Type",
    type: "select",
    showLabel: true,
    options: floorTypeOptions,
  },
  {
    name: "wallFinish",
    label: "Wall",
    showLabel: true,
    type: "select",
    options: wallFinishOptions,
  },
  {
    name: "ceilingType",
    label: "Ceiling",
    showLabel: true,
    type: "select",
    options: ceilingTypeOptions,
  },
  {
    name: "buildingMaterial",
    showLabel: true,
    label: "Building Material",
    type: "select",
    options: buildingMaterialOptions,
  },
  {
    name: "cooling",
    label: "Cooling System",
    showLabel: true,
    type: "select",
    options: coolingTypeOptions,
  },
  {
    name: "heating",
    label: "Heating System",
    type: "select",
    showLabel: true,
    // showLabel: true,
    options: heatingTypeOptions,
  },
  { name: "yearBuilt", label: "Year Built", showLabel: true, type: "text" },
  { name: "squareFeet", label: "Square Feet", showLabel: true, type: "text" },
] as any;
