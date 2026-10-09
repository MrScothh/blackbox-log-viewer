// Workspace presets for INAV logs, one for multirotors and one for planes, in the slots 1 to 9 and 0 of the workspace
// menu. Fields are given by name only: their scales follow the log's own data, and a field the log does not have is
// left out (GraphConfig.extendFields).
const field = (name) => ({ name, color: -1 });
const graph = (label, names, height = 1) => ({ label, height, fields: names.map(field) });
const axes = ["roll", "pitch", "yaw"];

function tuning(axis, outputs) {
  const i = axes.indexOf(axis);
  return {
    title: axis.charAt(0).toUpperCase() + axis.slice(1),
    graphConfig: [
      outputs,
      graph(`Gyro and setpoint ${axis}`, [`gyroADC[${i}]`, `axisRate[${i}]`], 2),
      graph(`PID ${axis}`, [`axisP[${i}]`, `axisI[${i}]`, `axisD[${i}]`, `axisF[${i}]`], 2),
    ],
  };
}

const battery = {
  title: "Battery",
  graphConfig: [
    graph("Voltage", ["vbat", "sagCompensatedVBat"]),
    graph("Current", ["amperage"]),
    graph("Throttle", ["rcCommand[3]"]),
  ],
};

const gps = {
  title: "GPS",
  graphConfig: [
    graph("Satellites and HDOP", ["GPS_numSat", "GPS_hdop"]),
    graph("Position error", ["navEPH", "navEPV"]),
    graph("Ground speed", ["GPS_speed"]),
  ],
};

const debug = { title: "Debug", graphConfig: [graph("Debug", ["debug[all]"], 2)] };

export const INAV_MULTIROTOR_WORKSPACES = [
  {
    title: "RC",
    graphConfig: [graph("RC channels", ["rcData[all]"]), graph("RC command", ["rcCommand[all]"])],
  },
  tuning("roll", graph("Motors", ["motor[all]"])),
  tuning("pitch", graph("Motors", ["motor[all]"])),
  tuning("yaw", graph("Motors", ["motor[all]"])),
  {
    title: "Gyro filtering",
    graphConfig: [graph("Unfiltered gyro", ["gyroRaw[all]"]), graph("Filtered gyro", ["gyroADC[all]"])],
  },
  {
    title: "Altitude hold",
    graphConfig: [
      graph("Altitude", ["navPos[2]", "navTgtPos[2]", "BaroAlt"]),
      graph("Vertical speed", ["navVel[2]", "navTgtVel[2]"]),
      graph("Vertical speed controller", ["mcVelAxisP[2]", "mcVelAxisI[2]", "mcVelAxisD[2]", "mcVelAxisOut[2]"]),
      graph("Throttle", ["rcCommand[3]"]),
    ],
  },
  {
    title: "Position hold",
    graphConfig: [
      graph("Position", ["navPos[0]", "navTgtPos[0]", "navPos[1]", "navTgtPos[1]"]),
      graph("Horizontal speed", ["navVel[0]", "navTgtVel[0]", "navVel[1]", "navTgtVel[1]"]),
      graph("Speed controller", ["mcVelAxisOut[0]", "mcVelAxisOut[1]"]),
    ],
  },
  battery,
  gps,
  debug,
];

export const INAV_FIXED_WING_WORKSPACES = [
  {
    title: "RC",
    graphConfig: [graph("RC channels", ["rcData[all]"]), graph("RC command", ["rcCommand[all]"])],
  },
  tuning("roll", graph("Servos", ["servo[all]"])),
  tuning("pitch", graph("Servos", ["servo[all]"])),
  tuning("yaw", graph("Servos", ["servo[all]"])),
  {
    title: "Attitude",
    graphConfig: [
      graph("Attitude", ["attitude[0]", "attitude[1]"]),
      graph("RC command", ["rcCommand[0]", "rcCommand[1]"]),
    ],
  },
  {
    title: "Altitude",
    graphConfig: [
      graph("Altitude", ["navPos[2]", "navTgtPos[2]", "BaroAlt"]),
      graph("Altitude controller", ["fwAltP", "fwAltI", "fwAltD", "fwAltOut"]),
      graph("Throttle", ["motor[0]"]),
    ],
  },
  {
    title: "Navigation",
    graphConfig: [
      graph("Navigation state", ["navState", "activeWpNumber"]),
      graph("Position controller", ["fwPosP", "fwPosI", "fwPosD", "fwPosOut"]),
      graph("Heading", ["attitude[2]", "navTgtHdg"]),
    ],
  },
  {
    title: "Airspeed",
    graphConfig: [
      graph("Speed", ["AirSpeed", "GPS_speed"]),
      graph("Auto speed controller", ["fwAutoSpeedP", "fwAutoSpeedI"]),
      graph("Wind", ["wind[all]"]),
    ],
  },
  battery,
  debug,
];
