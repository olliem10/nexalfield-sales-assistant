import type { Prospect } from "@/lib/types";
import kenonPlumbers from "./kenon-plumbers.json";
import westfieldAutocare from "./westfield-autocare.json";
import clearwaterLandscapes from "./clearwater-landscapes.json";

/**
 * Prepared prospects that live in the repo.
 *
 * To add one: drop a new JSON file in this folder following the same shape as
 * kenon-plumbers.json, then add it to the array below. Nothing else to change.
 */
export const FILE_PROSPECTS: Prospect[] = [
  kenonPlumbers as Prospect,
  westfieldAutocare as Prospect,
  clearwaterLandscapes as Prospect,
];
