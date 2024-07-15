const fs = require("fs");

const readJSONFromFile = (filePath) => {
  try {
    const jsonString = fs.readFileSync(filePath, "utf8");
    return JSON.parse(jsonString);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return null;
  }
};

const getEnergyRechargeRequirement = (burstCost, energyPerBurst) =>
  parseFloat(Math.max(1, burstCost / energyPerBurst) * 100).toFixed(1);

const getEnergyFromChar = (
  receivingCharElement,
  particlesPerSec,
  rotLength,
  particlesElement,
  feed
) => {
  let energy = particlesPerSec * rotLength;

  if (particlesElement === "clear") {
    energy *= 2;
  } else if (particlesElement === receivingCharElement) {
    energy *= 3;
  }

  energy *= feed * 1 + (1 - feed) * 0.6;

  return energy;
};

const calculateEnergyRecharge = () => {
  const characters = readJSONFromFile("./data/characters.json");
  const burstTypes = readJSONFromFile("./data/burst_types.json");
  const team = ["Arlecchino", "Bennett", "Yelan", "Thoma"];
  const rotLength = 20;

  const energyPerBurst = team.reduce((acc, char) => {
    const {
      element,
      types: [{ particles: skillParticles }],
    } = characters[char];
    team.forEach((teammate, idx) => {
      const { element: teammateElement } = characters[teammate];
      const particlesPerSec = (skillParticles * 1) / rotLength;
      const feed = idx === team.indexOf(char) ? 1 : 0;
      acc[teammate] += getEnergyFromChar(
        teammateElement,
        particlesPerSec,
        rotLength,
        element,
        feed
      );
    });
    return acc;
  }, Object.fromEntries(team.map((char) => [char, 0])));

  team.forEach((char) => {
    const { burst_type: burstType } = characters[char];
    const burstCost = burstTypes[burstType].cost;
    const erReq = getEnergyRechargeRequirement(burstCost, energyPerBurst[char]);
    console.log(char, erReq);
  });
};

calculateEnergyRecharge();
