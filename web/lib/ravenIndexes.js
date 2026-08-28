const { IndexDefinition } = require("ravendb");

// A real static map-reduce index (not a dynamic/collection-scan query) so the
// dashboard's aggregate stats stay fast no matter how large the Pets
// collection grows — and so the demo can show the actual query duration as
// proof, not just claim it.
const PET_STATS_INDEX_NAME = "Pets/StatsBySpeciesAndStatus";

function buildPetStatsIndex() {
  const definition = new IndexDefinition();
  definition.name = PET_STATS_INDEX_NAME;
  definition.maps = new Set([
    `map('Pets', function (pet) {
      return {
        Species: pet.Species,
        Status: pet.Status,
        Origin: pet.Origin,
        Count: 1
      };
    })`,
  ]);
  definition.reduce = `
    groupBy(x => ({ Species: x.Species, Status: x.Status, Origin: x.Origin }))
      .aggregate(g => ({
        Species: g.key.Species,
        Status: g.key.Status,
        Origin: g.key.Origin,
        Count: g.values.reduce((sum, x) => sum + x.Count, 0)
      }))
  `;
  return definition;
}

module.exports = { PET_STATS_INDEX_NAME, buildPetStatsIndex };
