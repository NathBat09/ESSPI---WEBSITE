// calculations.js
export const calculateBS = (VLE, SLE, duration, category) => {
  const factor = category === "CL" ? 1.2 : category === "DL" ? 1.75 : 0;
  return (category === "CL" ? VLE : category === "DL" ? SLE : 0) * duration * factor;
};

export const calculateCS = (BS) => {
  return BS * 271;
};

export const calculatePVSS = (VLE, SLE, peaksunhours) => {
    return (VLE + SLE) / peaksunhours;
};

export const calculatePVSC = (PVSS) => {
  return PVSS * 0.75;
};