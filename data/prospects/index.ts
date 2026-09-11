import type { Prospect } from "@/lib/types";
import kenonPlumbers from "./kenon-plumbers.json";
import westfieldAutocare from "./westfield-autocare.json";
import clearwaterLandscapes from "./clearwater-landscapes.json";
import thePlumbingMerchant from "./the-plumbing-merchant.json";
import mgmPlumbingSupplies from "./mgm-plumbing-supplies.json";
import cityPlumbingLondon from "./city-plumbing-london.json";
import khPatelHornsey from "./kh-patel-hornsey.json";
import centrePlumbingHeating from "./centre-plumbing-heating.json";
import theWaterShop from "./the-water-shop.json";
import ivesPlumbersMerchants from "./ives-plumbers-merchants.json";

/**
 * Prepared prospects that live in the repo.
 *
 * To add one: drop a new JSON file in this folder following the same shape as
 * kenon-plumbers.json, then add it to the array below. Nothing else to change.
 */
export const FILE_PROSPECTS: Prospect[] = [
  cityPlumbingLondon as Prospect,
  kenonPlumbers as Prospect,
  thePlumbingMerchant as Prospect,
  mgmPlumbingSupplies as Prospect,
  khPatelHornsey as Prospect,
  centrePlumbingHeating as Prospect,
  theWaterShop as Prospect,
  ivesPlumbersMerchants as Prospect,
  westfieldAutocare as Prospect,
  clearwaterLandscapes as Prospect,
];
