import { RecordStatus } from "@/common/enums/record-status.enum";
import { CurrencyType } from "@/modules/offering/shared/enums/currency-type.enum";

import { OfferingExpenseSearchType } from "@/modules/offering/expense/enums/offering-expense-search-type.enum";
import { OfferingExpenseSearchSubType } from "@/modules/offering/expense/enums/offering-expense-search-sub-type.enum";

interface SeedOfferingExpenses {
  //* General Info
  type: string;
  subType?: string;
  amount: string | number;
  currency: string;
  date: Date;
  comments?: string;
  imageUrls?: string[];
  reasonElimination?: string;
  recordStatus?: string;

  //* Relations
  churchId?: string;
}

interface SeedDataOfferingExpenses {
  operationalOfferingExpenses: SeedOfferingExpenses[];
  maintenanceAndRepairOfferingExpenses: SeedOfferingExpenses[];
  decorationOfferingExpenses: SeedOfferingExpenses[];
  equipmentAndTechnologyOfferingExpenses: SeedOfferingExpenses[];
  suppliesOfferingExpenses: SeedOfferingExpenses[];
  planingEventsOfferingExpenses: SeedOfferingExpenses[];
  otherOfferingExpenses: SeedOfferingExpenses[];
  adjustmentOfferingExpenses: SeedOfferingExpenses[];
}

//! Helpers
const getLastSaturdays = (referenceDate: Date, count: number): Date[] => {
  const saturdays: Date[] = [];
  let currentDate = new Date(referenceDate);

  while (saturdays.length < count) {
    if (currentDate.getDay() === 6) {
      saturdays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return saturdays.reverse().filter((date) => date <= referenceDate);
};

const getLastFridays = (referenceDate: Date, count: number): Date[] => {
  const fridays: Date[] = [];
  let currentDate = new Date(referenceDate);

  while (fridays.length < count) {
    if (currentDate.getDay() === 5) {
      fridays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return fridays.reverse().filter((date) => date <= referenceDate);
};

const getRandomAmount = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const today = new Date();
const lastSaturdays = getLastSaturdays(today, 6);
const lastFridays = getLastFridays(today, 6);

const OperationalExpensesSubTypes = [
  OfferingExpenseSearchSubType.VenueRental,
  OfferingExpenseSearchSubType.PublicServices,
  OfferingExpenseSearchSubType.TransportationAndTravelAllowance,
  OfferingExpenseSearchSubType.InsuranceAndTaxes,
  OfferingExpenseSearchSubType.SecurityAndSurveillance,
  OfferingExpenseSearchSubType.OtherAdministrativeExpenses,
];
const MaintenanceAndRepairExpensesSubTypes = [
  OfferingExpenseSearchSubType.PlumbingServices,
  OfferingExpenseSearchSubType.ElectricalServices,
  OfferingExpenseSearchSubType.PaintingAndTouchUpsServices,
  OfferingExpenseSearchSubType.CleaningServices,
  OfferingExpenseSearchSubType.HeatingAndACSystemMaintenance,
  OfferingExpenseSearchSubType.SoundAndLightingEquipmentMaintenance,
];
const DecorationExpensesSubTypes = [
  OfferingExpenseSearchSubType.PurchaseFlowersAndPlants,
  OfferingExpenseSearchSubType.PurchaseDecorativeFurniture,
  OfferingExpenseSearchSubType.PurchaseDecorativeItems,
  OfferingExpenseSearchSubType.DecorationServices,
  OfferingExpenseSearchSubType.LightingAndIlluminationServices,
  OfferingExpenseSearchSubType.StageSetupServices,
];
const EquipmentAndTechnologyExpensesSubTypes = [
  OfferingExpenseSearchSubType.CleaningEquipment,
  OfferingExpenseSearchSubType.AudioVideoRecordingEquipment,
  OfferingExpenseSearchSubType.OfficeFurniture,
  OfferingExpenseSearchSubType.KitchenFurniture,
  OfferingExpenseSearchSubType.GeneralFurniture,
  OfferingExpenseSearchSubType.MusicalInstruments,
];
const SuppliesExpensesSubTypes = [
  OfferingExpenseSearchSubType.KitchenUtensils,
  OfferingExpenseSearchSubType.OfficeSupplies,
  OfferingExpenseSearchSubType.CookingIngredients,
  OfferingExpenseSearchSubType.CleaningMaterials,
  OfferingExpenseSearchSubType.PackagingMaterials,
  OfferingExpenseSearchSubType.SundaySchoolMaterials,
];
const PlaningEventsExpensesSubTypes = [
  OfferingExpenseSearchSubType.ExternalVenueRental,
  OfferingExpenseSearchSubType.FoodAndBeverage,
  OfferingExpenseSearchSubType.TransportationSpecialGuests,
  OfferingExpenseSearchSubType.EquipmentTransportation,
  OfferingExpenseSearchSubType.RentalTechnicalEquipment,
  OfferingExpenseSearchSubType.EducationalMaterials,
];
const otherOfferingExpensesSubTypes = [
  OfferingExpenseSearchSubType.FraternalSupport,
  OfferingExpenseSearchSubType.EmergencyRepairs,
  OfferingExpenseSearchSubType.HospitalityExpenses,
  OfferingExpenseSearchSubType.MissionDonations,
  OfferingExpenseSearchSubType.TrainingAndEducation,
  OfferingExpenseSearchSubType.LegalAndAdministrative,
];


export const dataOfferingExpenses: SeedDataOfferingExpenses = {

  //* Operational Expenses
  operationalOfferingExpenses: lastFridays.map((date, index) => ({
    type: OfferingExpenseSearchType.OperationalExpenses,
    subType: OperationalExpensesSubTypes[index],
    amount: getRandomAmount(300, 800).toFixed(2),
    currency: CurrencyType.PEN,
    date,
    comments: undefined,
    imageUrls: [],
    reasonElimination: undefined,
    recordStatus: RecordStatus.Active,
  })),

  //* Maintenance And Repair Expenses
  maintenanceAndRepairOfferingExpenses: lastSaturdays.map((date, index) => ({
    type: OfferingExpenseSearchType.MaintenanceAndRepairExpenses,
    subType: MaintenanceAndRepairExpensesSubTypes[index],
    amount: getRandomAmount(300, 800).toFixed(2),
    currency: CurrencyType.PEN,
    date,
    comments: undefined,
    imageUrls: [],
    reasonElimination: undefined,
    recordStatus: RecordStatus.Active,
  })),

  //* Decoration Expenses
  decorationOfferingExpenses: lastFridays.map((date, index) => ({
    type: OfferingExpenseSearchType.DecorationExpenses,
    subType: DecorationExpensesSubTypes[index],
    amount: getRandomAmount(300, 800).toFixed(2),
    currency: CurrencyType.PEN,
    date,
    comments: undefined,
    imageUrls: [],
    reasonElimination: undefined,
    recordStatus: RecordStatus.Active,
  })),

  //* EquipmentAndTechnology Expenses
  equipmentAndTechnologyOfferingExpenses: lastSaturdays.map((date, index) => ({
    type: OfferingExpenseSearchType.EquipmentAndTechnologyExpenses,
    subType: EquipmentAndTechnologyExpensesSubTypes[index],
    amount: getRandomAmount(300, 800).toFixed(2),
    currency: CurrencyType.PEN,
    date,
    comments: undefined,
    imageUrls: [],
    reasonElimination: undefined,
    recordStatus: RecordStatus.Active,
  })),

  //* Supplies Expenses
  suppliesOfferingExpenses: lastFridays.map((date, index) => ({
    type: OfferingExpenseSearchType.SuppliesExpenses,
    subType: SuppliesExpensesSubTypes[index],
    amount: getRandomAmount(300, 800).toFixed(2),
    currency: CurrencyType.PEN,
    date,
    comments: undefined,
    imageUrls: [],
    reasonElimination: undefined,
    recordStatus: RecordStatus.Active,
  })),

  //* PlaningEvents Expenses
  planingEventsOfferingExpenses: lastSaturdays.map((date, index) => ({
    type: OfferingExpenseSearchType.PlaningEventsExpenses,
    subType: PlaningEventsExpensesSubTypes[index],
    amount: getRandomAmount(300, 800).toFixed(2),
    currency: CurrencyType.PEN,
    date,
    comments: undefined,
    imageUrls: [],
    reasonElimination: undefined,
    recordStatus: RecordStatus.Active,
  })),

  //* Other Expenses
  otherOfferingExpenses: lastFridays.map((date, index) => ({
    type: OfferingExpenseSearchType.OtherExpenses,
    subType: otherOfferingExpensesSubTypes[index],
    amount: getRandomAmount(300, 800).toFixed(2),
    currency: CurrencyType.PEN,
    date,
    comments: undefined,
    imageUrls: [],
    reasonElimination: undefined,
    recordStatus: RecordStatus.Active,
  })),

  //* Adjustment Expenses
  adjustmentOfferingExpenses: lastSaturdays.map((date) => ({
    type: OfferingExpenseSearchType.ExpensesAdjustment,
    amount: getRandomAmount(300, 800).toFixed(2),
    currency: CurrencyType.PEN,
    date,
    comments: undefined,
    imageUrls: [],
    reasonElimination: undefined,
    recordStatus: RecordStatus.Active,
  })),
};