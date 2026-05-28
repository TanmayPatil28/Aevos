import { SPPU_2019_REGULATION, SPPU_2015_REGULATION, SPPU_2024_REGULATION } from "./sppu";
import { MU_2019_REGULATION } from "./mu";
import { COEP_2022_REGULATION } from "./coep";
import { ANNA_2021_REGULATION } from "./annau";
import { VTU_2022_REGULATION } from "./vtu";
import { JNTUH_2022_REGULATION } from "./jntuh";
import { JSPM_UNIVERSITY_REGULATION } from "./jspmUniversity";
import { RSCOE_AUTONOMOUS_REGULATION } from "./rscoeAutonomous";

export * from "./sppu";
export * from "./mu";
export * from "./coep";
export * from "./annau";
export * from "./vtu";
export * from "./jntuh";
export * from "./jspmUniversity";
export * from "./rscoeAutonomous";

export const REGULATIONS_MAP = new Map([
  ["sppu", SPPU_2019_REGULATION],
  ["sppu_2015", SPPU_2015_REGULATION],
  ["sppu_2024", SPPU_2024_REGULATION],
  ["mu", MU_2019_REGULATION],
  ["coep", COEP_2022_REGULATION],
  ["anna", ANNA_2021_REGULATION],
  ["vtu", VTU_2022_REGULATION],
  ["jntuh", JNTUH_2022_REGULATION],
  ["jspm_university_wagholi", JSPM_UNIVERSITY_REGULATION],
  ["jspm", RSCOE_AUTONOMOUS_REGULATION],
]);
