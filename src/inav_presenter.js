// INAV fields shown with the firmware's own names; the tables come from tools/inav-defs.mjs (src/inav_defs.js)
import {
  INAV_RC_MODE_NAMES,
  INAV_FLIGHT_MODE_NAMES,
  INAV_STATE_FLAG_NAMES,
  INAV_FAILSAFE_PHASE_NAMES,
  INAV_NAV_STATE_NAMES,
  INAV_NAV_FLAG_NAMES,
  INAV_HW_HEALTH_SENSORS,
  INAV_HW_HEALTH_STATUS,
} from "./inav_defs.js";

// Names of the set bits; offset is the bit number of bit 0 (flightModeFlags2 carries RC modes 32-63)
function presentBits(value, names, offset = 0) {
  const set = [];
  for (let bit = 0; bit < 32; bit++) {
    if ((value >>> bit) & 1) {
      set.push(names[bit + offset] ?? `BIT${bit + offset}`);
    }
  }
  return set.length ? set.join("|") : "NONE";
}

function presentValue(value, names) {
  return names[value] ?? String(value);
}

// Two bits per sensor; sensors that are not fitted (status NONE) are left out
function presentHwHealth(value) {
  const sensors = [];
  INAV_HW_HEALTH_SENSORS.forEach((sensor, index) => {
    const status = (value >>> (index * 2)) & 3;
    if (status) {
      sensors.push(`${sensor} ${INAV_HW_HEALTH_STATUS[status] ?? status}`);
    }
  });
  return sensors.length ? sensors.join(", ") : "NONE";
}

// Text for an INAV field, or undefined when the shared presenter already shows it correctly
export function decodeInavField(fieldName, value) {
  switch (fieldName) {
    case "flightModeFlags":
      return presentBits(value, INAV_RC_MODE_NAMES);
    case "flightModeFlags2":
      return presentBits(value, INAV_RC_MODE_NAMES, 32);
    case "activeFlightModeFlags":
      return presentBits(value, INAV_FLIGHT_MODE_NAMES);
    case "stateFlags":
      return presentBits(value, INAV_STATE_FLAG_NAMES);
    case "failsafePhase":
      return presentValue(value, INAV_FAILSAFE_PHASE_NAMES);
    case "navState":
      return presentValue(value, INAV_NAV_STATE_NAMES);
    case "navFlags":
      return presentBits(value, INAV_NAV_FLAG_NAMES);
    case "hwHealthStatus":
      return presentHwHealth(value);
    default:
      return undefined;
  }
}
