// @ts-nocheck
const invalidIDMessage = "ID must only contain english characters and underscores";
const invalidNameMessage = "Name must be a valid, non-empty string";
const invalidHexMessage = "must be 3 or 6 characters long, only containing the characters a-f and numbers 0-9 (inclusive)";
const invalidMediaMessage = "Media must be a non-empty file path relative to the root of your mod directory";
export function mapDataIsValid(data: WorldMapData): {isValid: true} | {isValid: false, reason: string}{
  const { id, name, bgTiles, worldSize, hexScale, hexBorderColour, activePOIBorderColour, origin, startingLocation, fastTravelGroups, pointsOfInterest, hexes, masteryBonuses } = data;
  const { dimensions, tileSize, tilePath } = bgTiles;

  let errorMessagePrefix = "";

  if(isIDValid(id)) return generateError("Map " + invalidIDMessage);
  if(!name || typeof name !== "string") return generateError("Map " + invalidNameMessage);
  if(!Number.isInteger(dimensions.x) || !Number.isInteger(dimensions.y)) return generateError("Background Tile dimensions must be integers");
  if(!isPointDataValid(dimensions, true)) return generateError("There must be a non-zero integer amount of background tiles");
  if(!isPointDataValid(tileSize)) return generateError("Background Tile dimensions must be numbers");
  if(!tilePath) return generateError("The must be a valid background tile file path");
  if(!isPointDataValid(worldSize)) generateError("World Size dimensions must be numbers");
  if(!isPointDataValid(hexScale)) generateError("Hex Scale must be a pair of numbers");
  if(!isValidHexColour(hexBorderColour)) return generateError("Hex Border Colour " + invalidHexMessage);
  if(!isValidHexColour(activePOIBorderColour)) return generateError("Active POI Border Colour " + invalidHexMessage);
  if(!isPointDataValid(origin)) return generateError("Origin values must be numbers");
  if(!isHexCoordDataValid(startingLocation)) generateError("Starting Location values must be integers");

  let fastTravelGroupsAreValid: {isValid: true} | {isValid: false, reason: string} = { isValid: true };
  for(const fastTravelGroup of fastTravelGroups){
    const { id, name, media } = fastTravelGroup;
    errorMessagePrefix = `Fast travel group with id "${id}" and name "${name}" is not valid.`;
    if(!isIDValid(id)){fastTravelGroupsAreValid = generateError(invalidIDMessage); break};
    if(!name || typeof name !== "string"){fastTravelGroupsAreValid = generateError(invalidNameMessage); break};
    if(!media || typeof name !== "string"){fastTravelGroupsAreValid = generateError(invalidMediaMessage); break};
  }
  if(!fastTravelGroupsAreValid.isValid) return fastTravelGroupsAreValid;

  let pointsOfInterestAreValid: {isValid: true} | {isValid: false, reason: string} = { isValid: true};
  for(const pointOfInterest of pointsOfInterest){
    const { id, name, description, media, activeModifiers, fastTravel: fastTravelGroup, discoveryRewards, discoveryModifiers, hidden, type } = pointOfInterest;
    errorMessagePrefix = `Point of Interest with id "${id}" and name "${name}" is not valid.`;
    if(!isIDValid(id)){ pointsOfInterestAreValid = generateError(invalidIDMessage); break};
    if(!name){ pointsOfInterestAreValid = generateError(invalidNameMessage); break};
    if(typeof description !== "string"){pointsOfInterestAreValid = generateError("Description must be a string"); break};
    if(!media || typeof name !== "string"){pointsOfInterestAreValid = generateError(invalidMediaMessage); break};
    if(activeModifiers !== undefined) for(const key of Object.keys(activeModifiers)) if(!key || typeof key !== "string"){pointsOfInterestAreValid = generateError(`Active modifier with key "${key}" is not valid. Key must be a string`); break};

    if(fastTravelGroup !== undefined){
      const errorPrefix = `Fast travel group with group id ${fastTravelGroup.groupID} is not valid.`;
      if(!isIDValid(fastTravelGroup.groupID)){pointsOfInterestAreValid = generateError(`${errorPrefix} ${invalidIDMessage}`); break};
      const isCostValid = isFixedCostValid(fastTravelGroup.unlockCosts);
      if(!isCostValid.isValid){
        isCostValid.reason = isCostValid.reason;
        pointsOfInterestAreValid = isCostValid;
        break;
      }
    }

    const isDiscoveryRewardValid = isFixedCostValid(discoveryRewards, true);
    if(!isDiscoveryRewardValid.isValid){pointsOfInterestAreValid = generateError(`Discovery reward is invalid. ${isDiscoveryRewardValid.reason}`); break};

    let areDiscoveryModifiersValid: {isValid: true} | {isValid: false, reason: string} = { isValid: true};
    if(discoveryModifiers !== undefined){
      errorMessagePrefix = "Discovery reward modifiers are invalid.";
      let modifiersAreValid = areModifiersValid(discoveryModifiers.modifiers);
      if(!modifiersAreValid.isValid){areDiscoveryModifiersValid = modifiersAreValid;break};
      if(!Number.isInteger(discoveryModifiers.moves) || discoveryModifiers.moves < 1){pointsOfInterestAreValid = generateError(`Number of moves must be a positive integer greater than 0`); break};
    }
    if(!areDiscoveryModifiersValid.isValid) return areDiscoveryModifiersValid;
    
    if(hidden !== undefined){
      let areRequirementsValid: {isValid: true} | {isValid: false, reason: string} = isValidRequirements(hidden.requirements);
      if(!areRequirementsValid.isValid) break;
    }
  }
  if(!pointsOfInterestAreValid.isValid) return pointsOfInterestAreValid;

  let areHexesValid: {isValid: true} | {isValid: false, reason: string} = { isValid: true};
  for(let i = 0; i < hexes.length; i++){
    const hex = hexes[i];
    errorMessagePrefix = `Hex ${i + 1} is invalid.`;
    const { coordinates, maxSurveyLevel, maxMasteryLevel, requirements, travelCost, isWater} = hex;
    if(!isHexCoordDataValid(coordinates)){areHexesValid = generateError(`Hex axial coordinates are invalid`); break};
    if(!Number.isInteger(maxSurveyLevel) || maxSurveyLevel < 1){areHexesValid = generateError(`Hex max survey level must be an integer greater than 0`); break};
    if(!Number.isInteger(maxMasteryLevel) || maxMasteryLevel < 1){areHexesValid = generateError(`Hex max mastery level must be an integer greater than 0`); break};
    const areRequirementsValid = isValidRequirements(requirements);
    if(!areRequirementsValid.isValid){areHexesValid = areRequirementsValid; break};
    const areCostsValid = isFixedCostValid(hex.travelCost);
    if(!areCostsValid){areHexesValid = areCostsValid; break};
    if(typeof isWater !== "boolean"){areHexesValid = generateError(`Hex isWater must be a boolean (true or false)`); break};
  }
  if(!areHexesValid) return areHexesValid;

  let areMasteryBonusesValid: {isValid: true} | {isValid: false, reason: string} = { isValid: true};
  for(const masteryBonus of masteryBonuses){
    const { id, modifiers, pets, gp, sc, items } = masteryBonus;
    errorMessagePrefix = `Mastery bonus with id "${id}" is invalid.`;
    if(!isIDValid(id)){areMasteryBonusesValid = generateError(`Mastery bonus ID ${invalidIDMessage}`); break};
    const modifiersAreValid = areModifiersValid(modifiers);
    if(!modifiersAreValid.isValid){areMasteryBonusesValid = modifiersAreValid; break};
    if(pets !== undefined){
      let arePetsValid: {isValid: true} | {isValid: false, reason: string} = { isValid: true};
      for(const pet of pets) if(!isIDValid(pet, true)){arePetsValid = generateError(`Pet with id "${pet}" is invalid`); break};
      if(!arePetsValid.isValid){areMasteryBonusesValid = arePetsValid; break};
    }
    const areGPSCItemsValid = isFixedCostValid({gp, sc, items}, true);
    if(!areGPSCItemsValid){areMasteryBonusesValid = areGPSCItemsValid; break};
  }
  if(!areMasteryBonusesValid) return areMasteryBonusesValid;

  function generateError(reason: string): {isValid: false, reason: string}{
    return { isValid: false, reason: `${errorMessagePrefix} ${reason}`};
  }

  return {isValid: true};
}

function isFixedCostValid(cost: FixedCostsData | undefined, isReward: boolean = false): { isValid: true} | {isValid: false, reason: string}{
  if(cost === undefined) return { isValid: true };

  function generateError(reason: string): {isValid: false, reason: string}{
    return {isValid: false, reason};
  }

  const {gp, sc, items} = cost;

  let isValid: { isValid: true} | {isValid: false, reason: string} = { isValid: true};
  const prefix = isReward ? "Reward" : "Unlock cost"
  if(sc !== undefined) if(!Number.isInteger(sc) || sc < 1) isValid = generateError(`${prefix} "sc" must be either undefined or an integer greater than 0`);
  if(gp !== undefined) if(!Number.isInteger(gp) || gp < 1) isValid = generateError(`${prefix} "gp" must be either undefined or an integer greater than 0`);
  if(items !== undefined){
    for(const item of items){
      const invalidItemPrefix = `${prefix} item with id ${item.id} is not valid.`
      if(isIDValid(item.id), true) isValid = generateError(`${invalidItemPrefix} ${invalidIDMessage}`);
      if(!Number.isInteger(item.quantity) || item.quantity < 1) isValid = generateError(`${invalidItemPrefix} Item quantity must be an integer greater than 0`);
    }
  }
  return isValid;
}

function isIDValid(id: string, namespaced: boolean = false): boolean{
  if(!namespaced) return !!id && /^\\w+$/.test(id);
  return !!id && /^\\w+:\\w+$/.test(id);
}

function isPointDataValid(pointData: PointData, mustBeIntegers: boolean = false): boolean{
  pointData.x = Number(pointData.x)
  pointData.x = Number(pointData.y);
  if(Number.isNaN(pointData.x) || Number.isNaN(pointData.y)) return false;
  if(mustBeIntegers && (!Number.isInteger(pointData.x) || !Number.isInteger(pointData.y))) return false;
  return true;
}

function isHexCoordDataValid(hexCoordData: HexCoordData): boolean{
  hexCoordData.q = Number(hexCoordData.q)
  hexCoordData.r = Number(hexCoordData.r);
  if(Number.isNaN(hexCoordData.q) || Number.isNaN(hexCoordData.r)) return false;
  if(!Number.isInteger(hexCoordData.q) || !Number.isInteger(hexCoordData.r)) return false;
  return true;
}

function isValidHexColour(hexString: string): boolean{
  const validCharacters: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "a", "b", "c", "d", "e", "f"];
  if(hexString.length !== 3 && hexString.length !== 6) return false;
  let isValid = true;
  for(const character of hexString.toLowerCase()) if(!validCharacters.includes(character)) isValid = false;
  return isValid;
}

function areModifiersValid(modifiers: Partial<ModifierObject<SkillModifierData[], number>> | undefined): {isValid: true} | {isValid: false, reason: string}{
  let isValid: {isValid: true} | {isValid: false, reason: string} = { isValid: true};
  if(modifiers === undefined) return isValid;
  function generateError(reason: string): {isValid: false, reason: string}{
    return {isValid: false, reason};
  }
  for(const key of Object.keys(modifiers)){
    const value = modifiers[key];
    if(typeof value !== "number"){isValid = generateError(`Modifier Value for key "${key}" must be a number`); break};
  }
  return isValid;
}

function isValidRequirements(requirements: AnyRequirementData[]): {isValid: true} | {isValid: false, reason: string}{
  if(requirements.length === 0) return { isValid: true };

  function generateError(reason: string): {isValid: false, reason: string}{
    return {isValid: false, reason: `${prefix} ${reason}`};
  }
  let prefix = "";
  let areRequirementsValid: {isValid: true} | {isValid: false, reason: string} = {isValid: true};
  for(let i = 0; i < requirements.length; i++){
    const requirement = requirements[i];
    prefix = `Hidden Requirement ${i + 1} with type ${requirement.type} is invalid.`
    const positiveInteger = "must be an integer greater than 0";
    switch(requirement.type){
      case "SkillLevel":
        if(!isIDValid(requirement.skillID, true)){areRequirementsValid = generateError(`Skill ID "${requirement.skillID}" is not valid`); break};
        if(!Number.isInteger(requirement.level) || requirement.level < 1){areRequirementsValid = generateError(`Skill Level requirement ${positiveInteger}`); break};
        break;
      case "AllSkillLevels":
        if(requirement.exceptions !== undefined){
          let isSkillIDValid: {isValid: true} | {isValid: false, reason: string} = { isValid: true };
          for(const skillID of requirement.exceptions) if(!isIDValid(skillID, true)){isSkillIDValid = generateError(`Skill exception with ID "${skillID}" is invalid`); break};
          if(!isSkillIDValid.isValid){areRequirementsValid = isSkillIDValid ;break};
        }
        if(!Number.isInteger(requirement.level) || requirement.level < 1){areRequirementsValid = generateError(`Skill Level requirement ${positiveInteger}`); break};
        break;
      case "DungeonCompletion":
        if(!isIDValid(requirement.dungeonID, true)){areRequirementsValid = generateError(`Dungeon ID "${requirement.dungeonID}" is not valid`); break};
        if(!Number.isInteger(requirement.count) || requirement.count < 1){areRequirementsValid = generateError(`Dungeon Completion Count ${positiveInteger}`); break};
        break;
      case "Completion":
        if(!isIDValid(requirement.namespace)){areRequirementsValid = generateError(`Completion Namespace requirement ${invalidIDMessage}`); break};
        if(isNaN(Number(requirement.percent)) || requirement.percent < 0 || requirement.percent > 100){areRequirementsValid = generateError(`Completion percent requirement must be a number between 0 and 100 (inclusive)`); break};
        break;
      case "ShopPurchase":
        if(!isIDValid(requirement.purchaseID, true)){areRequirementsValid = generateError(`Shop Purchase ID is not valid`); break};
        if(!Number.isInteger(requirement.count) || requirement.count < 1){areRequirementsValid = generateError(`Shop Purchase Count ${positiveInteger}`); break};
        break;
      case "SlayerItem":
        if(!isIDValid(requirement.itemID, true)){areRequirementsValid = generateError(`Slayer Item $equirement ID is invalid`); break};
        break;
      case "SlayerTask":
        const validSlayerTiers = ["Easy", "Normal", "Hard", "Elite", "Master", "Legendary", "Mythical"];
        if(!validSlayerTiers.includes(requirement.tier)){areRequirementsValid = generateError(`Slayer Task Requirement Tier is invalid. It must be one of the following: ${JSON.stringify(validSlayerTiers)}`); break};
        if(!Number.isInteger(requirement.count) || requirement.count < 1){areRequirementsValid = generateError(`Slayer Task Count requirement ${positiveInteger}`); break};
        break;
      case "ItemFound":
        if(!isIDValid(requirement.itemID, true)){areRequirementsValid = generateError(`Item Found Requirement ID is invalid`); break};
        break;
      case "MonsterKilled":
        if(!isIDValid(requirement.monsterID, true)){areRequirementsValid = generateError(`Monster Killed Requirement ID is invalid`); break};
        if(!Number.isInteger(requirement.count || requirement.count < 1)){areRequirementsValid = generateError(`Monster Killed Requirement count ${positiveInteger}`); break};
        break;
      case "TownshipTask":
        if(!Number.isInteger(requirement.count || requirement.count < 1)){areRequirementsValid = generateError(`Township Task Requirement count ${positiveInteger}`); break};
        break;
      case "TownshipTutorialTask":
        if(!Number.isInteger(requirement.count || requirement.count < 1)){areRequirementsValid = generateError(`Township Tutorial Task Requirement count ${positiveInteger}`); break};
        break;
      case "TownshipBuilding":
        if(!isIDValid(requirement.buildingID, true)){areRequirementsValid = generateError(`Township Building Requirement ID is invalid`); break};
        if(!Number.isInteger(requirement.count || requirement.count < 1)){areRequirementsValid = generateError(`Township Tutorial Task Requirement count ${positiveInteger}`); break};
        break;
      case "CartographyHexDiscovery":
        if(!isIDValid(requirement.worldMapID, true)){areRequirementsValid = generateError(`Cartography Hex Discover Requirement World Map ID is invalid`); break};
        if(!Number.isInteger(requirement.count || requirement.count < 1)){areRequirementsValid = generateError(`Cartography Hex Discovery Requirement count ${positiveInteger}`); break};
        break;
      case "CartographyPOIDiscovery":
        if(!isIDValid(requirement.worldMapID, true)){areRequirementsValid = generateError(`Cartography POI Discovery Requirement ID is invalid`); break};
        for(const poiID of requirement.poiIDs) if(!isIDValid(poiID, true)){areRequirementsValid = generateError(`Cartography POI Discovery Requirement POI ID is invalid`); break};
        break;
      case "ArchaeologyItemsDonated":
        if(!Number.isInteger(requirement.count || requirement.count < 1)){areRequirementsValid = generateError(`Archaeology Items Donated Requirement count ${positiveInteger}`); break};
        break;
      default:
      areRequirementsValid = generateError(`Requirement type is invalid. Type must be one of: "SkillLevel", "AllSkillLevels", "DungeonCompletion", "Completion", "ShopPurchase", "SlayerItem", "ItemFound", "MonsterKilled", "TownshipTask", "TownshipTutorialTask", "TownshipBuilding", "CartographyHexDiscovery", "CartographyPOIDiscovery", "ArchaeologyItemsDonated"`);  
      break;
    }
  }
  
  return areRequirementsValid;
}